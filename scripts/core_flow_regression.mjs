import assert from 'node:assert/strict';

const clone = (value) => JSON.parse(JSON.stringify(value));

function makeState() {
  return {
    students: [
      { id: 's1', name: 'Student One', phone: '0911111111', scheduledBookings: [] },
      { id: 's2', name: 'Student Two', phone: '0922222222', scheduledBookings: [] }
    ],
    payments: [],
    tickets: [],
    slots: [
      { id: 'slot-a', date: '2099-05-20', time: '10:00', typeId: 'private', typeName: 'Private', capacity: 1, bookings: [] },
      { id: 'slot-b', date: '2099-05-21', time: '11:00', typeId: 'private', typeName: 'Private', capacity: 1, bookings: [] },
      { id: 'slot-c', date: '2099-05-22', time: '12:00', typeId: 'group', typeName: 'Group', capacity: 4, bookings: [] }
    ],
    classes: [],
    logs: []
  };
}

function createPayment(state, overrides) {
  const payment = {
    id: overrides.id,
    studentId: overrides.studentId,
    studentName: overrides.studentName,
    phone: overrides.phone,
    typeId: overrides.typeId,
    typeName: overrides.typeName,
    planId: overrides.planId || 'plan',
    planName: overrides.planName || 'Plan',
    sessions: overrides.sessions,
    status: overrides.status || 'unpaid',
    source: overrides.source || 'student_purchase'
  };
  state.payments.push(payment);
  return payment;
}

function createTicketFromPayment(state, payment) {
  if (!payment || payment.status !== 'paid') return null;
  const existing = state.tickets.find((ticket) => String(ticket.paymentId) === String(payment.id));
  if (existing) return existing;
  const ticket = {
    id: `ticket-${payment.id}`,
    paymentId: payment.id,
    studentId: payment.studentId,
    studentName: payment.studentName,
    phone: payment.phone,
    typeId: payment.typeId,
    typeName: payment.typeName,
    total: payment.sessions,
    used: 0,
    left: payment.sessions,
    logs: []
  };
  state.tickets.push(ticket);
  return ticket;
}

function markPaymentPaid(state, paymentId) {
  const payment = state.payments.find((item) => item.id === paymentId);
  assert.ok(payment, `missing payment ${paymentId}`);
  payment.status = 'paid';
  return createTicketFromPayment(state, payment);
}

function addAdminPlan(state, studentId, typeId, sessions) {
  const student = state.students.find((item) => item.id === studentId);
  assert.ok(student, `missing student ${studentId}`);
  const payment = createPayment(state, {
    id: `manual-${studentId}-${typeId}`,
    studentId,
    studentName: student.name,
    phone: student.phone,
    typeId,
    typeName: typeId,
    sessions,
    status: 'paid',
    source: 'admin_manual'
  });
  return createTicketFromPayment(state, payment);
}

function findTicketForSlot(state, studentId, slot) {
  return state.tickets.find((ticket) =>
    ticket.studentId === studentId &&
    ticket.typeId === slot.typeId &&
    Number(ticket.left || 0) > 0
  );
}

function upsertClassForSlot(state, slot) {
  const index = state.classes.findIndex((item) => item.slotId === slot.id);
  const members = slot.bookings.map((booking) => ({
    studentId: booking.studentId,
    studentName: booking.name,
    status: 'pending'
  }));
  if (index >= 0) {
    state.classes[index] = { ...state.classes[index], date: slot.date, time: slot.time, members };
    return;
  }
  state.classes.push({ id: `class-${slot.id}`, slotId: slot.id, date: slot.date, time: slot.time, members });
}

function addBooking(state, studentId, slotId) {
  const student = state.students.find((item) => item.id === studentId);
  const slot = state.slots.find((item) => item.id === slotId);
  assert.ok(student, `missing student ${studentId}`);
  assert.ok(slot, `missing slot ${slotId}`);
  assert.equal(slot.bookings.some((booking) => booking.studentId === studentId), false, 'duplicate booking should be rejected');
  assert.ok(slot.bookings.length < slot.capacity, 'slot should have capacity');
  const ticket = findTicketForSlot(state, studentId, slot);
  assert.ok(ticket, 'student should have a matching usable ticket');

  slot.bookings.push({ studentId, name: student.name, slotId, typeId: slot.typeId, date: slot.date, time: slot.time });
  ticket.left -= 1;
  ticket.used += 1;
  ticket.logs.push({ action: 'booking_deduct', slotIds: [slotId] });
  student.scheduledBookings.push({ slotId, date: slot.date, time: slot.time, typeId: slot.typeId, status: 'booked' });
  upsertClassForSlot(state, slot);
}

function refundTicketForSlot(state, studentId, slot) {
  const ticket = state.tickets.find((item) =>
    item.studentId === studentId &&
    item.typeId === slot.typeId &&
    item.logs.some((log) => (log.slotIds || []).includes(slot.id))
  );
  assert.ok(ticket, 'refund should target original ticket');
  ticket.left += 1;
  ticket.used = Math.max(0, ticket.used - 1);
  ticket.logs.push({ action: 'refund', slotIds: [slot.id] });
}

function cancelBooking(state, studentId, slotId, { refund = true } = {}) {
  const student = state.students.find((item) => item.id === studentId);
  const slot = state.slots.find((item) => item.id === slotId);
  assert.ok(student, `missing student ${studentId}`);
  assert.ok(slot, `missing slot ${slotId}`);

  slot.bookings = slot.bookings.filter((booking) => booking.studentId !== studentId);
  student.scheduledBookings = student.scheduledBookings.filter((booking) => booking.slotId !== slotId);
  state.classes = state.classes
    .map((klass) => klass.slotId === slotId
      ? { ...klass, members: klass.members.filter((member) => member.studentId !== studentId) }
      : klass)
    .filter((klass) => klass.members.length > 0);
  state.logs = state.logs
    .map((log) => log.slotId === slotId
      ? { ...log, studentIds: (log.studentIds || []).filter((id) => id !== studentId) }
      : log)
    .filter((log) => (log.studentIds || []).length > 0);
  if (refund) refundTicketForSlot(state, studentId, slot);
}

function moveBooking(state, studentId, fromSlotId, toSlotId) {
  const beforeTickets = clone(state.tickets);
  const student = state.students.find((item) => item.id === studentId);
  const fromSlot = state.slots.find((item) => item.id === fromSlotId);
  const toSlot = state.slots.find((item) => item.id === toSlotId);
  assert.equal(fromSlot.typeId, toSlot.typeId, 'move target should use same class type');
  const booking = fromSlot.bookings.find((item) => item.studentId === studentId);
  assert.ok(booking, 'source booking should exist');

  fromSlot.bookings = fromSlot.bookings.filter((item) => item.studentId !== studentId);
  toSlot.bookings.push({ ...booking, slotId: toSlotId, date: toSlot.date, time: toSlot.time });
  student.scheduledBookings = student.scheduledBookings.map((item) =>
    item.slotId === fromSlotId ? { ...item, slotId: toSlotId, date: toSlot.date, time: toSlot.time } : item
  );
  state.classes = state.classes
    .map((klass) => klass.slotId === fromSlotId
      ? { ...klass, members: klass.members.filter((member) => member.studentId !== studentId) }
      : klass)
    .filter((klass) => klass.members.length > 0);
  upsertClassForSlot(state, toSlot);
  assert.deepEqual(state.tickets.map(({ left, used }) => ({ left, used })), beforeTickets.map(({ left, used }) => ({ left, used })), 'move should not change ticket counts');
}

function deleteSlot(state, slotId) {
  const slot = state.slots.find((item) => item.id === slotId);
  assert.ok(slot, `missing slot ${slotId}`);
  const bookings = [...slot.bookings];
  bookings.forEach((booking) => cancelBooking(state, booking.studentId, slotId));
  state.slots = state.slots.filter((item) => item.id !== slotId);
  state.classes = state.classes.filter((item) => item.slotId !== slotId);
  state.logs = state.logs.filter((item) => item.slotId !== slotId);
}

function deletePayment(state, paymentId) {
  const linkedTickets = state.tickets.filter((ticket) => ticket.paymentId === paymentId);
  linkedTickets.forEach((ticket) => {
    const slotIds = new Set(ticket.logs.flatMap((log) => log.slotIds || []));
    slotIds.forEach((slotId) => {
      const slot = state.slots.find((item) => item.id === slotId);
      if (slot?.bookings.some((booking) => booking.studentId === ticket.studentId)) {
        cancelBooking(state, ticket.studentId, slotId, { refund: false });
      }
    });
  });
  state.tickets = state.tickets.filter((ticket) => ticket.paymentId !== paymentId);
  state.payments = state.payments.filter((payment) => payment.id !== paymentId);
}

function deleteStudent(state, studentId) {
  state.slots.forEach((slot) => {
    slot.bookings = slot.bookings.filter((booking) => booking.studentId !== studentId);
  });
  state.classes = state.classes
    .map((klass) => ({ ...klass, members: klass.members.filter((member) => member.studentId !== studentId) }))
    .filter((klass) => klass.members.length > 0);
  state.logs = state.logs
    .map((log) => ({ ...log, studentIds: (log.studentIds || []).filter((id) => id !== studentId) }))
    .filter((log) => (log.studentIds || []).length > 0);
  state.tickets = state.tickets.filter((ticket) => ticket.studentId !== studentId);
  state.payments = state.payments.filter((payment) => payment.studentId !== studentId);
  state.students = state.students.filter((student) => student.id !== studentId);
}

function assertNoReferences(state, studentId) {
  assert.equal(state.students.some((student) => student.id === studentId), false, 'student should be removed');
  assert.equal(state.payments.some((payment) => payment.studentId === studentId), false, 'student payments should be removed');
  assert.equal(state.tickets.some((ticket) => ticket.studentId === studentId), false, 'student tickets should be removed');
  assert.equal(state.slots.some((slot) => slot.bookings.some((booking) => booking.studentId === studentId)), false, 'student bookings should be removed');
  assert.equal(state.classes.some((klass) => klass.members.some((member) => member.studentId === studentId)), false, 'student classes should be removed');
  assert.equal(state.logs.some((log) => (log.studentIds || []).includes(studentId)), false, 'student logs should be removed');
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('student purchase stays unusable until paid', () => {
  const state = makeState();
  createPayment(state, { id: 'p1', studentId: 's1', studentName: 'Student One', phone: '0911111111', typeId: 'private', typeName: 'Private', sessions: 1 });
  assert.equal(state.payments.length, 1);
  assert.equal(state.payments[0].status, 'unpaid');
  assert.equal(state.tickets.length, 0);
  markPaymentPaid(state, 'p1');
  assert.equal(state.tickets.length, 1);
  assert.equal(state.tickets[0].left, 1);
  markPaymentPaid(state, 'p1');
  assert.equal(state.tickets.length, 1, 'paid payment should not create duplicate tickets');
});

test('admin manual plan is paid and creates exactly one ticket', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 10);
  assert.equal(state.payments.length, 1);
  assert.equal(state.payments[0].status, 'paid');
  assert.equal(state.tickets.length, 1);
  assert.equal(state.tickets[0].left, 10);
  createTicketFromPayment(state, state.payments[0]);
  assert.equal(state.tickets.length, 1);
});

test('booking deducts correct ticket and creates related records', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 1);
  addBooking(state, 's1', 'slot-a');
  assert.equal(state.tickets[0].left, 0);
  assert.equal(state.tickets[0].used, 1);
  assert.equal(state.slots[0].bookings.length, 1);
  assert.equal(state.students[0].scheduledBookings.length, 1);
  assert.equal(state.classes.length, 1);
  assert.throws(() => addBooking(state, 's1', 'slot-a'), /duplicate booking|capacity/);
});

test('cancel removes booking artifacts and refunds original ticket', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 1);
  addBooking(state, 's1', 'slot-a');
  state.logs.push({ id: 'log-a', slotId: 'slot-a', studentIds: ['s1'] });
  cancelBooking(state, 's1', 'slot-a');
  assert.equal(state.tickets[0].left, 1);
  assert.equal(state.tickets[0].used, 0);
  assert.equal(state.slots[0].bookings.length, 0);
  assert.equal(state.students[0].scheduledBookings.length, 0);
  assert.equal(state.classes.length, 0);
  assert.equal(state.logs.length, 0);
});

test('move transfers booking without changing ticket counts', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 1);
  addBooking(state, 's1', 'slot-a');
  moveBooking(state, 's1', 'slot-a', 'slot-b');
  assert.equal(state.tickets[0].left, 0);
  assert.equal(state.tickets[0].used, 1);
  assert.equal(state.slots.find((slot) => slot.id === 'slot-a').bookings.length, 0);
  assert.equal(state.slots.find((slot) => slot.id === 'slot-b').bookings.length, 1);
  assert.equal(state.students[0].scheduledBookings[0].slotId, 'slot-b');
});

test('delete slot cancels all bookings and refunds tickets', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'group', 1);
  addAdminPlan(state, 's2', 'group', 1);
  addBooking(state, 's1', 'slot-c');
  addBooking(state, 's2', 'slot-c');
  deleteSlot(state, 'slot-c');
  assert.equal(state.slots.some((slot) => slot.id === 'slot-c'), false);
  assert.deepEqual(state.tickets.map((ticket) => ticket.left), [1, 1]);
  assert.equal(state.classes.some((klass) => klass.slotId === 'slot-c'), false);
});

test('delete payment removes linked ticket artifacts', () => {
  const state = makeState();
  createPayment(state, { id: 'p-delete', studentId: 's1', studentName: 'Student One', phone: '0911111111', typeId: 'private', typeName: 'Private', sessions: 1, status: 'paid' });
  createTicketFromPayment(state, state.payments[0]);
  addBooking(state, 's1', 'slot-a');
  deletePayment(state, 'p-delete');
  assert.equal(state.payments.length, 0);
  assert.equal(state.tickets.length, 0);
  assert.equal(state.slots.find((slot) => slot.id === 'slot-a').bookings.length, 0);
  assert.equal(state.students[0].scheduledBookings.length, 0);
});

test('delete student removes all related private records', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 1);
  addBooking(state, 's1', 'slot-a');
  state.logs.push({ id: 'log-a', slotId: 'slot-a', studentIds: ['s1'] });
  deleteStudent(state, 's1');
  assertNoReferences(state, 's1');
  assert.equal(state.students.length, 1);
});

let passed = 0;
for (const item of tests) {
  item.fn();
  passed += 1;
  console.log(`ok ${passed} - ${item.name}`);
}

console.log(`\n${passed} core flow regression checks passed.`);


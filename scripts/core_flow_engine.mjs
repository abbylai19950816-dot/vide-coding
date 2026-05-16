export const clone = (value) => JSON.parse(JSON.stringify(value));

export function makeState() {
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

function fail(message) {
  throw new Error(message);
}

function requireItem(item, message) {
  if (!item) fail(message);
  return item;
}

export function createPayment(state, overrides) {
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

export function createTicketFromPayment(state, payment) {
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

export function markPaymentPaid(state, paymentId) {
  const payment = requireItem(
    state.payments.find((item) => item.id === paymentId),
    `missing payment ${paymentId}`
  );
  payment.status = 'paid';
  return createTicketFromPayment(state, payment);
}

export function addAdminPlan(state, studentId, typeId, sessions) {
  const student = requireItem(
    state.students.find((item) => item.id === studentId),
    `missing student ${studentId}`
  );
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

export function findTicketForSlot(state, studentId, slot) {
  return state.tickets.find((ticket) =>
    ticket.studentId === studentId &&
    ticket.typeId === slot.typeId &&
    Number(ticket.left || 0) > 0
  );
}

export function upsertClassForSlot(state, slot) {
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

export function addBooking(state, studentId, slotId) {
  const student = requireItem(
    state.students.find((item) => item.id === studentId),
    `missing student ${studentId}`
  );
  const slot = requireItem(
    state.slots.find((item) => item.id === slotId),
    `missing slot ${slotId}`
  );
  if (slot.bookings.some((booking) => booking.studentId === studentId)) fail('duplicate booking should be rejected');
  if (slot.bookings.length >= slot.capacity) fail('slot should have capacity');
  const ticket = requireItem(findTicketForSlot(state, studentId, slot), 'student should have a matching usable ticket');

  slot.bookings.push({ studentId, name: student.name, slotId, typeId: slot.typeId, date: slot.date, time: slot.time });
  ticket.left -= 1;
  ticket.used += 1;
  ticket.logs.push({ action: 'booking_deduct', slotIds: [slotId] });
  student.scheduledBookings.push({ slotId, date: slot.date, time: slot.time, typeId: slot.typeId, status: 'booked' });
  upsertClassForSlot(state, slot);
}

export function refundTicketForSlot(state, studentId, slot) {
  const ticket = requireItem(
    state.tickets.find((item) =>
      item.studentId === studentId &&
      item.typeId === slot.typeId &&
      item.logs.some((log) => (log.slotIds || []).includes(slot.id))
    ),
    'refund should target original ticket'
  );
  ticket.left += 1;
  ticket.used = Math.max(0, ticket.used - 1);
  ticket.logs.push({ action: 'refund', slotIds: [slot.id] });
}

export function cancelBooking(state, studentId, slotId, { refund = true } = {}) {
  const student = requireItem(
    state.students.find((item) => item.id === studentId),
    `missing student ${studentId}`
  );
  const slot = requireItem(
    state.slots.find((item) => item.id === slotId),
    `missing slot ${slotId}`
  );

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

export function moveBooking(state, studentId, fromSlotId, toSlotId) {
  const beforeTickets = clone(state.tickets);
  const student = requireItem(
    state.students.find((item) => item.id === studentId),
    `missing student ${studentId}`
  );
  const fromSlot = requireItem(
    state.slots.find((item) => item.id === fromSlotId),
    `missing source slot ${fromSlotId}`
  );
  const toSlot = requireItem(
    state.slots.find((item) => item.id === toSlotId),
    `missing target slot ${toSlotId}`
  );
  if (fromSlot.typeId !== toSlot.typeId) fail('move target should use same class type');
  const booking = requireItem(
    fromSlot.bookings.find((item) => item.studentId === studentId),
    'source booking should exist'
  );

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

  const beforeCounts = beforeTickets.map(({ left, used }) => ({ left, used }));
  const afterCounts = state.tickets.map(({ left, used }) => ({ left, used }));
  if (JSON.stringify(afterCounts) !== JSON.stringify(beforeCounts)) fail('move should not change ticket counts');
}

export function deleteSlot(state, slotId) {
  const slot = requireItem(
    state.slots.find((item) => item.id === slotId),
    `missing slot ${slotId}`
  );
  const bookings = [...slot.bookings];
  bookings.forEach((booking) => cancelBooking(state, booking.studentId, slotId));
  state.slots = state.slots.filter((item) => item.id !== slotId);
  state.classes = state.classes.filter((item) => item.slotId !== slotId);
  state.logs = state.logs.filter((item) => item.slotId !== slotId);
}

export function deletePayment(state, paymentId) {
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

export function deleteStudent(state, studentId) {
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

export function hasStudentReferences(state, studentId) {
  return (
    state.students.some((student) => student.id === studentId) ||
    state.payments.some((payment) => payment.studentId === studentId) ||
    state.tickets.some((ticket) => ticket.studentId === studentId) ||
    state.slots.some((slot) => slot.bookings.some((booking) => booking.studentId === studentId)) ||
    state.classes.some((klass) => klass.members.some((member) => member.studentId === studentId)) ||
    state.logs.some((log) => (log.studentIds || []).includes(studentId))
  );
}

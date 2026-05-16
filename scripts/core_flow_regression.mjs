import assert from 'node:assert/strict';
import {
  addAdminPlan,
  addBooking,
  canPurchasePlan,
  cancelBooking,
  createPayment,
  createTicketFromPayment,
  deletePayment,
  deleteSlot,
  deleteStudent,
  deleteTicket,
  getBookingAvailabilityState,
  hasStudentReferences,
  makeState,
  markPaymentPaid,
  moveBooking,
  repairExistingBooking
} from './core_flow_engine.mjs';

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

test('once-only plan cannot be purchased twice by the same student', () => {
  const state = makeState();
  assert.deepEqual(canPurchasePlan(state, { studentId: 's1', typeId: 'private', planId: 'trial-private', onceOnly: true }), { ok: true, reason: 'allowed' });
  createPayment(state, { id: 'trial-1', studentId: 's1', studentName: 'Student One', phone: '0911111111', typeId: 'private', typeName: 'Private', planId: 'trial-private', planName: 'Trial', sessions: 1, status: 'paid', onceOnly: true });
  createTicketFromPayment(state, state.payments[0]);
  assert.deepEqual(canPurchasePlan(state, { studentId: 's1', typeId: 'private', planId: 'trial-private', onceOnly: true }), { ok: false, reason: 'once-only-already-purchased' });
  assert.deepEqual(canPurchasePlan(state, { studentId: 's2', typeId: 'private', planId: 'trial-private', onceOnly: true }), { ok: true, reason: 'allowed' });
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

test('availability distinguishes no ticket from no matching class slots', () => {
  const state = makeState();
  assert.deepEqual(getBookingAvailabilityState(state, 's1', 'private'), { ok: false, reason: 'no-usable-ticket' });
  addAdminPlan(state, 's1', 'private', 1);
  state.slots = state.slots.filter((slot) => slot.typeId !== 'private');
  assert.deepEqual(getBookingAvailabilityState(state, 's1', 'private'), { ok: false, reason: 'no-matching-slots' });
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

test('cancel is idempotent and does not refund twice after artifacts are gone', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 1);
  addBooking(state, 's1', 'slot-a');
  cancelBooking(state, 's1', 'slot-a');
  cancelBooking(state, 's1', 'slot-a');
  assert.equal(state.tickets[0].left, 1);
  assert.equal(state.tickets[0].used, 0);
});

test('cancel refunds matching class type ticket when student has multiple ticket types', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 1);
  addAdminPlan(state, 's1', 'group', 1);
  addBooking(state, 's1', 'slot-a');
  cancelBooking(state, 's1', 'slot-a');
  const privateTicket = state.tickets.find((ticket) => ticket.typeId === 'private');
  const groupTicket = state.tickets.find((ticket) => ticket.typeId === 'group');
  assert.equal(privateTicket.left, 1);
  assert.equal(privateTicket.used, 0);
  assert.equal(groupTicket.left, 1);
  assert.equal(groupTicket.used, 0);
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

test('delete payment preserves same-phone different-student artifacts', () => {
  const state = makeState();
  state.students[1].phone = '0911111111';
  createPayment(state, { id: 'p-one', studentId: 's1', studentName: 'Student One', phone: '0911111111', typeId: 'private', typeName: 'Private', sessions: 1, status: 'paid' });
  createTicketFromPayment(state, state.payments[0]);
  addAdminPlan(state, 's2', 'group', 1);
  addBooking(state, 's1', 'slot-a');
  addBooking(state, 's2', 'slot-c');
  deletePayment(state, 'p-one');
  assert.equal(state.payments.length, 1);
  assert.equal(state.payments[0].studentId, 's2');
  assert.equal(state.tickets.length, 1);
  assert.equal(state.tickets[0].studentId, 's2');
  assert.equal(state.slots.find((slot) => slot.id === 'slot-a').bookings.length, 0);
  assert.equal(state.slots.find((slot) => slot.id === 'slot-c').bookings.length, 1);
  assert.equal(state.students.find((student) => student.id === 's2').scheduledBookings.length, 1);
  assert.equal(state.classes.length, 1);
  assert.equal(state.classes[0].members[0].studentId, 's2');
});

test('delete ticket removes linked booking artifacts but keeps payment record', () => {
  const state = makeState();
  createPayment(state, { id: 'p-ticket', studentId: 's1', studentName: 'Student One', phone: '0911111111', typeId: 'private', typeName: 'Private', sessions: 1, status: 'paid' });
  createTicketFromPayment(state, state.payments[0]);
  addBooking(state, 's1', 'slot-a');
  deleteTicket(state, 'ticket-p-ticket');
  assert.equal(state.payments.length, 1);
  assert.equal(state.tickets.length, 0);
  assert.equal(state.slots.find((slot) => slot.id === 'slot-a').bookings.length, 0);
  assert.equal(state.students[0].scheduledBookings.length, 0);
  assert.equal(state.classes.length, 0);
});

test('repair existing booking restores scheduled record ticket deduction and class', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 1);
  const slot = state.slots.find((item) => item.id === 'slot-a');
  slot.bookings.push({ studentId: 's1', name: 'Student One', slotId: 'slot-a', typeId: 'private', date: slot.date, time: slot.time });
  const summary = repairExistingBooking(state, 'slot-a', 's1');
  assert.deepEqual(summary, { scheduled: 1, deducted: 1, classes: 1 });
  assert.equal(state.students[0].scheduledBookings.length, 1);
  assert.equal(state.tickets[0].left, 0);
  assert.equal(state.tickets[0].used, 1);
  assert.equal(state.classes.length, 1);

  const secondSummary = repairExistingBooking(state, 'slot-a', 's1');
  assert.deepEqual(secondSummary, { scheduled: 0, deducted: 0, classes: 0 });
});

test('delete student removes all related private records', () => {
  const state = makeState();
  addAdminPlan(state, 's1', 'private', 1);
  addBooking(state, 's1', 'slot-a');
  state.logs.push({ id: 'log-a', slotId: 'slot-a', studentIds: ['s1'] });
  deleteStudent(state, 's1');
  assert.equal(hasStudentReferences(state, 's1'), false);
  assert.equal(state.students.length, 1);
});

test('delete student uses explicit id and preserves same-name different-phone student', () => {
  const state = makeState();
  state.students[1].name = 'Student One';
  addAdminPlan(state, 's1', 'private', 1);
  addAdminPlan(state, 's2', 'group', 1);
  deleteStudent(state, 's1');
  assert.equal(hasStudentReferences(state, 's1'), false);
  assert.equal(state.students.length, 1);
  assert.equal(state.students[0].id, 's2');
  assert.equal(state.tickets.length, 1);
  assert.equal(state.tickets[0].studentId, 's2');
});

test('delete student uses explicit id and preserves same-phone different-name student', () => {
  const state = makeState();
  state.students[1].phone = '0911111111';
  addAdminPlan(state, 's1', 'private', 1);
  addAdminPlan(state, 's2', 'group', 1);
  deleteStudent(state, 's1');
  assert.equal(hasStudentReferences(state, 's1'), false);
  assert.equal(state.students.length, 1);
  assert.equal(state.students[0].id, 's2');
  assert.equal(state.students[0].phone, '0911111111');
  assert.equal(state.tickets.length, 1);
  assert.equal(state.tickets[0].studentId, 's2');
});

let passed = 0;
for (const item of tests) {
  item.fn();
  passed += 1;
  console.log(`ok ${passed} - ${item.name}`);
}

console.log(`\n${passed} core flow regression checks passed.`);

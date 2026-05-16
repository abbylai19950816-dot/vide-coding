import assert from 'node:assert/strict';
import {
  addAdminPlan,
  addBooking,
  cancelBooking,
  createPayment,
  createTicketFromPayment,
  deletePayment,
  deleteSlot,
  deleteStudent,
  hasStudentReferences,
  makeState,
  markPaymentPaid,
  moveBooking
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
  assert.equal(hasStudentReferences(state, 's1'), false);
  assert.equal(state.students.length, 1);
});

let passed = 0;
for (const item of tests) {
  item.fn();
  passed += 1;
  console.log(`ok ${passed} - ${item.name}`);
}

console.log(`\n${passed} core flow regression checks passed.`);

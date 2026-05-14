# Data Model

## Firestore Documents

### `public_booking/state`

Public mirror used by the student page.

Expected data:

- `slots`: future public schedule and minimal booking occupancy.
- `booking_cfg`: public booking configuration.
- `updatedAt`: timestamp.
- `reason`: sync reason.

Cost rule: keep this document small. If it approaches 700 KiB, split by month.

### `student_lookup/{hash}`

Per-student lookup document keyed by normalized `name|phone` SHA-256.

Expected data:

- `studentId`
- `name`
- `phoneMasked`
- `remainingByType`
- `totalRemaining`
- `usedOncePlanIds`
- `usedOncePlanKeys`
- `noRecurringTypeIds`
- `unresolvedTickets`
- `updatedAt`

Rules:

- Student page may get one document.
- Student page must not list this collection.
- Admin sync owns writes.

### `phone_lookup/{hash}`

Public single-document phone index keyed by normalized phone SHA-256.

Expected data:

- `exists: true`
- `phoneMasked`
- `updatedAt`

Rules:

- Student page may get one document before purchase submission to prevent duplicate phone registration.
- Student page must not list this collection.
- This document must not expose student name, full phone, payments, tickets, or private notes.
- Admin sync owns writes.

### `/data/{key}`

Legacy private single-document arrays:

- `/data/students`
- `/data/tickets`
- `/data/payments`
- `/data/classes`
- `/data/course_logs`
- `/data/slots`
- `/data/booking_cfg`

Rules:

- Admin page may read/write.
- Student page should not bulk-read these documents for normal display.
- Booking transaction may touch only the required documents until a backend exists.

#### `/data/payments` discount fields

Payment records store the actual receivable amount after any custom discount. Course plans remain the source for sessions and validity; discounts must not change ticket sessions.

Expected payment amount fields:

- `phone`: student phone copied onto the payment when available, used by the admin finance UI to disambiguate same-name students.
- `originalAmount`: original course/package price before discount.
- `discountAmount`: custom discount amount. Clamp to `0 <= discountAmount <= originalAmount`.
- `discountReason`: short admin note for the custom offer, such as old-student discount, event offer, or friend referral.
- `amount`: net receivable amount after discount, calculated as `originalAmount - discountAmount`.

Rules:

- Admin payment detail may edit discount fields.
- Admin finance lists and payment detail should display student phone. Older payment records without `phone` may resolve phone from `/data/students` on the admin page only.
- If a paid payment already created a linked ticket, updating the discount only updates the linked ticket `price`; it does not create another ticket and does not change `total`, `left`, `expireDate`, or plan identity.
- Student purchase requests still submit the public plan amount only. Admin imports them as unpaid payments with `discountAmount: 0`; any custom offer is applied later by admin.
- No student page reads or writes are added for discounts.

### `purchase_requests/{requestId}`

Public create-only buffer for student purchase submissions.

Expected data:

- `name`
- `phone`
- `phoneDigits`
- `social`
- `note`
- `customFields`
- `typeId`
- `typeName`
- `planId`
- `planName`
- `sessions`
- `amount`
- `oncePerStudent`
- `allowRecurring`
- `date`
- `status: pending`
- `createdAt`
- `source`

Rules:

- Student page may create only.
- Student page may not read, list, update, or delete.
- Admin page imports pending requests in the background and converts them into `/data/students` plus `/data/payments`.

### `booking_requests/{requestId}`

Public create-only buffer for student booking submissions.

Expected data:

- `lookupKey`
- `slotIds`
- `typeId`
- `remainingKey`
- `bookingName`
- `studentId`
- `typeKey`
- `status: pending`
- `createdAt`
- `source`

Rules:

- Student page may create only.
- Student page may not read, list, update, or delete.
- Admin page imports pending requests in the background, validates capacity and ticket availability, then updates private data and public mirrors.

## localStorage

localStorage keys beginning with `pilates_` are cache only. They must not become the source of truth for booking correctness.

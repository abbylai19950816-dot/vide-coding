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
- `unresolvedTickets`
- `updatedAt`

Rules:

- Student page may get one document.
- Student page must not list this collection.
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

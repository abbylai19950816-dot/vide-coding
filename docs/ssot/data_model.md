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

#### Payment deletion cascade

Admin `delete payment` is for test data, mistaken entries, or transactions that should be treated as never having existed.

When deleting a payment, the system must remove data derived from that payment:

- `/data/payments`: remove the payment record.
- `/data/tickets`: remove tickets whose `paymentId` or `sourcePaymentId` matches the payment.
- `/data/slots`: remove bookings created by those tickets, using ticket log `slotIds`.
- `/data/students`: remove matching `scheduledBookings`.
- `/data/classes`: remove matching attendance members; remove an empty class row if no members remain.
- `/data/course_logs`: remove the matching student from the course log; remove the whole log if no students remain.
- `student_lookup` / `phone_lookup`: update through the existing low-cost sync path so the student page no longer sees deleted plans.

This delete path intentionally erases history. It should be used for incorrect or test records, not normal refunds.

#### Booking ticket deduction and refund logs

When a booking consumes a ticket, the ticket log should include the related slot id:

- `log[]` / `logs[]`: append an item with `action`, `date`, `slotIds`, optional request/source fields, and `note`.
- `slotIds`: array of `/data/slots` ids affected by that ticket change.

Rules:

- Canceling one booking or deleting a calendar slot must first find the original ticket by matching `studentId` and `slotIds`.
- If old data does not have `slotIds`, fallback may use the same student plus matching `typeId` / course type.
- Do not refund by student name alone except as a legacy last resort when the booking has no `studentId` and no phone.
- When deleting a calendar slot, remove the same booking from the student's `scheduledBookings` using the resolved student id and exact slot id.

#### Future refund / void workflow

正式營運需要另一個行為：「退款 / 作廢方案」。

Refund or void should preserve historical records instead of deleting them:

- Keep original payment, booking, attendance, and course logs for audit history.
- Mark the payment or ticket with a status such as `refunded`, `voided`, or `cancelled`.
- Make remaining sessions unavailable for future booking.
- Keep past attendance and course logs visible to admins.
- Student lookup should exclude unavailable sessions, but admin history should remain traceable.

This workflow is not implemented yet. Do not reuse `delete payment` as the long-term refund workflow.

#### Data health check

管理員端設定頁提供 `資料一致性檢查`。這是 read-only 工具，用來找出收費、票券、預約、行事曆、出缺勤與課程日誌之間的不同步狀況。

第一版檢查範圍：

- 重複手機號碼。
- 收費紀錄找不到學員。
- 已收款但沒有對應票券。
- 同一筆收費產生多張票券。
- 已收款但堂數資訊不明。
- 票券找不到學員。
- 票券 `left`、`used`、`total` 數字不一致。
- 行事曆有預約但學員 `scheduledBookings` 沒有同步。
- 學員 `scheduledBookings` 指向不存在的時段，或行事曆名單沒有該學員。
- 預約缺少含 `slotIds` 的票券扣堂紀錄。
- 已發生預約沒有對應課程日誌。
- 出缺勤或課程日誌成員找不到學員。

Rules:

- This tool must not write Firestore data.
- This tool may read existing admin-side local cache loaded from `/data/*`; it must not add student-side reads.
- Repair tools must remain separate from health check results. The admin should review severe issues before any automatic repair is introduced.
- Future repair actions must write their own worklog and clearly state which source of truth is used to rebuild derived data.

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

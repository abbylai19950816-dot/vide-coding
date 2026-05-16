# Product Scope

## Purpose

Gyrobooking is a low-cost Pilates booking system for:

- students to buy classes, check remaining sessions, and book available slots;
- admins to manage students, tickets, payments, schedules, attendance, and public booking data.

## User Roles

- Student: uses `index.html`; should only access public booking data and their own lookup result.
- Admin: uses `admin.html`; manages private operational data.
- Maintainer: updates files, packages releases, deploys to GitHub Pages/Firebase, and records work logs.

## Current Operating Principles

- Keep the student page cheap and simple.
- Keep private data off the public student read path.
- Keep booking correctness inside Firestore transaction boundaries.
- Use docs as SSOT when code behavior changes.
- A phone number can belong to only one registered student. Public duplicate checks use `phone_lookup/{hash}` and must not expose private student data.
- Student phone validation should be friendly and strict: purchase and booking lookup forms accept exactly 10 digits and require the number to start with `09`; Firebase permission errors must not be shown to students as raw English messages.
- After a student submits a purchase request, the success/contact-teacher context should remain available while they move to the schedule page. This state may be stored in `sessionStorage` only and must not add Firestore reads or writes.
- 管理員學員搜尋可用姓名或手機查詢；手機搜尋必須支援含分隔符與純數字輸入，例如 `0928-964-118` 與 `0928964118` 都能找到同一位學員。
- Course plans may be marked `oncePerStudent` for trial classes; once used, the same student cannot purchase that plan again from the student page.
- Course plans may set `allowRecurring: false`; student-side loop booking should be hidden and blocked for those active plans.
- 學員若同時擁有多個有效課程類型，例如一對一與一對二，預約頁查詢方案後必須讓學員切換課程類型；不得只自動顯示其中一種，避免誤以為其他方案消失。
- 日期與時間判斷以使用者裝置當地時間為準；不要在前端硬加固定 UTC+8。

## Future Identity Direction

- LINE Login is the preferred long-term identity upgrade because it can identify the same student by LINE user id instead of asking students to remember an extra lookup code.
- LINE Login should be treated as an identity-system upgrade, not a small UI change.
- The future student experience should prioritize `使用 LINE 登入` for lookup, purchase, and booking, while keeping a fallback path for students who cannot or do not want to use LINE.
- Fallback identity may remain `姓名 + 手機` or another teacher-assisted verification path; do not make lookup code the only fallback unless the workflow is redesigned with the teacher.
- The system must not expose raw LINE user id to public documents. Store only a hash or backend-owned mapping such as `line_lookup/{lineUserIdHash}`.
- Purchase requests and booking requests may later include `lineUserIdHash` so admin import can safely attach purchases and bookings to the same student.
- Before implementing LINE Login, define backend callback handling, Firestore rules, budget alerts, and rollback/fallback behavior in SSOT.

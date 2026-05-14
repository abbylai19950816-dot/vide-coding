# Decision Log

## 2026-05-14: Keep Only Latest Active Version In Main Workspace

Decision: keep the latest v17 project as the active working copy and move historical zip packages into `archive_versions`.

Reason: old packages are useful for rollback, but keeping all of them at the root makes the project harder to understand and increases the chance of editing the wrong version.

## 2026-05-14: Add Project Skill For Cost Guardrails

Decision: add `gyrobooking-low-cost` skill and install it into Codex skills.

Reason: future edits must remember Firestore read/write cost, student/admin data boundaries, and worklog requirements.

## 2026-05-14: Use Device Local Time For Frontend Date Logic

Decision: student purchase dates, booking ticket deductions, admin calendar month defaults, attendance quick dates, and ticket expiration calculations should use the user's device local time.

Reason: the maintainer may be in Taiwan, but students/admins can open the system from other time zones such as Japan. Fixed UTC+8 offsets and `toISOString()` date slicing can shift dates incorrectly.

## 2026-05-14: Separate Public Mirror From Private Tenant Data

Decision: student-facing devices should read only public mirror documents plus one direct `student_lookup` document, while private student/payment/ticket/attendance data should become admin-only and tenant-scoped.

Reason: students may use many devices and must see the latest schedule, but student personal data must not leak. Future multi-teacher support also requires tenant isolation so teachers cannot read each other's students.

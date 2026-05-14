# Decision Log

## 2026-05-14: Keep Only Latest Active Version In Main Workspace

Decision: keep the latest v17 project as the active working copy and move historical zip packages into `archive_versions`.

Reason: old packages are useful for rollback, but keeping all of them at the root makes the project harder to understand and increases the chance of editing the wrong version.

## 2026-05-14: Add Project Skill For Cost Guardrails

Decision: add `gyrobooking-low-cost` skill and install it into Codex skills.

Reason: future edits must remember Firestore read/write cost, student/admin data boundaries, and worklog requirements.


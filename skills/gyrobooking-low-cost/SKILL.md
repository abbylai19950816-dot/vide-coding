---
name: gyrobooking-low-cost
description: Project-specific guardrails for the Gyrobooking Pilates booking system. Use whenever Codex works on this project, especially before editing index.html, admin.html, firestore.rules, Firebase/Firestore calls, localStorage sync, booking flows, ticket deduction, public booking mirrors, student lookup, or deployment packaging, to avoid expensive Firestore read/write patterns and unsafe public writes.
---

# Gyrobooking Low-Cost Guardrails

Before changing this project, inspect the relevant current files first:

- `docs/skill/README.md` (project skill SSOT for new-chat and deployment rules)
- `docs/ssot/core_data_flows.md` (mandatory source of truth for purchase, payment, ticket, booking, cancel, move, slot delete, attendance, logs, and student lookup flows)
- `active/gyrobooking_current/github_pages/index.html` or the active `github_pages/index.html`
- `active/gyrobooking_current/github_pages/admin.html` or the active `github_pages/admin.html`
- `firestore.rules`
- `docs/firestore_cost_guardrails.md` if present
- `docs/ssot/README.md` if present

## Non-negotiable cost rules

- Keep the student page low-read: initial load should read only `public_booking/state` and `web_config/flags`.
- Use `student_lookup/{hash}` for student verification. Do not bulk-read students, tickets, or payments on the student page.
- Do not add `getDocs()` or collection-wide `onSnapshot()` to the student page.
- Treat localStorage as cache only. Firestore transaction or admin data is the source of truth.
- Do not write `students`, `tickets`, `payments`, `slots`, and `classes` separately from the student page unless the whole booking operation is inside one transaction.
- Use hash/diff checks before rewriting `public_booking/state` or many `student_lookup` documents.
- Keep admin listeners single-init and debounced. Never create listeners from render functions.

## Booking flow rules

- Before adding, modifying, removing, or securing any feature, verify the core flow in `docs/ssot/core_data_flows.md` has not drifted.
- Regression checks must cover purchase requests, manual admin plan creation, payment-to-ticket creation, booking import, cancel, move, slot delete, attendance, course logs, and `student_lookup` / `public_booking` sync when affected.
- Student purchase flow: student-side plan purchase creates a pending purchase/payment path first; no usable ticket appears until admin marks payment as paid.
- Admin manual plan flow: adding a plan from the student detail page defaults to paid and should create exactly one payment and one ticket.
- Single booking and loop booking must share the same low-cost transaction shape.
- A booking transaction may read: `public_booking/state`, `student_lookup/{hash}`, `/data/tickets`, `/data/students`.
- A booking transaction may write: `public_booking/state`, `/data/slots`, `/data/tickets`, `/data/students`, `student_lookup/{hash}`.
- Reject changes that update only localStorage first and rely on later sync for correctness.
- After booking, update public slot capacity, ticket deduction, student scheduled bookings, and lookup remaining counts together.

## Security rules

- Do not leave broad `allow write: if true` on private data in production-facing rules.
- Never allow public list on `student_lookup`.
- Public reads are acceptable for `public_booking/state` and limited config flags.
- `/data/*`, `web_config/flags` writes, and lookup writes should be admin-only unless the user explicitly accepts a temporary test-mode risk.

## Review checklist

Before finishing, search the changed files for:

- `getDocs(`
- `onSnapshot(`
- `setDoc(`
- `updateDoc(`
- `writeBatch(`
- `runTransaction(`
- `localStorage.setItem`
- `saveSlots(`
- `saveTickets(`
- `saveStudents(`
- `saveClasses(`

Explain any new Firestore read/write path and estimate whether it changes the student-side read/write budget.

## Required documentation after file changes

- Create or update a work log in `docs/worklog/` for every session that changes files.
- Use filename format `YYYY-MM-DD_HHMM_short-topic.md`.
- Include request summary, files changed, behavior changed, Firestore read/write impact, verification performed, and follow-up risks.
- Write future specs, SSOT documents, technical notes, and work logs primarily in Traditional Chinese.
- Keep code identifiers, file paths, API names, Firestore collection/document paths, CLI commands, config keys, and other technical parameters in English when that is clearer or required.
- If the change affects product behavior, data shape, deployment, security, or cost, update the relevant SSOT file in `docs/ssot/` in the same session.
- If the change affects implementation patterns, tooling, release process, or environment setup, update `docs/technical/`.
- Do not finish a file-changing task without mentioning the work log path.

## Packaging and archive rules

- Treat `active/gyrobooking_current` as the working copy unless the user explicitly chooses another version.
- GitHub Pages serves the repository root `index.html` and `admin.html`; after editing active `github_pages/index.html` or `github_pages/admin.html`, sync the matching root file before commit/push.
- After pushing UI changes, verify the live GitHub Pages file contains the expected feature string/function before asking the user to retest.
- If the live site does not update, inspect GitHub Pages build status before blaming browser cache.
- Keep historical zip packages in `archive_versions`; do not delete them unless the user explicitly asks.
- Put clean release packages in `current_release`.
- When creating a release package, include only the files needed to run/deploy the project, not historical archives or analysis folders.

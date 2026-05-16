# SSOT Index

This folder is the single source of truth for product, data, deployment, and operational decisions.

## Current Truth

- Current active project folder: `active/gyrobooking_current`
- Current release package: `current_release/gyrobooking_current_clean_v17.zip`
- Archived historical packages: `archive_versions`
- Student-facing entry: `github_pages/index.html`
- Admin entry: `github_pages/admin.html`
- Firestore rules: `active/gyrobooking_current/firestore.rules`
- Codex project skill SSOT: `docs/skill/README.md`

## Required SSOT Files

- `product_scope.md`: product goals, user roles, booking rules.
- `data_model.md`: Firestore documents, localStorage cache keys, ownership of each data field.
- `core_data_flows.md`: source-of-truth flow for purchase, payment, booking, cancel, move, slot delete, attendance, logs, public mirror, and cascade rules.
- `admin_cascade_alignment.md`: alignment plan between production `admin.html` cascade functions and the local `scripts/core_flow_engine.mjs` regression engine.
- `payment_ticket_cleanup.md`: deletion and cascade cleanup rules for payments, tickets, bookings, schedules, attendance, and course logs.
- `cancel_slot_refund.md`: refund rules for cancel booking and delete slot cascades.
- `booking_repair.md`: repair rules for existing slot bookings, scheduled bookings, ticket deductions, and attendance classes.
- `data_health_ui.md`: admin data health report categories, manager action order, repair buttons, and cost/security boundaries.
- `student_lookup_lifecycle.md`: student lookup meaning, write/delete lifecycle, stale lookup cleanup, and low-cost boundaries.
- `security_and_tenancy_plan.md`: Firestore rules, student privacy, public mirror, and future multi-teacher tenant isolation plan.
- `multi_tenant_saas_plan.md`: future multi-teacher SaaS architecture, tenant isolation, routing, auth, migration, and action items.
- `cost_model.md`: future cost items, free-tier guardrails, backend/LINE cost risks, and commercialization budget checks.
- `brand_naming_guidelines.md`: brand naming rules, availability checks, story requirements, and cat mascot integration.
- `regression_checklist.md`: core flow regression checklist and local test command for purchase, payment, booking, cancel, move, delete, and sync behavior.
- `release_process.md`: how to package, upload, deploy, and verify.
- `decision_log.md`: important architecture decisions and why they were made.
- `../skill/README.md`: Codex/new-chat operating rules, low-cost guardrails, and deployment verification checklist.

When a file change modifies behavior, data shape, deployment, security, or cost, update the matching SSOT file in the same work session.

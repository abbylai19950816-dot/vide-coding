# SSOT Index

This folder is the single source of truth for product, data, deployment, and operational decisions.

## Current Truth

- Current active project folder: `active/gyrobooking_current`
- Current release package: `current_release/gyrobooking_current_clean_v17.zip`
- Archived historical packages: `archive_versions`
- Student-facing entry: `github_pages/index.html`
- Admin entry: `github_pages/admin.html`
- Firestore rules: `active/gyrobooking_current/firestore.rules`

## Required SSOT Files

- `product_scope.md`: product goals, user roles, booking rules.
- `data_model.md`: Firestore documents, localStorage cache keys, ownership of each data field.
- `release_process.md`: how to package, upload, deploy, and verify.
- `decision_log.md`: important architecture decisions and why they were made.

When a file change modifies behavior, data shape, deployment, security, or cost, update the matching SSOT file in the same work session.

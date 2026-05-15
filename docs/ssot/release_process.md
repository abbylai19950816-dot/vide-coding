# Release Process

## Current Manual Package Flow

1. Work in `active/gyrobooking_current`.
2. Update related docs in `docs/ssot`, `docs/technical`, and `docs/worklog`.
3. Check Firestore cost guardrails in `docs/firestore_cost_guardrails.md`.
4. Package the active project into `current_release/gyrobooking_current_clean_v{n}.zip`.
5. Deploy `github_pages/index.html` and `github_pages/admin.html` to GitHub Pages.
6. Deploy `firestore.rules` to Firebase.
7. Verify student load, lookup, booking, admin sync, and Firestore usage.

## GitHub Automation Requirement

Codex may upload and publish updates only when one of these is available:

- Git CLI and GitHub CLI are installed and authenticated; or
- the GitHub Codex plugin/connector is installed and authorized.

Until then, Codex can prepare files and release packages, but cannot push or publish by itself.

## GitHub Pages Deployment Notes

- The live GitHub Pages entrypoint is the repository root, especially `index.html` and `admin.html`.
- Keep root `.nojekyll` in the repository so GitHub Pages serves this as a static HTML app instead of running Jekyll over project folders and Markdown docs.
- After pushing to `main`, verify `https://abbylai19950816-dot.github.io/gyrobooking/admin.html` contains the expected feature strings before asking the user to retest.

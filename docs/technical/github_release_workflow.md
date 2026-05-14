# GitHub Release Workflow

## Goal

After each accepted update, Codex should be able to:

1. update files;
2. write a work log;
3. run checks;
4. commit changes;
5. push to GitHub;
6. publish or update the deployed GitHub Pages files.

## Required Tools

One path is required:

- Git + GitHub CLI installed and authenticated locally; or
- GitHub plugin/connector installed in Codex.

## Standard Commit Flow

```text
git status
git add active/ docs/ skills/
git commit -m "Update booking system"
git push
```

## Release Notes

Each release must include:

- summary of changed behavior;
- Firestore read/write impact;
- files changed;
- verification performed;
- rollback package or previous version reference.


# Codex Environment Setup

## Current Gaps Observed

- System `git` command is not available.
- System `gh` command is not available.
- `python` and `py` commands are not available.
- The project root is not currently a Git repository from Codex's view.

## Portable Tools Added

Portable tools were downloaded into this project:

- `tools/git/cmd/git.exe`: Git 2.54.0.windows.1
- `tools/gh/bin/gh.exe`: GitHub CLI 2.92.0

Use these explicit paths when system PATH does not include Git or GitHub CLI.

The browser-based `gh auth login --web` flow did not display the one-time code correctly in this Codex shell, so token-based login is the recommended path for this environment.

## Recommended Setup

Install:

- Git for Windows.
- GitHub CLI.
- Python 3, or make the Codex bundled Python available if configured later.
- Firebase CLI if Firestore rules will be deployed from this machine.

Authenticate:

- `gh auth login`
- Firebase login if using Firebase CLI.

Repository:

- Create or clone the GitHub repository into this workspace.
- Keep `active/gyrobooking_current` as the source folder or promote its contents to repo root.
- Add `archive_versions` only if you want historical packages in Git. Otherwise keep it outside Git or ignore it.

Suggested `.gitignore` later:

```gitignore
archive_versions/
extracted_v*/
*.zip
```

Keep `current_release/*.zip` only if release packages should be versioned.

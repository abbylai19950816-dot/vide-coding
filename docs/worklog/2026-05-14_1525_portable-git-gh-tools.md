# 工作紀錄：加入 portable Git 與 GitHub CLI

## 需求摘要

使用者希望由 Codex 直接下載並執行 Git 與 GitHub CLI，連接指定 GitHub repo：`https://github.com/abbylai19950816-dot/gyrobooking`。

## 變更檔案

- `tools/downloads/MinGit-2.54.0-64-bit.zip`
- `tools/downloads/gh_2.92.0_windows_amd64.zip`
- `tools/git/`
- `tools/gh/`
- `docs/technical/codex_environment_setup.md`
- `docs/worklog/2026-05-14_1525_portable-git-gh-tools.md`

## 行為變更

未修改預約系統程式邏輯。此變更只是在專案內加入 portable Git 與 GitHub CLI，方便後續在沒有系統 PATH 安裝的情況下進行 commit/push。

## Firestore 讀寫影響

無。沒有修改 Firestore 程式碼、rules 或資料同步流程。

## 驗證

- `tools/git/cmd/git.exe --version` 回傳 `git version 2.54.0.windows.1`。
- `tools/gh/bin/gh.exe --version` 回傳 `gh version 2.92.0`。
- `gh auth login --web` 與 `--clipboard` 在此 shell 會等待但不顯示一次性登入代碼，因此改建議使用 token-based login。

## 後續風險

- 需要使用者提供安全的 GitHub token 登入方式，才能 push 到指定 repo。
- token 不應寫入文件或提交到 Git。


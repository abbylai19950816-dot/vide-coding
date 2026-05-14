# 工作紀錄：GitHub 初始提交與推送

## 需求摘要

使用者確認繼續後，將目前整理好的預約系統工作區初始化為 Git repo，連接指定 GitHub repo：`https://github.com/abbylai19950816-dot/gyrobooking`，並準備第一次 commit/push。

## 變更檔案

- `.gitignore`
- `.git/` Git repository metadata
- `README.md`
- `index.html`
- `admin.html`
- `docs/worklog/2026-05-14_1535_github-initial-push.md`

## 行為變更

已將 `active/gyrobooking_current/github_pages/index.html` 與 `admin.html` 同步到 repo 根目錄，供 GitHub Pages 直接使用。另新增 Git 忽略規則與版本控制設定。

## Firestore 讀寫影響

無。沒有修改 Firestore 呼叫、rules、資料模型或同步流程。

## 驗證

- 已確認 staged 清單不包含 `tools/`、`archive_versions/`、`extracted_v17/`、`current_release/` 或任何 zip 檔。
- Git remote 已設定為 `origin https://github.com/abbylai19950816-dot/gyrobooking.git`。
- 遠端 `main` 原本已有 `README.md`、`index.html`、`admin.html`，已用 merge 整合遠端歷史，沒有 force push。
- 根目錄 `index.html` 與 `admin.html` 已由 active 版本覆蓋，避免 GitHub Pages 繼續使用舊版。

## 後續風險

- GitHub token 曾出現在聊天訊息中。首次 push 完成後，建議到 GitHub revoke 該 token，並用新的 token 重新登入 CLI。

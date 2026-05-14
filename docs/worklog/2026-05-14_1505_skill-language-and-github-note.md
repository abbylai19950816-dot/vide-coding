# 工作紀錄：SKILL 文件語言與 GitHub 連線說明

## 需求摘要

使用者希望日後規格文件與工作日誌盡量使用中文撰寫，但技術參數、路徑、API 名稱、設定鍵等可保留英文。同時詢問 ChatGPT 已連線另一個 GitHub 專案時，是否能在此專案指定連接不同 GitHub repo。

## 變更檔案

- `skills/gyrobooking-low-cost/SKILL.md`
- `C:/Users/abby2/.codex/skills/gyrobooking-low-cost/SKILL.md`
- `docs/worklog/2026-05-14_1505_skill-language-and-github-note.md`

## 行為變更

未變更預約系統程式邏輯。此次只更新 Codex 專案工作規則：未來 specs、SSOT、technical notes、work logs 預設使用繁體中文，技術識別字維持英文。

## Firestore 讀寫影響

無。沒有修改 Firestore 呼叫、rules、資料模型或前端同步流程。

## 驗證

- 已更新專案內 SKILL。
- 已同步安裝版 SKILL 到 Codex skills 目錄。

## 後續風險

- GitHub 自動推送仍需要 GitHub plugin/connector 或本機 Git/GitHub CLI 可用。


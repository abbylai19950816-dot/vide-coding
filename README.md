# Gyrobooking 預約系統

這是 Gyrobooking Pilates 預約系統的 GitHub repo。

## 目前主要檔案

- `index.html`：GitHub Pages 學生端入口。
- `admin.html`：GitHub Pages 管理端入口。
- `active/gyrobooking_current/`：目前整理後的完整工作版本。
- `docs/ssot/`：產品、資料模型、發布流程與決策紀錄的 SSOT。
- `docs/technical/`：技術流程與環境設定。
- `docs/worklog/`：每次 Codex 變更檔案後的工作紀錄。
- `skills/gyrobooking-low-cost/`：Codex 專案專屬 SKILL。

## 維護原則

- 學生端要維持低 Firestore read/write 成本。
- 規格文件、SSOT、工作紀錄預設使用繁體中文。
- 每次改檔都要新增或更新 `docs/worklog/`。
- 涉及產品行為、資料模型、部署、安全或成本的變更，也要同步更新 `docs/ssot/`。


# 2026-05-16 22:48 Admin cascade 對齊報告

## 需求摘要

使用者同意下一步先建立正式 `admin.html` cascade 與 `scripts/core_flow_engine.mjs` 測試 engine 的對齊報告，不直接替換正式流程。目標是先明確差異、替換順序與風險，避免一次大改造成資料流回歸。

## 變更檔案

- `docs/ssot/admin_cascade_alignment.md`
- `docs/ssot/README.md`
- `docs/worklog/2026-05-16_2248_admin-cascade-alignment.md`

## 行為變更

- 新增 SSOT 對齊報告，列出：
  - `admin.html` 正式 cascade 函式與 `core_flow_engine.mjs` 對應關係。
  - 哪些流程已高度對齊，哪些仍是部分對齊。
  - 後續補測試與正式流程整理順序。
  - 為什麼暫時不直接把正式頁面改成 import engine。
- 更新 SSOT index，讓後續新對話框可以找到這份對齊報告。

## Firestore 讀寫影響

- 無新增 Firestore read/write。
- 本次沒有修改 `index.html`、`admin.html`、`firestore.rules`。
- 本次只新增文件與工作紀錄。

## 驗證

- 已檢查正式 `admin.html` cascade 函式位置。
- 已檢查 `scripts/core_flow_engine.mjs` 涵蓋範圍。
- 已執行：`node scripts/core_flow_regression.mjs`
- 結果：8 項核心流程回歸檢查通過。
- 待檢查：`git status --short`

## 後續風險

- 對齊報告不是程式修復；下一步仍需先補 `deleteTicket`、`repairExistingBooking` 等測試案例。
- `docs/ssot/core_data_flows.md` 與部分舊文件目前在 PowerShell 顯示有編碼亂碼，但新增文件以 UTF-8 寫入；日後可安排一次文件編碼整理。

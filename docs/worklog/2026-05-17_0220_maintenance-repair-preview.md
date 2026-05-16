# 2026-05-17 02:20 維運修復工具改為先預覽再執行

## 需求摘要

資料修復流程未來正式發布後仍會保留，但應定位為管理員維運工具。這次將目前已有的修復工具往正式流程靠攏：先顯示 dry-run / preview，再由管理員確認執行。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/data_health_ui.md`
- `docs/worklog/2026-05-17_0220_maintenance-repair-preview.md`

## 行為變更

- 資料健康檢查卡片內的修復按鈕改成「預覽」版本。
- 「清除孤兒日誌成員」會先顯示將處理幾筆日誌、移除幾個不存在學員 ID 與範例，確認後才寫入。
- 「整理歷史票券紀錄」會先顯示將新增幾張票券校準紀錄與範例，確認後才新增 `reconcile_balance`。
- 「重建學員查詢」會先列出將重寫的 `student_lookup` / `phone_lookup` 數量，以及會清除的舊 lookup 數量，確認後才執行。

## Firestore 讀寫影響

- 學生端沒有新增任何讀寫。
- 管理員端預覽「重建學員查詢」會讀取 `student_lookup` 與 `phone_lookup` 以計算 stale lookup 數量；這只在管理員明確按下預覽時執行。
- 實際寫入/刪除仍需管理員確認後才會執行。

## 驗證

- 已執行 `node scripts/core_flow_regression.mjs`，21 項核心流程回歸通過。
- 已解析 `admin.html` script 語法，通過。
- 已檢查 preview 函式與按鈕已同步到 active 與根目錄 `admin.html`。
- 待確認 GitHub Pages 線上檔案包含 `previewStudentLookupRebuild`、`previewCleanOrphanCourseLogMembers`、`previewReconcileHistoricalTicketLogs`。

## 後續風險

- 未來多老師版本中，所有 preview 與 prune 必須受 `tenantId` 限制，避免讀取或刪除其他老師的 lookup。

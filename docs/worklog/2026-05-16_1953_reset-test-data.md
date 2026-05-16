# 2026-05-16 19:53 清空測試資料

## 需求摘要

在不變更流程邏輯的前提下，清空目前測試期造成的學員資料、出缺勤、行事曆與收費紀錄，避免舊歷史紀錄不完整影響後續測試與資料健康檢查。

## 執行內容

- 使用 Firebase CLI 已登入帳號的 OAuth 權限，透過 Firestore REST 執行一次性資料維運。
- 執行前先備份目前資料到本機：
  - `tools/data_backups/reset_backup_20260516_195317.json`
- 清空下列 `/data/*` 文件的 `value` 陣列：
  - `students`
  - `tickets`
  - `payments`
  - `classes`
  - `course_logs`
  - `slots`
- 清空公開課表：
  - `public_booking/state.slots = []`
  - 保留既有 `booking_cfg`
- 刪除下列 collection 內文件：
  - `student_lookup`
  - `phone_lookup`
  - `purchase_requests`
  - `booking_requests`

## 驗證結果

清空後讀回驗證：

- `students = 0`
- `tickets = 0`
- `payments = 0`
- `classes = 0`
- `course_logs = 0`
- `slots = 0`
- `student_lookup = 0`
- `phone_lookup = 0`
- `purchase_requests = 0`
- `booking_requests = 0`
- `public_booking/state.slots = 0`

## Firestore 讀寫影響

- 這是一次性管理端維運操作。
- 不增加學生端讀取。
- 不改變學生端低成本流程：學生端仍只讀 `public_booking/state`、`web_config/flags` 與單筆 `student_lookup/{hash}`。
- 實際寫入包含 6 個 `/data/*` 文件、1 個 `public_booking/state` 文件，以及 collection 文件刪除。此次 collection 刪除數量為 0。

## 後續注意

- 管理員頁若已開著，建議重新整理，以清掉瀏覽器記憶體中的舊 cache。
- 後續重新測試時，請先建立課程方案與可預約時段，再測購課、收款、預約、出缺勤流程。

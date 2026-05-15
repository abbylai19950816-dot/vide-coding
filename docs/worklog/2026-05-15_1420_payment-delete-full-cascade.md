# 刪除收費完整 cascade

## 需求摘要

刪除已使用過的收費/方案時，該票券產生的預約、學員 `scheduledBookings`、出缺勤與課程紀錄也要一起清掉。正式營運用的「退款 / 作廢但保留歷史」先寫入 SSOT，日後另做。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/data_model.md`

## 行為變更

- `deletePayment()` 會找出同 `paymentId` / `sourcePaymentId` 的票券。
- 若票券曾扣過預約，會從票券 `logs` / `log` 的 `slotIds` 找出相關課堂。
- 刪除收費後會同步清理：
  - `data/payments`
  - `data/tickets`
  - `data/slots.bookings`
  - `data/students.scheduledBookings`
  - `data/classes.members`
  - `data/course_logs` 中對應學員紀錄
- 若出缺勤 class 或課程 log 清到沒有學員，會移除該筆紀錄。

## SSOT 更新

- 在 `docs/ssot/data_model.md` 新增 `Payment deletion cascade`。
- 新增 `Future refund / void workflow`，明確記錄正式退款/作廢應保留歷史，只讓剩餘堂數失效，不應沿用刪除收費流程。

## 資料修復

已清理賴俐婷刪除一對一體驗課收費後的殘留資料：

- 移除殘留票券：1
- 移除預約 booking：1
- 移除學員排程：1
- 移除出缺勤 member：1
- 課程紀錄：0（線上沒有對應 log）

修復後驗證：

- `payments=0`
- `tickets=0`
- 賴俐婷 `scheduledBookings=0`
- 相關行事曆 booking：0
- 相關出缺勤：0
- 相關課程紀錄：0

## Firestore 讀寫影響

- 學員端沒有新增讀取或寫入。
- 管理員刪除收費時，除了原本更新 `data/payments` / `data/tickets`，可能再更新 `data/slots`、`data/students`、`data/classes`、`data/course_logs`。
- `saveTickets()` / `saveSlots()` 仍會走既有低成本公開索引同步流程，確保學員查詢與公開課表不殘留。

## 驗證

- 以 `node --check` 檢查 `admin.html` 拆出的 classic scripts，語法通過。
- 讀取 Firestore 驗證賴俐婷相關收費、票券、預約、出缺勤與課程紀錄已歸零。

## 後續風險

- 正式退款流程尚未實作。正式營運前應新增 `refund` / `void` 操作，避免用刪除收費處理真實歷史資料。

# 2026-05-16 21:52 Booking Repair 改走 Cascade

## 需求摘要

依照下一步優化計畫，將 `repairBookingsToStudentRecords()` 這類舊維修工具改成使用共用 cascade，避免維修資料時自行手動改 `students`、`tickets`、`classes` 而產生新錯位。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/core_data_flows.md`
- `docs/worklog/2026-05-16_2152_booking-repair-cascade.md`

## 行為變更

- 新增 `ticketHasSlotLog(ticket, slotId)`，統一判斷票券是否已有某個 slot 的扣堂紀錄。
- 新增 `repairExistingBookingCascade(state, slot, booking)`：
  - 不重複新增 `slots[].bookings`。
  - 補齊缺少的 `students[].scheduledBookings`。
  - 若票券沒有該 `slotId` 的扣堂 log，才補扣 1 堂並寫入 `repair_booking_deduct`。
  - 補齊或更新 `classes` 出缺勤資料。
- `repairBookingsToStudentRecords()` 改為走 `createBookingCascadeState()`、`repairExistingBookingCascade()`、`persistBookingCascadeState()`。
- 更新 `core_data_flows.md`，把舊預約修復工具納入 SSOT 規則。

## Firestore 讀寫影響

- 學員端讀取與寫入路徑沒有新增。
- 維修工具是管理員手動低頻操作；只有偵測到缺資料時才會寫回 `students`、`tickets`、`classes`，並同步公開鏡像。
- 不新增 student-side bulk read。

## 驗證

- 已同步 active 版 `admin.html` 到根目錄 `admin.html`。
- 已用 `new Function()` 解析 active 與根目錄 `admin.html` 內非 module scripts，確認語法可解析。
- 已跑 `git diff --check`，僅有 Windows 換行警告，沒有 whitespace error。
- 已用假資料 smoke test：
  - 第一次修復既有 slot booking 時，會補寫 scheduledBookings、補扣 ticket、建立 attendance class。
  - 第二次重跑同一筆資料時，不會重複扣堂，也不會重複寫入 scheduledBookings 或 class。

## 後續風險

- 此工具仍是 console 維修工具，不是正式 UI；未來資料健康檢查第二版可將它包成更清楚的管理員操作按鈕。

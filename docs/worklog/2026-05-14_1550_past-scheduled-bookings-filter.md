# 工作紀錄：修正已發生課程仍顯示在預約課程時段

## 需求摘要

使用者回報目前時間為 2026-05-14 15:39，管理端學員詳情中的「預約課程時段」仍顯示已發生課程：

- 賴俐婷，手機 `0928964118`，2026-05-14 00:00，墊上嬋柔一對一。
- 柯宇恆，2026-05-14 14:00。

這些課程已經早於目前時間，應從「預約課程時段」移除。

## 問題原因

管理端學員詳情原本只用 `b.date >= today` 判斷未來預約。這會把今天所有課程都視為未來預約，即使課程時間已經早於目前時間。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-14_1550_past-scheduled-bookings-filter.md`

## 行為變更

新增台灣時間的日期時間比較 helper：

- `localDateTimeKey()`
- `normalizeTimeKey()`
- `scheduledBookingDateTimeKey()`
- `isFutureScheduledBooking()`

學員詳情中的「預約課程時段」改為使用 `date + time` 判斷，只有課程開始時間晚於目前台灣時間的預約才會顯示。

因此在 2026-05-14 15:39 時：

- 2026-05-14 00:00 不會顯示。
- 2026-05-14 14:00 不會顯示。
- 2026-05-14 16:00 仍會顯示。
- 2026-05-15 之後的課程仍會顯示。

## Firestore 讀寫影響

無新增 Firestore read/write。此修正只改前端顯示邏輯，使用既有 `scheduledBookings` 與已載入的 `slots` cache。

## 驗證

- 已確認原本篩選條件為只比較日期。
- 已將 active 版本同步到 repo 根目錄 `admin.html`，供 GitHub Pages 使用。
- 預期 2026-05-14 15:39 後，當天 00:00 與 14:00 課程不再出現在「預約課程時段」。

## 後續風險

- 此修正只影響顯示，不會自動清除 `students.scheduledBookings` 內的歷史資料。
- 若未來需要資料層清理，應另外設計管理端維護工具，並避免增加學生端 Firestore 成本。


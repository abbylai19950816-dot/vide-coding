# 2026-05-16 15:54 Fix Calendar Slot Delete Refund

## 需求摘要

- 使用管理員行事曆刪除課程後，雖然系統有補回堂數，但疑似補到錯票券：
  - `0928964118` 多了一堂一對一。
  - `0975667958` 少了一堂一對一。
- 需檢查並修正刪除課程時的票券回補邏輯，避免再用不精準條件造成錯補。

## 問題原因

- 行事曆刪除時段的 `schDeleteSlot()` 原本用 `studentName === booking.name` 找第一張符合的票券。
- 這會忽略 `studentId`、手機與原始扣堂 log 的 `slotIds`。
- 當同名、舊資料缺欄位、同一人多張同類型票券，或同課程類型有多張方案時，可能補回到錯票券。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/data_model.md`

## 行為變更

- 新增共用 helper：
  - `ticketSlotLogs()`
  - `ticketHasSlotLog()`
  - `resolveBookingStudent()`
  - `findRefundTicketIndex()`
- `bookingMatchesStudent()` 增加手機比對，避免只有姓名時誤判。
- 學員詳細頁取消預約改用 `findRefundTicketIndex()`，讓取消與行事曆刪除共用同一套回補票券規則。
- 行事曆刪除時段現在會：
  - 先用預約資料解析學員，優先使用 `studentId`，再用手機、Line，最後才是舊資料姓名 fallback。
  - 先用 ticket log 的 `slotIds` 找原本扣堂的票券。
  - 找不到 `slotIds` 時，才 fallback 到同學員、同課程類型票券。
  - 回補 log 同時寫入 `log[]` 與 `logs[]`，並保留 `slotIds`。
  - 從學員 `scheduledBookings` 移除時，改用解析後的學員 id 與精準 `slotId`。
- `/data/slots` 與 `/data/classes` 刪除比對改為字串化 id，避免數字/字串 id 型別不一致。
- `docs/ssot/data_model.md` 補上 booking ticket deduction/refund logs 的規則。

## Firestore 讀寫影響

- 沒有新增學生端讀取或寫入。
- 管理員行事曆刪除課程仍使用既有 `saveTickets()`、`saveStudents()`、`saveSlots()`、`saveClasses()` 寫回同一批 `/data/*` 文件。
- 寫入次數沒有增加新的資料集合；但回補 log 會同步寫入 `log[]` 與 `logs[]`，確保後續能精準追蹤。

## 驗證

- 已用 Node 檢查 `admin.html` 內 7 個 script block，語法檢查通過。
- 已執行低成本關鍵字搜尋；本次沒有新增學生端讀取，新增/調整的寫入仍走既有管理端 `saveTickets()`、`saveStudents()`、`saveSlots()`、`saveClasses()`。
- 已用本地 Node 小測試模擬兩位不同手機學員、同課程類型票券，確認刪除 `slot-x` 時會回補到含有同一 `slotIds` 扣堂紀錄的票券。
- 待推送後確認 GitHub Pages 線上檔案包含新 helper。

## 後續風險

- 這次修的是「之後刪除時段不要再補錯」。
- 已經發生的錯誤堂數仍需人工或資料修復：依目前回報，應檢查 `0928964118` 與 `0975667958` 的一對一票券，確認是否需要把前者扣回 1 堂、後者補回 1 堂。

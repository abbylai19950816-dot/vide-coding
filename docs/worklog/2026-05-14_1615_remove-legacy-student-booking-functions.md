# 工作紀錄：移除學生頁舊版預約函式

## 需求摘要

使用者同意專門處理學生頁 cleanup：移除舊版 `batchSubmitBooking()` / `loopBooking()`，保留後段低成本 secure mode 版本，降低維護誤判與避免未來誤觸大文件同步流程。

## 問題背景

學生頁原本有兩組同名函式：

- 前段舊版 `batchSubmitBooking()` / `loopBooking()`：直接修改 localStorage，並呼叫 `saveSlots()`、`saveTickets()`、`saveStudents()`、`saveClasses()`。
- 後段低成本 secure mode `batchSubmitBooking()` / `loopBooking()`：使用 `window._fb.runLowCostBooking()` transaction，符合目前 Firebase 免費版低讀寫策略。

瀏覽器實際會以後段函式覆蓋前段函式，因此原本可運作，但檔案中保留舊版程式碼容易讓維護者誤判，也可能在未來調整 script 順序時重新引入高成本流程。

## 變更檔案

- `active/gyrobooking_current/github_pages/index.html`
- `index.html`
- `docs/worklog/2026-05-14_1615_remove-legacy-student-booking-functions.md`

## 行為變更

移除前段舊版：

- `loopBooking()`
- `batchSubmitBooking()`

保留：

- `openSlotConfirm()`
- `_doOpenSlotConfirm()`
- `submitSlotBooking()`
- 後段 low-cost secure mode `batchSubmitBooking()`
- 後段 low-cost secure mode `loopBooking()`

因此 UI 按鈕仍可呼叫原本名稱，但實作只剩低成本 transaction 版本。

## Firestore 讀寫影響

不增加 Firestore read/write。此 cleanup 反而降低未來誤用學生端大文件同步流程的風險。

學生端預約仍維持：

- 查詢：單一 `student_lookup/{hash}`。
- 預約：`runLowCostBooking()` transaction。
- 不在學生端使用舊版 `saveSlots()` / `saveTickets()` / `saveStudents()` / `saveClasses()` 預約流程。

## 驗證

- 搜尋 `function batchSubmitBooking` 與 `function loopBooking`，確認學生頁只剩各一組低成本版本。
- 搜尋 `saveSlots(`、`saveTickets(`、`saveStudents(`、`saveClasses(`，確認學生頁預約流程不再呼叫舊版大文件同步函式。
- 解析 `index.html` 與 `active/gyrobooking_current/github_pages/index.html` script，皆通過：
  - `index.html scripts parsed: 5`
  - `active/gyrobooking_current/github_pages/index.html scripts parsed: 5`

## 後續風險

- 這次未實際連 Firebase 執行真實預約交易，避免產生測試寫入。
- 若要更完整驗證，可在測試資料下手動跑一次查詢、單次預約、循環預約。


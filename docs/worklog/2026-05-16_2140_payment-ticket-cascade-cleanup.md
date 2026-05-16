# 2026-05-16 21:40 收費票券 Cascade 整理

## 需求摘要

使用者要求優化 `admin.html` 內歷史函式、維修工具與舊流程殘留，讓「票券、收費、刪除、資料修復」更集中到 SSOT 函式，降低改 A 動到 C 的風險。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/core_data_flows.md`
- `docs/worklog/2026-05-16_2140_payment-ticket-cascade-cleanup.md`

## 行為變更

- 將真正的收費開票邏輯集中到 `createTicketFromPaymentCascade(payment)`。
- 保留 `createTicketFromPayment(payment)` 作為相容舊呼叫點的 wrapper。
- 新增 `getTicketsByPaymentId()` / `paymentTicketMatches()`，統一判斷 payment 與 ticket 的連結。
- 新增 `deleteTicketCascade(ticketId, options)`，讓學員詳細頁刪除票券與一般刪除票券走同一條流程。
- 新增 `deletePaymentCascade(paymentId, options)`，讓刪除收費紀錄統一處理 linked tickets 與相關預約、出缺勤、課程日誌。
- 「已收款補開票券」維修工具改為呼叫 `createTicketFromPayment()`，不再自行建立另一套 ticket 結構。
- 更新 `core_data_flows.md`，把收費、票券、刪除與維修工具的共用函式列入 SSOT。

## Firestore 讀寫影響

- 學員端讀取與寫入路徑沒有新增。
- 管理員端刪除 ticket / payment 時，會視票券使用紀錄同步更新 `tickets`、`payments`、`slots`、`students`、`classes`、`course_logs` 與公開鏡像。
- 維修工具仍是管理員手動低頻操作，並改用既有開票函式，避免額外重複寫入。

## 驗證

- 已同步 active 版 `admin.html` 到根目錄 `admin.html`。
- 已用 `new Function()` 解析 active 與根目錄 `admin.html` 內非 module scripts，確認語法可解析。
- 已跑 `git diff --check`，僅有 Windows 換行警告，沒有 whitespace error。
- 已用假資料 smoke test：
  - 同一筆 paid payment 重複呼叫開票，只會建立 1 張 ticket。
  - 刪除該 payment 會同步移除 linked ticket、slot booking、student scheduledBookings、classes 與 course_logs。

## 後續風險

- `admin.html` 仍有其他舊維修工具，例如 booking repair；之後可再分階段改成呼叫 booking cascade。

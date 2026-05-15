# 體驗課開票判斷修正

## 需求摘要

賴俐婷已購買並預約一對一體驗課後，再購買一對二體驗課且已付款，但學員端查詢沒有出現一對二有效方案。

## 問題原因

管理員端 `createTicketFromPayment()` 對「每位學員限使用一次」方案做重複判斷時，只用 `planName` 判斷。  
一對一與一對二的體驗課方案名稱都叫「體驗課（僅限一次）」，導致一對二付款被誤判為已經開過同一個方案，所以略過開票。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`

## 行為變更

- 體驗課重複判斷改成「同一位學員 + 同一課程類型 + 同一方案」才算重複。
- 不同課程類型下同名方案，例如「一對一體驗課」與「一對二體驗課」，可以各自付款後各自開票。

## 資料修復

- 已補開賴俐婷漏掉的一對二體驗課票券。
- 修復後線上狀態：
  - 一對一體驗課票券：`left=0`
  - 一對二體驗課票券：`left=1`
  - `student_lookup.remainingByType`：`{ "2": 1 }`

## Firestore 讀寫影響

- 學員端沒有新增讀取或寫入。
- 管理員收款開票仍維持原本寫入路徑：`data/tickets`，並由既有低成本同步機制更新 `student_lookup`。
- 本次資料修復手動寫入 `data/tickets`、`student_lookup`、`phone_lookup`。

## 驗證

- 以 `node --check` 檢查 `admin.html` 拆出的 classic scripts，語法通過。
- 讀取 Firestore 驗證 `payments=2`、`tickets=2`，且一對二體驗課票券剩餘 1 堂。

## 後續風險

- 若未來多個課程類型使用相同方案名稱，應繼續以 `typeId + planId` 作為主要判斷鍵，避免用方案名稱當唯一識別。

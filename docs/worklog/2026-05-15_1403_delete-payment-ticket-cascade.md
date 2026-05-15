# 刪除收費紀錄連動移除方案

## 需求摘要

管理員刪除賴俐婷的一對二收費紀錄後，學員資料內的一對二有效方案也應該同步消失。

## 問題原因

原本 `deletePayment()` 只會刪除 `data/payments` 內的收費紀錄，沒有同步刪除由該付款建立的 `data/tickets` 票券。  
因此會留下「沒有收費來源，但學員仍可查到方案」的殘留資料。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`

## 行為變更

- 刪除收費紀錄時，會一併查找 `paymentId` 或 `sourcePaymentId` 相同的票券並刪除。
- 若對應票券已有使用紀錄，確認視窗會提醒管理員仍會一併移除。
- 刪除後會重新渲染收費頁、學員頁與 badge，並由既有 `saveTickets()` 低成本同步流程更新學員查詢索引。

## 資料修復

- 已移除賴俐婷已刪除一對二收費紀錄後殘留的票券。
- 修復後 `student_lookup` 顯示：
  - `totalRemaining=0`
  - `remainingByType={}`
  - `usedOncePlanKeys=["1|1778682925091"]`

## Firestore 讀寫影響

- 學員端沒有新增讀取或寫入。
- 管理員刪除收費時，除了原本更新 `data/payments`，若有對應票券會再更新 `data/tickets`。
- `saveTickets()` 會觸發既有低成本索引同步，更新 `student_lookup` / `phone_lookup`。

## 驗證

- 以 `node --check` 檢查 `admin.html` 拆出的 classic scripts，語法通過。
- 已讀取 Firestore 驗證賴俐婷的一對二票券移除，學員查詢索引不再顯示一對二剩餘堂數。

## 後續風險

- 若刪除的是已被預約使用的票券，目前會直接移除票券，但不會自動回溯行事曆預約或出缺勤紀錄；正式營運前可再設計「刪除付款 / 取消方案 / 退款」三種不同管理流程。

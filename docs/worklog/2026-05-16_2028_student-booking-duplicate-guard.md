# 2026-05-16 20:28 學員端重複預約防呆

## 需求摘要

實測「安安 0911111111」購買一堂一對一並完成預約後，仍可再次按課程預約，而且會再次跳出預約完成。這會造成同一堂票券在管理員匯入前可能送出多筆 `booking_requests`。

## 修改內容

- 學員端新增本機待確認預約紀錄 `gyrobooking_pending_booking_requests_v1`。
- 預約申請送出成功後，立即把該次 `slotIds` 記為 pending。
- `getRemainingTickets()` 會從 `student_lookup.remainingByType` 扣掉同裝置 pending 預約數。
- 已送出的同一時段在課表上顯示「已送出」，不可再次點選。
- 送出中會鎖定確認預約按鈕，避免連點造成重複送出。
- 再次查詢時，如果雲端 `student_lookup` 的剩餘堂數已降到送出後堂數，代表管理員已匯入，會自動清掉本機 pending 紀錄。

## 修改檔案

- `active/gyrobooking_current/github_pages/index.html`
- `index.html`
- `docs/ssot/data_model.md`

## Firestore 讀寫影響

- 不新增 Firestore reads。
- 不新增額外 writes。
- 學員端仍維持原本低成本路徑：
  - 讀取 `public_booking/state`
  - 讀取單筆 `student_lookup/{hash}`
  - 寫入單筆 `booking_requests/{requestId}`
- 本次新增的 pending buffer 只存在同裝置 `localStorage`，用於 UI 防呆，不作為正式預約資料來源。

## 驗證

- 已檢查 `index.html` 新增邏輯語法。
- 已確認 active 與根目錄 `index.html` 同步。

## 後續風險

- 這能阻止同一裝置、同一查詢狀態下的重複送出。
- 若學生換裝置或清除瀏覽器資料，仍可能再次送出；正式防重仍應在管理員匯入 `booking_requests` 時檢查同學員、同方案、同時段是否已有 pending 或已匯入預約。

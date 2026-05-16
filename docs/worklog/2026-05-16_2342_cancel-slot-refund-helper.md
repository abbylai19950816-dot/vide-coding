# 2026-05-16 23:42 取消預約與刪除課堂補票 helper

## 需求摘要

依照下一步優化計畫，整理正式 `admin.html` 中取消預約 / 刪除課堂的補票邏輯，讓兩個流程共用同一套補票判斷，並避免取消流程重複觸發時多補堂。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `scripts/core_flow_engine.mjs`
- `scripts/core_flow_regression.mjs`
- `docs/ssot/cancel_slot_refund.md`
- `docs/ssot/README.md`
- `docs/worklog/2026-05-16_2342_cancel-slot-refund-helper.md`

## 行為變更

- 新增正式 helper `findRefundTicketForCancelledBooking()`。
- 保留 `findRefundTicketIndex()` wrapper，降低既有呼叫風險。
- `cancelBookingCascade()` 現在只有在實際移除 booking / scheduledBookings / classes / course_logs 任一 artifact 時才補票。
- 回歸測試新增：
  - 取消流程重跑不會重複補票。
  - 同一學員有多種課程票券時，取消一對一不會補錯團課票券。

## Firestore 讀寫影響

- 沒有新增 Firestore read path。
- 沒有新增學生端 read/write。
- 管理員端仍沿用原本取消預約與刪除課堂時的資料寫回路徑。

## 驗證

- 已執行：`node scripts/core_flow_regression.mjs`
- 結果：17 項核心流程回歸檢查通過。
- 已檢查：active `admin.html` 已同步到 root `admin.html`
- 待檢查：GitHub Pages 線上 `admin.html` 包含 `findRefundTicketForCancelledBooking`

## 後續風險

- 下一步可整理 `repairExistingBookingCascade()`，讓正式資料修復也更接近 engine 測試規則。

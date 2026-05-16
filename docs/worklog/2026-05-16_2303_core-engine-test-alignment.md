# 2026-05-16 23:03 Core engine 測試對齊

## 需求摘要

使用者要求直接一步一步改到測試對齊為止。依照 `admin_cascade_alignment.md` 的第一階段，先補齊測試 engine 尚未覆蓋、但正式 `admin.html` 已有 cascade 的流程。

## 變更檔案

- `scripts/core_flow_engine.mjs`
- `scripts/core_flow_regression.mjs`
- `docs/ssot/admin_cascade_alignment.md`
- `docs/worklog/2026-05-16_2303_core-engine-test-alignment.md`

## 行為變更

- 新增 `deleteTicket()` 測試用純函式，覆蓋單獨刪票券時需清除 linked booking artifacts、但保留 payment record 的規則。
- 新增 `repairExistingBooking()` 測試用純函式，覆蓋既有 slot booking 補 scheduledBookings、補扣 ticket、補 classes 的修復規則。
- 新增 `ticketHasSlotLog()` helper，避免修復同一筆預約時重複扣堂。
- 新增同名不同電話學員的刪除保護測試，確保 engine 使用明確 studentId，不因姓名相同誤刪其他學員。
- 新增同電話不同姓名學員的刪除保護測試，確認測試 engine 不用 phone 直接刪除不同 studentId 的資料。
- 新增 `canPurchasePlan()` 與體驗課一次限制測試。
- 新增 `getBookingAvailabilityState()` 與「無可用方案」/「有方案但沒有對應時段」狀態分流測試。
- 更新 cascade 對齊報告，把已補測試的項目標記完成。

## Firestore 讀寫影響

- 無新增 Firestore read/write。
- 本次沒有修改 `index.html`、`admin.html` 或 `firestore.rules`。
- 所有變更都是本機測試 engine 與文件。

## 驗證

- 已執行：`node scripts/core_flow_regression.mjs`
- 結果：14 項核心流程回歸檢查通過。
- 待檢查：`git status --short`

## 後續風險

- 本輪完成的是「測試對齊」，正式 `admin.html` 尚未改成直接引用 engine。
- 第一階段測試對齊完成後，下一輪可開始整理正式 cascade helper，但仍要分批處理並每次跑回歸測試。

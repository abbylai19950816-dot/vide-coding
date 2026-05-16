# 既有預約資料修復規則

本文件記錄管理員端資料修復工具使用的既有預約修復規則。

## 使用場景

當 `slots[].bookings` 已經有預約，但其他衍生資料缺漏時，修復工具可以補齊：

- `students[].scheduledBookings`
- `tickets` 的扣堂 log 與堂數
- `classes` 出缺勤課堂

## 核心規則

- 已有 `scheduledBookings` 時，不重複新增。
- 已有含該 `slotId` 的 ticket log 時，不重複扣堂。
- 已有對應 `classes` 與成員時，不重複建立出缺勤。
- 沒有可用票券時，不硬扣票券，只補可確認的 scheduled/class 資料。
- 修復工具應回傳準確 summary，讓管理員知道補了哪些資料。

## 對應正式函式

- `repairExistingBookingCascade(state, slot, booking)`
- `ticketHasSlotLog(ticket, slotId)`
- `upsertAttendanceClassForSlotInState(state, slot)`

## 測試覆蓋

`scripts/core_flow_regression.mjs` 已覆蓋：

- 同時補 scheduledBookings、ticket deduction、classes。
- 重跑修復不重複扣堂。
- 只缺 scheduledBookings 時，只補 scheduled。
- 只缺 classes 時，只補 class。
- 已有排程與出缺勤但缺 ticket log 時，只補扣票券。
- 沒有可用票券時，不硬扣。

執行：

```powershell
node scripts/core_flow_regression.mjs
```

## Firestore 成本影響

- 沒有新增學生端 read/write。
- 沒有新增 Firestore read path。
- 管理員端只在手動執行修復工具時，沿用既有資料寫回路徑。

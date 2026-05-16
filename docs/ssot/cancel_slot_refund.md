# 取消預約與刪除課堂補票規則

本文件記錄 `admin.html` 中取消預約與刪除課堂時的補票規則。

## 核心規則

- 單一取消預約與刪除整個課堂時段，都應使用同一套補票判斷。
- 優先尋找曾經扣過該 `slotId` 的票券 log。
- 找不到 slot log 時，才 fallback 到同學員、同課程類型、未過期的票券。
- 如果取消流程沒有實際移除任何 booking artifact，不應補票。

## 連動資料

取消預約會移除：

- `slots[].bookings`
- `students[].scheduledBookings`
- `classes[].members`
- `course_logs` 中該學員與該時段的關聯

只有上述任一資料真的被移除時，才會補回票券。

## 對應正式函式

- `findRefundTicketForCancelledBooking(tickets, student, booking, slot, slotId)`
- `findRefundTicketIndex(tickets, student, booking, slot, slotId)`
- `cancelBookingCascade(state, studentId, slotId, options)`
- `deleteSlotCascade(state, slotId)`

## 測試覆蓋

`scripts/core_flow_regression.mjs` 已覆蓋：

- 單一取消預約會移除 artifacts 並補回原票券。
- 同一取消流程重跑時，不會因 artifacts 已不存在而重複補票。
- 同學員有多種課程票券時，取消一對一課程不會補錯到團課票券。
- 刪除課堂時，多位學員各自補回正確票券。

執行：

```powershell
node scripts/core_flow_regression.mjs
```

## Firestore 成本影響

- 沒有新增學生端 read/write。
- 沒有新增 Firestore read path。
- 管理員端仍沿用原本取消預約與刪除課堂時的資料寫回路徑。

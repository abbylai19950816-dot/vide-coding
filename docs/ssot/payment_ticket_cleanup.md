# 收費與票券刪除連動規則

本文件記錄 `admin.html` 中刪除收費與刪除票券的正式連動規則。

## 核心規則

### 刪除未使用收費

- 刪除該筆 `payment`。
- 刪除該筆 `payment` 產生的 `tickets`。
- 不應移除任何預約、學員排程、出缺勤或課程日誌。

### 刪除已使用收費

- 刪除該筆 `payment`。
- 刪除該筆 `payment` 產生的 `tickets`。
- 連動移除該票券造成的：
  - `slots[].bookings`
  - `students[].scheduledBookings`
  - `classes[].members`
  - `course_logs` 中該學員與該時段的關聯

### 刪除單一票券

- 刪除該張 `ticket`。
- 保留原本的 `payment`。
- 若該票券已產生預約，連動移除該票券造成的預約 artifacts。

## 比對安全規則

正式 `admin.html` 的 cleanup matching 採用以下優先順序：

1. 若 record 有 `studentId` 或 `id`，只用 id 比對。
2. 只有舊資料缺 id 時，才 fallback 到 phone/name。

這是為了避免同名或同電話不同學員時，刪除 A 學員的收費或票券，卻誤清 B 學員的預約、排程、出缺勤或課程日誌。

## 對應正式函式

- `_recordCascadeId(record)`
- `_ticketArtifactTarget(payment, tickets)`
- `_matchesCascadeTarget(record, target)`
- `cascadeDeletePaymentArtifacts(payment, linkedTickets)`
- `deleteTicketCascade(ticketId, options)`
- `deletePaymentCascade(id, options)`

## 測試覆蓋

`scripts/core_flow_regression.mjs` 已覆蓋：

- 刪除 linked payment 會移除票券與該票券造成的預約 artifacts。
- 刪除單一 ticket 會移除預約 artifacts，但保留 payment。
- 刪除 A 學員收費時，不應清掉同電話 B 學員的預約 artifacts。

執行：

```powershell
node scripts/core_flow_regression.mjs
```

## Firestore 成本影響

- 沒有新增學生端 read/write。
- 沒有新增 Firestore read path。
- 管理員端只有在刪除收費或票券且需要 cleanup 時，沿用既有資料寫回路徑。

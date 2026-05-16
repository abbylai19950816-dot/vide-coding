# 核心流程回歸測試清單

本文件是 Gyrobooking 每次修改功能、修 bug、強化資安、整理資料結構前後都要回看的固定清單。目標是避免「改 A 動到 C」：例如調整 UI 卻讓票券扣錯、刪除收費卻留下預約、取消課程沒有同步出缺勤。

## 使用時機

- 修改 `index.html` 的學員購課、查詢、預約、取消提示、`student_lookup` 或 `public_booking` 同步。
- 修改 `admin.html` 的收費、學員方案、行事曆、出缺勤、課程日誌、資料修復、刪除流程。
- 修改 `firestore.rules`、登入、權限、未來 multi-tenant / 多老師隔離設計。
- 新增任何會影響 `payments`、`tickets`、`students`、`slots`、`classes`、`course_logs` 的功能。

## 必測流程

### 1. 學員購課但尚未付款

預期結果：

- 學員端送出購課申請。
- 管理員端可看到待收款紀錄。
- 學員資料可以建立基本資料，但不應出現可預約堂數。
- `tickets` 不應產生可用票券，或票券不可被視為有效。
- 學員端查詢應顯示「尚無可用方案」或對應的中文提示。

### 2. 管理員標記收款

預期結果：

- `payments.status` 從 `unpaid` 變成 `paid`。
- 系統只建立一張對應票券。
- 重複按收款不應重複開票券。
- 學員端查詢可看到剩餘堂數。
- `student_lookup/{hash}` 的剩餘堂數與有效方案同步更新。

### 3. 管理員手動新增方案

預期結果：

- 從學員詳細頁新增方案時，預設視為已收款。
- 建立一筆 `payments`，狀態為 `paid`。
- 建立一張對應 `tickets`。
- 再按一次收款不會讓堂數翻倍。

### 4. 學員預約

預期結果：

- 只能扣同一課程類型的有效票券。
- `tickets.left` 減 1，`tickets.used` 加 1。
- `slots[].bookings` 新增該學員。
- `students[].scheduledBookings` 新增該預約。
- `classes` 產生或更新對應出缺勤課堂。
- `student_lookup/{hash}` 與 `public_booking/state` 同步。
- 同一人同一時段不可重複預約。

### 5. 取消預約

預期結果：

- `slots[].bookings` 移除該學員。
- `students[].scheduledBookings` 移除該時段。
- `classes[].members` 移除該學員，若課堂無成員可移除課堂。
- `course_logs` 移除該學員與該 `slotId` 的關聯。
- 原票券補回 1 堂：`left` 加 1，`used` 減 1。
- `student_lookup/{hash}` 與 `public_booking/state` 同步。

### 6. 改期

預期結果：

- 從原 `slot.bookings` 移到新 `slot.bookings`。
- `students[].scheduledBookings` 的 `slotId`、日期、時間更新。
- `classes` 從原課堂移除成員，加入新課堂。
- 不重複扣堂、不補堂。
- `tickets.left` 與 `tickets.used` 不因改期改變。
- 不可改到過去時段、不同課程類型、已滿時段。

### 7. 管理員刪除課堂時段

預期結果：

- 該時段的所有預約都走取消 cascade。
- 每位學員補回正確票券。
- 該 `slot` 被刪除。
- 對應 `classes` 與 `course_logs` 清乾淨。
- `student_lookup/{hash}` 與 `public_booking/state` 同步。

### 8. 刪除收費或票券

預期結果：

- 刪除未使用收費：移除 `payment` 與其票券，不影響無關資料。
- 刪除已使用收費/票券：同步移除該票券產生的預約、學員排程、出缺勤、課程日誌關聯。
- 不應留下孤兒預約或孤兒課程日誌。
- 操作前要有清楚中文確認，讓管理員知道會連動清除哪些資料。

### 9. 刪除學員

預期結果：

- 移除 `students` 內該學員。
- 移除該學員的 `tickets` 與 `payments`。
- 移除所有 `slots[].bookings` 中該學員預約。
- 移除所有 `classes[].members` 中該學員。
- 移除 `course_logs` 中該學員關聯。
- 更新 `student_lookup` 與 `public_booking/state`。

### 10. 資料一致性檢查

預期結果：

- 正常資料不顯示問題細節。
- 需要管理員處理時，顯示「影響」與「建議下一步」。
- 測試期殘留資料可用修復工具處理。
- 正式上線後，這個工具主要作為維護與稽核用途，不應成為日常必要操作。

## 成本檢查

每次修改後要確認：

- 學員端沒有新增 collection-wide `getDocs()` 或 `onSnapshot()`。
- 學員端初始讀取仍以 `public_booking/state`、`web_config/flags`、單一 `student_lookup/{hash}` 為主。
- 管理員端 listener 不在 render function 裡重複建立。
- 同步 `public_booking/state` 與 `student_lookup` 時有 hash/diff 或必要條件，避免每次 render 重寫。

## 本機半自動檢查

執行：

```powershell
node scripts/core_flow_regression.mjs
```

這個腳本只使用本機假資料，不連 Firebase，因此不會增加 Firestore 讀取或寫入。它會呼叫 `scripts/core_flow_engine.mjs` 內的共用純函式，用來快速驗證核心資料流的預期狀態；真正上線前仍要用瀏覽器手動跑一次管理員與學員流程。

目前 `scripts/core_flow_engine.mjs` 是測試用核心流程引擎，下一步才會逐步讓 `admin.html` 的正式 cascade 函式對齊或引用同一組邏輯。正式前端改動仍必須同步跑瀏覽器測試。

# Admin Cascade 對齊報告

本文件記錄 `admin.html` 正式資料流 cascade 與 `scripts/core_flow_engine.mjs` 測試 engine 的對齊狀態。目標不是一次大改正式系統，而是先建立替換順序，避免穩定流程被大範圍改動打亂。

## 目前結論

短期策略：

1. `admin.html` 先維持正式資料流來源。
2. `scripts/core_flow_engine.mjs` 作為本機純函式測試核心。
3. 每次整理正式 cascade 前，先補 engine 測試案例。
4. 正式流程只分批替換，不一次全面重構。

原因：

- `admin.html` 現在除了資料流，還包含 UI、toast、confirm、localStorage/Firebase cache、public mirror sync、student lookup sync。
- `core_flow_engine.mjs` 目前是純資料模型，不處理 UI 與 Firebase。
- 直接讓正式頁面引用 engine 會牽涉 module loading、GitHub Pages 前端載入方式與現有全域函式結構，風險比先對齊規則高。

## 對照表

| 正式 `admin.html` 函式 | 測試 engine 對應 | 對齊狀態 | 備註 |
|---|---|---|---|
| `createTicketFromPaymentCascade()` | `createTicketFromPayment()` | 部分對齊 | 正式版會讀課程設定、處理同電話學生、防重複票券、補寫 payment student 資訊。engine 目前只測 paid 才開票與 paymentId 防重複。 |
| `addBookingCascade()` | `addBooking()` | 部分對齊 | 共同規則是扣同類型有效票券、寫入 slot booking、student scheduledBookings、classes。正式版另處理 request 欄位、未來時段、滿班、lookup sync 後續。 |
| `cancelBookingCascade()` | `cancelBooking()` | 高度對齊 | 共同規則是移除 slot booking、student scheduledBookings、classes、course_logs 並補回原票券。正式版有更完整的姓名 fallback 與 refund ticket search。 |
| `moveBookingCascade()` | `moveBooking()` | 高度對齊 | 共同規則是移動 booking 與 scheduledBookings、不改 ticket counts、更新 classes。正式版另處理過去時段、不同課程類型、滿班、locked attendance、course log move ticket log。 |
| `deleteSlotCascade()` | `deleteSlot()` | 高度對齊 | 共同規則是逐一 cancel booking、補回票券、刪 slot 與 class/log。正式版會統計 refunds 與 dirty flags。 |
| `deletePaymentCascade()` | `deletePayment()` | 部分對齊 | 共同規則是刪 payment 與 linked tickets，並清掉 linked ticket 造成的預約關聯。正式版另有確認提示、used ticket 判斷、`cascadeDeletePaymentArtifacts()`。 |
| `deleteTicketCascade()` | `deleteTicket()` | 已補測試對齊 | engine 已覆蓋單獨刪票券：清除該票券造成的 booking artifacts，但保留 payment record。正式版另有確認提示與 public mirror sync。 |
| `deleteStudentCascade()` | `deleteStudent()` | 高度對齊 | 共同規則是刪 student、tickets、payments、slots bookings、classes members、course_logs refs。正式版另有 phone/name fallback 與 public mirror sync。 |
| `repairExistingBookingCascade()` | `repairExistingBooking()` | 已補測試對齊 | engine 已覆蓋既有 slot booking 補 scheduledBookings、補扣 ticket、補 classes，並測試重跑不重複扣堂。 |

## 優先替換順序

### 第一階段：補測試，不改正式流程

先補 `core_flow_engine` 與 `core_flow_regression` 測試：

1. `deleteTicket()` 單獨刪票券。已完成。
2. `repairExistingBooking()` 修復既有預約。已完成。
3. 同名不同電話的刪除保護。已完成。
4. 同電話不同姓名的關聯保護。已完成。
5. 體驗課只能購買/使用一次的規則。已完成。
6. 無對應課程時段時，學員端提示要和「沒有可用方案」分開。已完成。

第一階段測試對齊已完成。後續若再新增正式流程，必須先補 engine 測試案例，再修改正式 `admin.html` 或 `index.html`。

### 第二階段：正式 cascade 規則對齊

在不改 UI 的前提下，逐段整理 `admin.html`：

1. `deleteTicketCascade()` 與 `deletePaymentCascade()` 共用同一套 artifact cleanup。
2. `cancelBookingCascade()` 和 `deleteSlotCascade()` 的補票邏輯共用同一個 ticket lookup helper。
3. `deleteStudentCascade()` 的 match helper 固定只允許明確 `studentId`，phone/name fallback 只用於舊資料修復或管理員確認後的刪除。
4. `repairExistingBookingCascade()` 補入測試覆蓋後再整理。

### 第三階段：正式頁面引用共用 engine 的評估

只有在以下條件都達成後，才考慮讓 `admin.html` 直接引用共用 engine：

- engine 支援正式資料欄位，不只是測試欄位。
- engine 不依賴 Node-only API。
- GitHub Pages 前端載入方式已確認。
- UI 層只負責 confirm/toast/render，資料流由 engine 回傳結果與 dirty flags。
- 已有瀏覽器回歸測試清單。

## 暫不直接替換的原因

目前不建議立刻把 `admin.html` 的 cascade 全部改成 import `core_flow_engine.mjs`，原因如下：

- 正式頁面是單一大型 HTML，現有函式依賴許多全域 helper。
- 直接導入 module 可能影響現有 inline handler，例如 `onclick="..."`。
- 正式函式目前含有 Firebase/localStorage 儲存與 public mirror sync，engine 目前刻意不處理這些副作用。
- 目前最有價值的是「先用 engine 固定規則，再逐步讓正式函式收斂」，不是一次搬家。

## 每次對齊時的驗證

每次修改正式 cascade 前後都要跑：

```powershell
node scripts/core_flow_regression.mjs
```

若修改 `admin.html` 或 `index.html`，還要：

- 同步 active 與 repo root 檔案。
- 手動測試對應管理員/學員流程。
- 推上 GitHub 後檢查 Pages build。
- 驗證線上檔案包含預期函式或字串。

## Firestore 成本影響

本文件本身不改程式流程，無 Firestore read/write 影響。後續對齊時仍要遵守：

- 學員端不新增 bulk read。
- 管理員端 listener 不放在 render function。
- `public_booking/state` 與 `student_lookup` 同步要避免不必要重寫。

# 核心資料流 SSOT

本文件定義 Gyrobooking 現階段最重要的資料同步規格。任何修改「購課、收款、預約、取消、改期、刪課、出缺勤、課程日誌、學員查詢」時，都要先對照這份文件，避免只更新其中一份資料，造成管理員頁、學員頁、行事曆、出缺勤或收費紀錄彼此不一致。

## 核心原則

- `payments` 是收款紀錄來源；只有標記為已收款後，才應產生有效 `tickets`。
- `tickets` 是學員可預約堂數來源；學員端只看同步後的 `student_lookup/{hash}`，不能直接讀全部票券。
- `slots` 是行事曆與公開課表來源；預約名額以 `slots[].bookings` 為準。
- `students[].scheduledBookings` 是管理員學員詳細頁的快速檢視資料，不可單獨視為預約真相。
- `classes` 是出缺勤點名資料；只要時段有預約，就應能對應到同一個 `slotId`。
- `course_logs` 是課堂歷史紀錄；取消或刪除未來預約時，要清掉同一 `slotId` 的未完成歷史關聯。
- `public_booking/state` 與 `student_lookup/{hash}` 是學員端低讀取鏡像；管理員資料變更後要由管理員端同步。

## 共用 Cascade 函式

管理員端 `admin.html` 的預約相關資料變更必須集中走共用 cascade 函式：

- `createBookingCascadeState()`: 一次載入 `students`、`tickets`、`slots`、`classes`、`course_logs`。
- `persistBookingCascadeState(state, dirty, reason)`: 依 dirty flag 寫回變更，並在需要時同步公開鏡像。
- `addBookingCascade(state, request, slotId)`: 匯入學員預約，扣正確票券，寫入行事曆、學員預約與出缺勤。
- `cancelBookingCascade(state, studentId, slotId, options)`: 取消預約，移除行事曆、學員預約、出缺勤、課程日誌，並補回正確票券。
- `moveBookingCascade(state, studentId, fromSlotId, toSlotId)`: 改期預約，不重新扣堂，只搬移行事曆、學員預約、出缺勤與課程日誌。
- `deleteSlotCascade(state, slotId)`: 刪除課程時段，對該時段所有預約執行取消 cascade，再刪除時段本身。

後續新增「批次取消、批次改期、老師端刪課、資料修復」時，不要複製貼上各自版本的扣堂、補堂、刪除 scheduledBookings 邏輯，應呼叫這些共用函式或擴充它們。

## 購課與收款

學員購課流程：

1. 學員端送出購課資料到 `purchase_requests`。
2. 管理員端匯入申請，建立或更新 `students`，並建立 `payments`。
3. 管理員在收費頁標記已收款。
4. `createTicketFromPayment()` 根據已收款紀錄建立 `tickets`。
5. 管理員端同步 `student_lookup/{hash}`，學員才能看到可用方案。

限制：

- 學員端不應直接寫入 `students`、`payments`、`tickets`。
- 同一 `paymentId` 不可重複開票券。
- 管理員手動新增方案時，應先建立 `payments`；只有狀態為 `paid` / 已收款時，才建立 `tickets`。
- 若管理員手動新增方案時選擇待收款，學員不應立刻得到可預約堂數；之後按「標記為已收款」才可由同一筆 `paymentId` 建立一張票券。
- 刪除收費紀錄時，若該收費已產生票券，必須同步處理票券與由該票券產生的預約紀錄；正式營運前應保留確認提示與資料健康檢查。

## 預約

預約匯入流程：

1. 學員端送出 `booking_requests`。
2. 管理員端即時或手動匯入申請。
3. `addBookingCascade()` 驗證時段仍在未來、尚有名額、沒有重複預約，且學員有可用票券。
4. 成功後同步更新：
   - `slots[].bookings`
   - `tickets.left` 與 `tickets.used`
   - ticket `log` / `logs`
   - `students[].scheduledBookings`
   - `classes`
   - `public_booking/state`
   - `student_lookup/{hash}`

失敗時：

- 不應部分寫入。
- 若學員有票券但沒有對應課程時段，學員端提示應說明「目前沒有可預約時段」，而不是讓管理員誤以為沒有方案。

## 取消預約

取消預約必須使用 `cancelBookingCascade()`。

同步項目：

- 從 `slots[].bookings` 移除該學員。
- 從 `students[].scheduledBookings` 移除同一 `slotId`。
- 從 `classes[].members` 移除該學員；若課堂沒有成員，可移除該 class。
- 從 `course_logs` 移除同一 `slotId` 的學員關聯，避免孤兒歷史紀錄。
- 對正確票券補回 1 堂，並寫入 refund log。
- 強制同步 `public_booking/state` 與 `student_lookup/{hash}`，讓學員端重新查詢時看到最新堂數與可預約狀態。

注意：

- 取消未來預約會補堂。
- 已完成出缺勤或已確認課程日誌的紀錄，未來需要更細的保護規則；目前仍以測試期資料整理為優先。

## 改期

改期預約必須使用 `moveBookingCascade()`。

同步項目：

- 從原 `slot.bookings` 移到目標 `slot.bookings`。
- 更新 `students[].scheduledBookings` 的 `slotId`、日期、時間、課程類型。
- 將 `classes` 成員從原課堂移到目標課堂。
- 使用 `updateMovedCourseLogs()` 更新已存在的課程日誌關聯。
- 使用 `appendBookingMoveTicketLog()` 只記錄改期，不重新扣堂、不補堂。
- 同步公開鏡像與學員查詢索引。

限制：

- 目前僅支援改到同課程類型。
- 原課程或目標課程已開始時不可改期。
- 若原課程已有非 pending 出缺勤狀態，應先處理課程紀錄，再改期。

## 刪除課程時段

刪除課程時段必須使用 `deleteSlotCascade()`。

同步項目：

- 對該 `slotId` 內所有 booking 執行 `cancelBookingCascade()`。
- 移除 `slots` 中的該時段。
- 移除 `classes` 中同一 `slotId` 的出缺勤課堂。
- 對每位已預約學員嘗試補回正確票券。
- 同步公開鏡像與學員查詢索引。

管理員提示應清楚說明：刪除已有預約的時段，會同步移除預約、出缺勤與課程紀錄，並嘗試補回堂數。

## 資料健康檢查

資料健康檢查是測試期與維運工具，不是正式使用者每天要操作的功能。

應檢查：

- 票券 total / used / left 是否合理。
- ticket logs 與 `scheduledBookings`、`slots.bookings` 是否一致。
- `classes` 是否有不存在的 studentId 或 slotId。
- `course_logs` 是否有不存在的 studentId 或 slotId。
- 學員總覽剩餘堂數與詳細頁方案紀錄是否一致。

原則：

- 檢查工具第一版只產生報告，不自動修資料。
- 修復工具要分成小而明確的動作，例如「清除孤兒日誌成員」、「重建學員查詢索引」。
- 正常營運流程應靠 cascade 函式避免資料錯位，而不是依賴事後修復。

## Firestore 成本與安全

- 這次 cascade 整理主要發生在管理員端，不增加學員端讀取。
- 學員端仍維持低讀取：`public_booking/state`、`web_config/flags`、單一 `student_lookup/{hash}`。
- 管理員端取消、改期、刪課會視資料變更寫回多個 `/data/*` 單文件，屬低頻管理操作，可接受。
- 強制同步公開鏡像會寫入 `public_booking/state` 與相關 `student_lookup` 文件；此操作應只由管理員觸發。
- 未來正式多老師版本必須加入 `tenantId`，所有資料與 lookup 都要依老師隔離。

## 回歸測試清單

每次修改核心資料流後，至少測：

- 學員購買方案，管理員收款後，學員可查到正確剩餘堂數。
- 學員單次預約後，行事曆、學員詳細頁、出缺勤與學員端剩餘堂數一致。
- 學員重複按預約不會重複扣堂或重複建立 booking。
- 管理員取消預約後，票券補回，行事曆與出缺勤紀錄消失，學員端可重新預約。
- 管理員改期後，不重複扣堂，原時段消失，目標時段出現。
- 管理員刪除已有預約的課程時段後，所有相關預約與出缺勤資料清掉，票券補回。
- 資料健康檢查不應顯示正常資料為需人工判讀。

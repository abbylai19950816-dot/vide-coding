# Gyrobooking 專案改進規格

## 目前架構判讀

目前最新分析版本為 `gyrobooking_low_cost_secure_v17_remove_purchase_requests.zip`。專案是 GitHub Pages 靜態前端，資料放在 Firebase Firestore，主要檔案為：

- `github_pages/index.html`：學生購課、查詢剩餘堂數、預約。
- `github_pages/admin.html`：管理員維護學員、票券、收費、課表、同步公開預約鏡像。
- `firestore.rules`：Firestore 權限。
- `docs/quota_checklist.md`：既有讀寫成本檢查表。

核心設計已經朝低成本方向演進：學生端主要讀 `public_booking/state` 與 `student_lookup/{hash}`，管理端才讀寫完整資料。這個方向是對的。

## 優先改善項目

### P0：Firestore Rules 不能全公開寫入

目前 `firestore.rules` 允許公開寫入多個敏感文件與 collection：

- `public_booking/state`
- `student_lookup/{lookupId}`
- `purchase_requests/{requestId}`
- `web_config/flags`
- `/data/students`
- `/data/payments`
- `/data/tickets`
- `/data/classes`
- `/data/course_logs`
- `/data/slots`
- `/data/booking_cfg`

這代表任何知道 Firebase 專案的人都能改資料。即使前端 UX 做得再好，資料仍可被直接寫壞。

建議：

- 學生端只允許讀 `public_booking/state`。
- 學生端只允許 get 指定 `student_lookup/{hash}`，不要允許 list。
- 學生端若仍需購課寫入，限制只能 create `purchase_requests`，且欄位白名單、長度限制、狀態固定為 `pending`。
- 管理端寫入需有 Firebase Auth custom claim，或至少用明確 admin allowlist。
- `/data/*` 應只允許管理員讀寫。

### P0：學生端循環預約仍走舊式大文件同步

`index.html` 的一般預約已使用 `runLowCostBooking()` transaction，但 `loopBooking()` 還會：

- 直接修改本機 `slots`
- `saveSlots(slots)`
- 讀寫 `tickets`
- `saveTickets(tickets)`
- 讀寫 `classes`
- `saveClasses(allClasses)`
- 讀寫 `students`
- 更新 `scheduledBookings`

這段會讓學生端重新碰到大量舊資料，破壞「學生端不讀寫 students/tickets/payments」的低成本原則，也可能造成多份資料不同步。

建議：

- 將循環預約改成使用同一個 Firestore transaction。
- transaction 只讀：
  - `public_booking/state`
  - `student_lookup/{hash}`
  - 必要 legacy doc：`/data/tickets`、`/data/students`
- transaction 一次更新：
  - `public_booking/state`
  - `/data/slots`
  - `/data/tickets`
  - `/data/students`
  - `student_lookup/{hash}`
- 前端只接收 transaction 回傳結果，不自行批次改 localStorage 後再同步。

### P1：資料模型長期應從大陣列單文件拆分

目前 `/data/students`、`/data/tickets`、`/data/payments` 是單文件包大陣列。短期低成本、簡單，但會有上限：

- Firestore 單文件 1 MiB 限制。
- 任一小修改都寫整包陣列。
- 多人或多裝置管理員同時操作時容易覆蓋。
- transaction 中讀寫大文件會提高延遲。

建議分階段：

- 短期保留單文件，但每次儲存前做大小檢查。
- 中期新增 append-only logs，例如 `/events/{id}` 紀錄購課、扣堂、預約、退款。
- 長期拆成：
  - `/students/{studentId}`
  - `/tickets/{ticketId}`
  - `/payments/{paymentId}`
  - `/slots/{slotId}`
  - `/booking_public/state` 或依月份分片。

### P1：公開鏡像 `public_booking/state` 需要瘦身

學生端會讀整個 `public_booking/state`。若課表越來越多，首頁每次載入會越來越重。

建議：

- 只同步未來 N 天，例如 45 或 60 天。
- 已過期 slot 不進公開鏡像。
- `bookings` 只保留必要欄位，不放電話、備註、內部 ticket id。
- 若未來課表很多，改成依月份分文件：`public_booking/months/{yyyyMM}`。

### P1：README 與既有文件疑似編碼損壞

目前 `README.md` 與 `docs/quota_checklist.md` 中文呈現亂碼。這會降低後續維護品質，也會讓 AI 讀專案時誤判。

建議：

- 重新以 UTF-8 儲存 README 與規格文件。
- 保留版本演進摘要，但把重點整理成現在的架構與部署流程。

### P2：管理工具應移到受控入口

`admin.html` 暴露多個 console 工具：

- `resetAllTestData()`
- `reconcilePaidPaymentsToTickets()`
- `repairBookingsToStudentRecords()`
- `deleteAllPurchaseRequests()`

這些工具有價值，但應加上明確 UI、權限與 dry-run。

建議：

- 建立「維護工具」區塊。
- 每個工具先顯示預估影響筆數。
- 支援 dry-run。
- 執行後寫入 maintenance log。

## 建議開發順序

1. 先修 Firestore rules，避免公開資料被改。
2. 把 `loopBooking()` 改成 transaction。
3. 重寫 README 與 quota checklist 為 UTF-8。
4. 加上公開鏡像大小與讀寫預算檢查。
5. 規劃資料模型拆分，不急著一次重構。


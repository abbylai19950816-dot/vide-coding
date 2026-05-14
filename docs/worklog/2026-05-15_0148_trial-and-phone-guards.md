# 2026-05-15 體驗課與手機重複註冊限制

## 需求摘要

新增體驗課設計與手機唯一性限制：

- 管理員可把方案設定為每位學員限一次。
- 管理員可設定方案不允許循環預約。
- 已有手機號碼註冊在系統中時，其他學員不可用同一手機重複註冊。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `active/gyrobooking_current/github_pages/index.html`
- `admin.html`
- `index.html`
- `active/gyrobooking_current/firestore.rules`
- `docs/ssot/data_model.md`
- `docs/ssot/product_scope.md`

## 行為變更

- 課程方案編輯器新增 `每位限一次` 與 `允許循環` 設定。
- 學員購課頁會顯示 `每人限一次`、`不可循環預約` 標籤。
- 學員送出購課前，會用 `phone_lookup/{hash}` 檢查手機是否已註冊。
- 若手機已註冊但姓名與手機查不到同一位學員，會禁止送出並請學員改用其他手機或聯絡老師。
- 若方案為 `oncePerStudent` 且同一位學員已使用過該方案，會禁止再次購買。
- 學員端循環預約會依 `noRecurringTypeIds` 隱藏並阻擋。
- 管理員手動新增/編輯學員時會阻擋重複手機。
- 管理員匯入購課申請時，若手機已屬於不同姓名的學員，會把申請標記為 `rejected`，避免建立錯誤學員資料。
- 管理員同步公開資料時會維護 `phone_lookup` 與擴充後的 `student_lookup` 欄位。

## Firestore 讀寫影響

- 學員購課送出前新增最多 1 次 `phone_lookup/{hash}` get。
- 若手機已存在或方案為 `oncePerStudent`，會再讀 1 次自己的 `student_lookup/{name|phone hash}` 來確認是否同一位學員與是否用過體驗方案。
- 學員端仍不 list 任何集合，不讀 `/data/*`。
- 管理員端同步公開資料會多寫 `phone_lookup/{hash}`；使用 hash 快取避免每次重複寫入。
- Firestore rules 新增 `phone_lookup` public get/admin write，並允許 `purchase_requests` 帶 `oncePerStudent`、`allowRecurring`。

## 驗證

- 檢查學生購課、方案卡片、循環預約、管理員學員新增/編輯、購課申請匯入、公開 lookup 同步路徑。
- 執行 HTML script 語法檢查。
- 執行低成本關鍵字檢查，確認學員端沒有新增集合讀取或 `/data/*` 讀取。
- 已部署 Firestore rules 到 `gyrobooking-fbfd5`。

## 後續風險

- `phone_lookup` 需要管理員端同步後才會完整覆蓋既有學員；本次已在管理員登入初始化後排程同步。
- 若管理員曾經直接改 Firestore 且未進管理員頁同步，公開索引可能短暫落後。

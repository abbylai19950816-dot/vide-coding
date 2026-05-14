# 安全申請緩衝流程與 rules 收緊

## 請求摘要

使用者確認修復順序：

1. 修正取消預約回補錯票券。
2. 修正收款重複開票券。
3. 加上公開課表同步狀態。
4. 做安全流程改造：`purchase_requests` / `booking_requests`。
5. 最後收緊 `firestore.rules`。

同時保留原本管理員體感：學員購課後不新增待審核按鈕，管理員仍在收費頁看到未收款紀錄，收款後手動標記為已收費並建立有效票券。

## 變更檔案

- `active/gyrobooking_current/github_pages/index.html`
- `active/gyrobooking_current/github_pages/admin.html`
- `index.html`
- `admin.html`
- `active/gyrobooking_current/firestore.rules`
- `docs/ssot/security_and_tenancy_plan.md`
- `docs/ssot/data_model.md`
- `docs/ssot/decision_log.md`
- `docs/worklog/2026-05-14_1715_secure-request-flow-and-rules.md`

## 行為變更

- 學員購課改為 create `purchase_requests/{requestId}`。
- 管理員頁登入後背景自動匯入 `purchase_requests`，轉成學員資料與 `unpaid` 收費紀錄。
- 學員預約改為 create `booking_requests/{requestId}`。
- 管理員頁登入後背景自動匯入 `booking_requests`，檢查容量與票券後更新正式預約、扣堂、出缺勤與 public mirror。
- 管理員不需要新增審核頁或審核按鈕。
- 取消預約回補票券時，優先找原本扣堂紀錄中包含該 `slotId` 的票券，避免補到錯方案。
- 收款建立票券時以 `paymentId` / `sourcePaymentId` 防重複開票。
- 管理員頁新增公開課表同步狀態顯示。
- rules 改為：
  - 公開讀 `public_booking/state`、`web_config/flags`
  - 公開 get 單筆 `student_lookup/{lookupId}`，禁止公開 list
  - 公開只能 create `purchase_requests` / `booking_requests`
  - `/data/*`、public mirror 寫入、lookup 寫入只允許 Email/Password 管理員

## Firestore 讀寫影響

學生端：

- 初始讀取仍維持 `public_booking/state` + `web_config/flags`。
- 查詢剩餘堂數仍是單筆 `student_lookup/{hash}` get。
- 購課新增 1 次 `purchase_requests` create。
- 預約新增 1 次 `booking_requests` create。
- 學生端不再直接寫 `/data/students`、`/data/payments`、`/data/slots`、`/data/tickets`。

管理員端：

- 登入後背景每 30 秒檢查 `purchase_requests` / `booking_requests`。
- 有 pending request 時才轉入私有資料並刪除 request。
- 匯入預約後同步 `public_booking/state` 與 `student_lookup`。

## 驗證 performed

- 四份頁面 script parse 通過：
  - `active/gyrobooking_current/github_pages/index.html`
  - `active/gyrobooking_current/github_pages/admin.html`
  - `index.html`
  - `admin.html`
- 掃描確認 `allow read, write: if true` 與公開 `student_lookup` list 已從 rules 移除。
- 根目錄 GitHub Pages 檔案已同步 active working copy。

## 後續風險

- 本機尚未安裝/登入 Firebase CLI，因此目前是 repo rules 檔案已收緊；若要正式套用到 Firebase 專案，還需要用 Firebase CLI 或 Console 部署 rules。
- 背景匯入需要管理員頁有登入並開啟；若管理員長時間未開頁，學員申請會暫存在 request collection。
- 若未來要即時預約並立即扣堂，需要導入 Cloud Functions / Cloud Run 後端交易。

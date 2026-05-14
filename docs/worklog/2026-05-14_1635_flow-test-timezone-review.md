# 學員與管理員流程測試：時區與全流程風險檢查

## 請求摘要

使用者希望測試學員預約全流程與管理員管理全流程，找出目前還有哪裡可能有 bug。先執行不寫入 Firebase 的靜態流程檢查與語法驗證；瀏覽器真機測試因本機瀏覽器連線權限受阻，尚未進行會寫入資料的 E2E。

## 變更檔案

- `active/gyrobooking_current/github_pages/index.html`
- `active/gyrobooking_current/github_pages/admin.html`
- `index.html`
- `admin.html`
- `docs/ssot/product_scope.md`
- `docs/ssot/decision_log.md`
- `docs/ssot/README.md`
- `docs/worklog/2026-05-14_1635_flow-test-timezone-review.md`

## 行為變更

- 學員購課日期、預約扣堂交易日期、學生頁剩餘票券判斷改用裝置當地日期。
- 管理員財務月份、排課月份、票券到期日、出缺勤昨天/明天快捷日期、修復工具日期改用裝置當地日期。
- 移除前端殘留的固定 `Date.now()+8*3600000` 日期邏輯。
- 避免在 UTC+8/UTC+9 等正時區用 `toISOString()` 取日期時被轉成前一天。

## Firestore 讀寫影響

- 本次修正不新增 Firestore 讀取或寫入。
- 學員預約仍維持既有 `runLowCostBooking()` transaction 路徑。
- 真正完整 E2E 會建立測試學員、票券、時段與預約，需使用者確認可寫入測試資料後再執行。

## 驗證 performed

- 掃描學生與管理員主要流程入口：`submitPurchase()`、`runLowCostBooking()`、`batchSubmitBooking()`、`loopBooking()`、`adminSignIn()`、學生詳情與取消預約相關函式。
- 掃描並修正固定 UTC+8 與易錯 `toISOString()` 日期切片。
- 解析 `active/gyrobooking_current/github_pages/index.html`、`active/gyrobooking_current/github_pages/admin.html`、`index.html`、`admin.html` 中的 scripts，確認語法可解析。
- 確認根目錄 GitHub Pages 檔案已與 active working copy 同步。

## 尚未完成的 E2E

- 學員完整購課、查詢剩餘堂數、單次預約、循環預約。
- 管理員新增學員、建立票券、建立時段、查看學生詳情、取消預約、出缺勤、財務標記收款。
- 以上會寫入 Firebase，需要管理員登入與可刪除的測試資料命名規則。

## 後續風險

- `active/gyrobooking_current/firestore.rules` 仍是測試期全開規則；直接鎖上會影響目前公開購課/預約流程，需另開安全規則與流程改造任務。
- 學生頁仍有直接建立 `data/students` / `data/payments` 的購課流程，未來若要降低公開寫入風險，應改成 `purchase_requests` 申請後由管理員審核入帳。

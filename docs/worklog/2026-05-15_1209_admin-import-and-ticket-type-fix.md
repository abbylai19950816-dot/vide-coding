# 2026-05-15 管理員匯入刷新與扣錯票券修正

## 需求摘要

使用者回報：

- 管理員頁面開著時，學員購課/預約後，收費資料需要登出再登入才看得到。
- 柯宇恆購買 `墊上嬋柔一對一體驗` 並預約 6/12，但扣堂扣到團課票券，導致無法驗證體驗課限一次流程。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`

## 行為變更

- 管理員端新增 `purchase_requests` 與 `booking_requests` collection listener。
- 有新的購課或預約申請時，管理員頁會 debounce 後自動執行 `importPendingRequests()`，不必登出再登入。
- 預約匯入扣票券時，`findBookingTicket()` 改為：
  - 先檢查同 slot 是否已扣過，避免重複匯入。
  - 再優先找 `typeId` 與預約時段 `slot.typeId` 完全相同的有效票券。
  - 若舊票券沒有 `typeId`，再用 `typeName` 與課程設定/時段名稱比對。
  - 不再讓有課程類型的時段任意扣到 `typeId` 空白的票券。

## Firestore 讀寫影響

- 管理員端新增兩個 collection listener：`purchase_requests`、`booking_requests`。
- 這只在管理員頁登入後使用，不影響學員端讀取成本。
- 學員端沒有新增讀取、寫入或 listener。

## 驗證

- 檢查 `importPurchaseRequests()`、`importBookingRequests()`、`findBookingTicket()` 與 `initFirebaseSync()`。
- 執行管理員頁 script 語法檢查。
- 執行低成本關鍵字檢查，確認學員端未新增讀寫路徑。

## 後續風險

- 柯宇恆既有已被扣錯的那一筆資料，若線上已經寫入，需要在管理員端手動回補/調整一次：團課票券補回 1 堂，墊上嬋柔一對一體驗票券扣 1 堂或重新處理該預約。

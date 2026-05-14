# Firestore Rules 改善規格

## 現況風險

目前 rules 對多數核心資料使用 `allow read, write: if true`。這適合早期測試，但不適合正式營運。

最大風險：

- 任意使用者可改學員資料、票券、付款、課表。
- 任意使用者可刪除或偽造 `student_lookup`。
- 任意使用者可開關 `web_config/flags`。
- 任意使用者可 list `student_lookup`，即使電話有遮罩，也可能被大量掃描。

## 目標權限

學生端匿名使用者：

- 可 read `public_booking/state`。
- 可 get 單一 `student_lookup/{hash}`。
- 可 create `purchase_requests/{id}`，若此流程仍保留。
- 不可 list `student_lookup`。
- 不可讀寫 `/data/*`。
- 不可寫 `web_config/flags`。

管理員：

- 可讀寫 `/data/*`。
- 可讀寫 `public_booking/state`。
- 可讀寫 `student_lookup/*`。
- 可讀寫維護工具需要的 collection。

## 建議 rules 草案方向

```js
function signedIn() {
  return request.auth != null;
}

function isAdmin() {
  return signedIn() && request.auth.token.admin == true;
}

match /public_booking/state {
  allow read: if true;
  allow write: if isAdmin();
}

match /student_lookup/{lookupId} {
  allow get: if true;
  allow list: if false;
  allow create, update, delete: if isAdmin();
}

match /data/{docId} {
  allow read, write: if isAdmin();
}

match /web_config/flags {
  allow read: if true;
  allow write: if isAdmin();
}
```

如果暫時沒有 admin claim，至少先把 `/data/*` 與 `web_config/flags` 的公開寫入移除。正式上線前再補完整登入權限。

## 注意

目前學生端 `runLowCostBooking()` 會從前端 transaction 寫 `/data/tickets`、`/data/students`、`/data/slots`。如果 rules 改成 admin-only，這段會失效。

有兩條路：

- 短期：維持有限公開 transaction，但用 rules 嚴格驗證欄位與差異。這很難寫完整。
- 正式：把預約 transaction 移到 Cloud Functions 或受控後端，由後端用 admin 權限寫入。

若堅持不使用 Cloud Functions，至少要接受前端公開寫入帶來的安全風險，並用 App Check、欄位驗證、速率限制與資料備份降低傷害。


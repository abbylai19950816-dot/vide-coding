# 安全規則與多老師租戶隔離設計

## 設計目標

- 學員不需要登入，也能用任何裝置讀到最新公開課表、方案設定與可預約時段。
- 學員端不得讀取完整學員名單、電話、票券、收費、出缺勤與管理資料。
- 管理員只能管理自己老師/工作室的資料。
- 未來支援多老師時，不同老師之間不能互相讀取學生資料、收費資料、課表管理資料。
- 優先維持 Firebase 免費版成本策略：學生端低讀取、低寫入、不做 collection-wide reads。

## 目前主要風險

目前 `active/gyrobooking_current/firestore.rules` 是測試期全開規則：

- 任意使用者可以讀寫 `/data/students`、`/data/tickets`、`/data/payments`、`/data/classes`。
- 任意使用者可以 list `student_lookup`，有被掃描與資料枚舉風險。
- 任意使用者可以改 `web_config/flags` 與 `public_booking/state`。
- 未來多老師時，單一全域 `/data/*` 結構無法隔離租戶。

## 核心原則

### 公開資料只放公開 mirror

學員端跨裝置要能讀到最新資料，正確做法不是讓學員讀 `/data/*`，而是由管理員端同步一份公開 mirror：

- `public_booking/state`：目前單老師公開課表與設定。
- 未來：`tenants/{tenantId}/public_booking/state`。

公開 mirror 只能包含：

- 課程方案設定 `booking_cfg`
- 可預約時段 `slots`
- 每個時段的容量、已預約數、是否額滿
- 必要的公開課程名稱、時間、地點

公開 mirror 不能包含：

- 學員電話、LINE、IG、備註
- 完整姓名名單
- 收費狀態
- 票券紀錄
- 出缺勤紀錄
- 私密 booking record

### 私密資料只放 tenant 私有區

未來多老師資料應放在：

- `tenants/{tenantId}/data/students`
- `tenants/{tenantId}/data/tickets`
- `tenants/{tenantId}/data/payments`
- `tenants/{tenantId}/data/classes`
- `tenants/{tenantId}/data/slots`
- `tenants/{tenantId}/data/course_logs`
- `tenants/{tenantId}/data/booking_cfg`

管理員 token 必須帶有可驗證的 `tenantId` 或 `tenantIds` claim。Firestore rules 依 token 判斷是否能讀寫該 tenant。

### 學員查詢只允許 get，不允許 list

學員查詢剩餘堂數仍使用單一文件：

- 目前：`student_lookup/{hash}`
- 未來：`tenants/{tenantId}/student_lookup/{hash}`

規則：

- `allow get: if true`
- `allow list: if false`
- 寫入只允許該 tenant 管理員

`student_lookup` 文件內容必須最小化：

- `studentId` 可保留內部 ID，但不應作為可推測個資。
- `name` 建議未來改成 `displayName` 或只顯示部分姓名。
- `phoneMasked` 可保留遮罩電話。
- `remainingByType`
- `totalRemaining`
- `updatedAt`

注意：如果 hash 是 `name|phone`，理論上仍可能被猜測。短期可接受風險較低，但長期若要更高安全性，應改為由管理員發給學員不可猜測的 `lookupToken`，或把查詢改成後端 API。

## 建議資料路徑

### 短期單老師過渡期

在尚未搬到多租戶前：

- `public_booking/state`：公開讀，管理員寫。
- `web_config/flags`：公開讀，管理員寫。
- `student_lookup/{lookupId}`：公開單文件 get，禁止 list，管理員寫。
- `purchase_requests/{requestId}`：公開 create，禁止公開 read/list/update/delete，管理員讀寫。
- `/data/*`：管理員讀寫，學員不可讀寫。

這個版本會保證學員任何裝置都能讀到最新公開課表，但會暴露一個實作問題：目前學員預約交易仍需要更新 `/data/slots`、`/data/tickets`、`/data/students`。因此不能直接把 `/data/*` 鎖成 admin-only 後立刻上線，必須先調整預約流程。

### 長期多老師版本

建議搬成：

```text
tenants/{tenantId}
tenants/{tenantId}/public_booking/state
tenants/{tenantId}/student_lookup/{lookupId}
tenants/{tenantId}/purchase_requests/{requestId}
tenants/{tenantId}/booking_requests/{requestId}
tenants/{tenantId}/data/{docId}
```

URL 或設定要帶 tenant：

- `index.html?tenant={tenantId}`
- `admin.html?tenant={tenantId}`
- 或使用自訂網域/路徑對應 tenant。

## 預約流程安全方案

### 方案 A：Firebase 免費版優先，採「預約申請」模式

適合先把 rules 收緊，又不使用 Cloud Functions。

學員端：

- 讀 `tenants/{tenantId}/public_booking/state`
- get `tenants/{tenantId}/student_lookup/{lookupId}`
- create `tenants/{tenantId}/booking_requests/{requestId}`

管理員端：

- 監看或讀取 `booking_requests`
- 按下核准後，由管理員權限更新私有 `/data/*`
- 同步 public mirror 與 student lookup

優點：

- 學員端永遠不寫私有資料。
- 安全規則容易嚴格。
- 不同裝置仍讀同一份 public mirror，資料最新。
- 符合 Firebase 免費版，不需要後端。

缺點：

- 學員預約不再是即時確認，而是「送出申請，待管理員確認」。
- 若要維持即時扣堂與名額保留，需要管理員端或後端即時處理。

### 方案 B：即時預約，使用後端執行交易

適合未來更正式商用。

學員端：

- 呼叫 Cloud Functions / Cloud Run API，例如 `createBooking`
- 後端用 Admin SDK 執行交易，更新 `slots`、`tickets`、`students`、`student_lookup`、`public_booking`

Firestore rules：

- 學員不能直接寫 `/data/*`
- 後端 Admin SDK 不受 Firestore client rules 限制，但 API 本身要驗證 request

優點：

- 學員可以即時預約、即時扣堂、即時回傳結果。
- 私有資料完全不開給公開 client 寫入。
- 最安全、最接近正式 SaaS 架構。

缺點：

- Cloud Functions 通常需要 Blaze 帳戶；即使有免費額度，也不完全是 Spark-only。

### 方案 C：純 Firestore client 即時交易

不建議作為正式版。

可以用 rules 嘗試只允許學員更新特定欄位，但因為學員端必須直接寫 `tickets`、`students`、`slots`，規則會變得脆弱，且難以防止惡意 client 偽造更新。

## 規則草案：短期單老師安全版

此草案不能直接部署到目前程式，除非先把學員預約改成 `booking_requests` 或後端交易。

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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

    match /web_config/flags {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /student_lookup/{lookupId} {
      allow get: if true;
      allow list: if false;
      allow create, update, delete: if isAdmin();
    }

    match /purchase_requests/{requestId} {
      allow create: if request.resource.data.keys().hasOnly([
        'id', 'tenantId', 'name', 'phone', 'phoneDigits', 'social', 'note',
        'customFields', 'typeId', 'typeName', 'planId', 'planName',
        'sessions', 'amount', 'date', 'status', 'createdAt', 'source'
      ])
      && request.resource.data.status == 'pending'
      && request.resource.data.name is string
      && request.resource.data.phoneDigits is string
      && request.resource.data.phoneDigits.matches('^09[0-9]{8}$');

      allow read, update, delete: if isAdmin();
    }

    match /data/{docId} {
      allow read, write: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 規則草案：多老師 tenant 版

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isSuperAdmin() {
      return signedIn() && request.auth.token.superAdmin == true;
    }

    function hasTenant(tenantId) {
      return signedIn()
        && (
          request.auth.token.tenantId == tenantId
          || (request.auth.token.tenantIds != null && tenantId in request.auth.token.tenantIds)
        );
    }

    function isTenantAdmin(tenantId) {
      return isSuperAdmin()
        || (
          hasTenant(tenantId)
          && request.auth.token.role in ['owner', 'admin', 'staff']
        );
    }

    match /tenants/{tenantId}/public_booking/state {
      allow read: if true;
      allow write: if isTenantAdmin(tenantId);
    }

    match /tenants/{tenantId}/student_lookup/{lookupId} {
      allow get: if true;
      allow list: if false;
      allow create, update, delete: if isTenantAdmin(tenantId);
    }

    match /tenants/{tenantId}/purchase_requests/{requestId} {
      allow create: if request.resource.data.tenantId == tenantId
        && request.resource.data.status == 'pending'
        && request.resource.data.name is string
        && request.resource.data.phoneDigits is string
        && request.resource.data.phoneDigits.matches('^09[0-9]{8}$');

      allow read, update, delete: if isTenantAdmin(tenantId);
    }

    match /tenants/{tenantId}/booking_requests/{requestId} {
      allow create: if request.resource.data.tenantId == tenantId
        && request.resource.data.lookupKey is string
        && request.resource.data.slotIds is list
        && request.resource.data.status == 'pending';

      allow read, update, delete: if isTenantAdmin(tenantId);
    }

    match /tenants/{tenantId}/data/{docId} {
      allow read, write: if isTenantAdmin(tenantId);
    }

    match /tenants/{tenantId}/web_config/flags {
      allow read: if true;
      allow write: if isTenantAdmin(tenantId);
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 推薦落地順序

1. 建立 tenant 概念，但先以單一 `tenantId = default` 運作。
2. 將 `public_booking/state` 搬到 `tenants/default/public_booking/state`，學生頁根據 tenant 讀取。
3. 將 `student_lookup/{hash}` 搬到 `tenants/default/student_lookup/{hash}`，禁止 list。
4. 將購課改成 `purchase_requests` create-only，管理員審核後入帳。
5. 將預約改成 `booking_requests` create-only，管理員審核或排程處理後扣堂。
6. 確認所有學生端不再寫 `/data/*`。
7. 部署短期安全 rules。
8. 未來有多老師時，為每位老師建立 tenant 與 custom claims。
9. 若要恢復即時預約，再導入 Cloud Functions / Cloud Run 後端交易。

## 2026-05-14 實作決策：背景自動匯入，不新增審核按鈕

目前採用 Firebase 免費版優先方案，但不新增管理員「待審核」頁面或審核按鈕。

學員購課：

- 學員端只 create `purchase_requests/{requestId}`。
- 管理員登入 admin 後，背景自動匯入 pending `purchase_requests`。
- 匯入後自動建立/更新學員資料，並建立 `unpaid` 收費紀錄。
- 管理員仍在原本收費頁標記已收款，標記後才建立有效票券。

學員預約：

- 學員端只 create `booking_requests/{requestId}`。
- 管理員登入 admin 後，背景自動匯入 pending `booking_requests`。
- 匯入時由管理員權限檢查時段、票券與容量，再更新 `slots`、`tickets`、`students`、`classes`。
- 匯入後同步 `public_booking/state` 與 `student_lookup`。

此做法保留現有管理員體感，同時讓學生端不再直接寫私密 `/data/*`。

## 2026-05-15 實作決策：管理員同步必須使用 Email/Password auth

管理員頁不得把匿名 Firebase auth 視為管理員登入。因為同一台瀏覽器可能先開過學員頁，學員頁會使用 anonymous auth 送出購課/預約申請；如果管理員頁把這個匿名狀態當成已登入，就會開始讀取 `purchase_requests` / `booking_requests`，但 Firestore rules 會拒絕，造成「申請匯入失敗」。

目前規則：

- `admin.html` 只有在 `providerData.providerId === 'password'` 且 `!user.isAnonymous` 時，才啟動 `initFirebaseSync()`。
- 偵測到 anonymous/student auth 時，管理員頁顯示登入畫面，並清除該非管理員 auth。
- `purchase_requests` / `booking_requests` 的背景匯入仍只在管理員登入後執行。
- 學員端不同裝置仍可讀 `public_booking/state` 與 `web_config/flags`，不受此限制影響。

## 驗證清單

- 未登入使用者可讀 `public_booking/state`，不同裝置都拿到最新 `updatedAt`。
- 未登入使用者不能讀 `/data/students`。
- 未登入使用者不能 list `student_lookup`。
- 未登入使用者只能 create `purchase_requests` / `booking_requests`，不能 read/list/update/delete。
- A 老師登入後只能讀寫 A tenant。
- B 老師登入後不能讀寫 A tenant。
- 管理員更新課表後，學員端重新載入或 listener 可看到最新公開 mirror。
- 公開 mirror 不包含電話、LINE、IG、備註、收費、票券明細。

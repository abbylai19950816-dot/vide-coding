# 低成本安全版 v1：部署與流量控制說明

## 這版解決什麼？

你要求：

1. 不使用 Cloud Functions，避免新增 Blaze / Functions 費用風險。
2. 學員頁不要讀整包 `students / payments / tickets`。
3. 同名學生不能錯植。
4. 要注意免費額度：每日 reads 50,000、writes 20,000。

這版採用「低成本過渡安全架構」：

```text
學員頁只讀：
- public_booking/state       1 read
- student_lookup/{hash}      1 read，只有輸入姓名手機後才讀

學員頁預約時寫：
- public_booking/state       1 write
- student_lookup/{hash}      1 write
```

## 預估讀寫量

### 學員打開頁面但不查詢

約 1~2 reads。

### 學員查詢一次方案

約 2~3 reads。

### 學員完成一次預約

約 2~3 reads + 2 writes。

### 1000 位學員一天各查一次

約 3000 reads，遠低於 50,000。

### 1000 位學員一天各預約一次

約 3000 reads + 2000 writes，遠低於 20,000。

## 很重要：不要開大量 onSnapshot

這版學生頁不再監聽：
- students
- payments
- tickets

也不監聽整包私密資料。

## 部署順序

### 1. 先上傳 GitHub Pages

把：

```text
github_pages/index.html
github_pages/admin.html
```

覆蓋 GitHub repo 原本的：

```text
index.html
admin.html
```

### 2. 更新 Firestore Rules

把 `firestore.rules` 貼到 Firebase Console 的 Rules，或用 Firebase CLI deploy。

### 3. 到管理員頁同步公開索引

部署後打開 `admin.html`，登入管理員。

接著開瀏覽器 Console，輸入：

```js
lowCostSyncPublicMirror('first-migration')
```

這會建立：

```text
public_booking/state
student_lookup/{hash}
```

第一次同步會寫入每位學生一筆 lookup。

例如 100 位學生，就是大約：
- 1 write：public_booking/state
- 100 writes：student_lookup

這是一次性，可接受。

## 後續使用

之後只要你在後台：

- 新增學生
- 標記付款
- 產生票券
- 修改課表
- 修改方案

系統會 debounce 2.5 秒後同步公開索引。

而且它會用本機 hash diff，沒有變動就不寫，避免寫入爆量。

## 安全等級說明

這不是 Cloud Functions 等級的強安全，因為沒有後端就無法完全防止惡意前端修改。

但相比原本版本，已大幅改善：

原本：
```text
學生頁可讀整包 students / payments / tickets
所有人個資與付款資料都有外洩風險
```

現在：
```text
學生頁只能讀 public_booking/state + 單一 student_lookup/{hash}
無法 list 全部學生
不再讀整包個資與付款資料
```

## 這版的限制

- 知道某人的姓名與手機者，可能查到該人的剩餘堂數。
- 沒有 Cloud Functions，無法做到真正後端防作弊。
- `public_booking/state` 是單一文件，課表量極大時要再拆月份文件。

## 什麼時候要升級？

等你確認開始穩定收費、有預算後，建議升級 Cloud Functions 版本。那時可以把：

```text
student_lookup write
public_booking update
扣堂 transaction
```

全部移到後端，才是真正 SaaS 商用安全版。


## v7 strict type mode

本版改成嚴格票券類型：

- `student_lookup.remainingByType` 一律使用課表 `slot.typeId` 當 key。
- 舊票券如果只有 `typeName / planName`，會在 admin 同步時用 `booking_cfg` 與課表名稱反查成 `typeId`。
- 若完全對不上，該票券會進入 `unresolvedTickets`，不列入可預約堂數。
- 若整個課表只有一種 typeId，舊票券可自動對應到唯一類型。


## v8 strict future slot mapping

本版仍維持嚴格類型，但同步時會優先把舊票券對應到「同名且有未來開放時段」的 current slot.typeId。

用途：
- 避免後台課程類型重新建立後，舊票券仍留在舊 typeId。
- 避免學員查得到 1 堂，但目前課表使用新 typeId，因此看不到時段。


## v9 normalized type matching

本版修正課程名稱格式差異造成的 typeId 對不上：

- 比對時移除 emoji、空白、標點與符號。
- 支援 `🧘 墊上嬋柔 一對二` 對到 `墊上嬋柔一對二`。
- 仍然優先對到有未來開放時段的 slot.typeId。


# 緊急資料修復與 v10 變更

## 為什麼剛剛資料會不見？

舊版學員頁在購課時仍會執行：

- `loadStudents()`
- `saveStudents(stuList)`
- `loadPayments()`
- `savePayments(payments)`

這會把瀏覽器 localStorage 裡的整包資料寫回 Firestore `/data/students`、`/data/payments`。

如果學員手機或瀏覽器只有部分快取，就會用「部分資料」覆蓋完整資料，導致後台看起來多位學員資料消失。

## v10 已修正

學員頁購課不再寫：

- `/data/students`
- `/data/payments`
- `/data/tickets`

改成只建立：

- `/purchase_requests/{id}`

後台原始資料不會再被學生頁覆蓋。

## 目前資料怎麼救？

請先到 Firebase Console → Firestore：

1. 打開 `/data/students`
2. 看文件內 `value` 陣列是否真的被覆蓋成只剩少數學生
3. 如果真的被覆蓋，可以用下列來源救：
   - 其他電腦瀏覽器的 localStorage
   - 管理員頁之前開過的瀏覽器快取
   - Firebase Console 的匯出備份，如果有
   - Chrome DevTools → Application → Local Storage → `pilates_students`

如果管理員頁某台電腦仍看得到完整資料，請不要重新整理，立刻在 Console 執行：

```js
copy(localStorage.getItem('pilates_students'))
```

把內容貼到記事本備份。

payments 也一樣：

```js
copy(localStorage.getItem('pilates_payments'))
```

tickets：

```js
copy(localStorage.getItem('pilates_tickets'))
```



## v11 reset tool

上傳 `github_pages/admin.html` 後，進入管理員頁 Console 執行：

```js
resetAllTestData()
```

會清除：
- `/data/students`
- `/data/tickets`
- `/data/payments`
- `/data/classes`
- `/data/course_logs`
- `/data/slots`
- `/public_booking/state.slots`
- `student_lookup` collection
- `purchase_requests` collection

會保留：
- `/data/booking_cfg`
- `web_config/flags`

清空完後，請重新整理 admin.html。


## v12 purchase review

學員購課現在只會新增到 `purchase_requests`。

管理員頁新增：
- 右下角「待確認購課」按鈕
- Console 可用：
  - `loadPurchaseRequests()`
  - `approvePurchaseRequest("申請id")`
  - `rejectPurchaseRequest("申請id")`

確認後才會寫入：
- `/data/students`
- `/data/payments`
- `/data/tickets`

這樣學員頁不會再覆蓋原始管理資料。


## v13 restored original payment flow

本版恢復原本流程：

1. 學員頁購課 → 寫入 `purchase_requests`
2. 管理員確認申請 → 建立/更新學員資料 + 建立「未收費」payment
3. 管理員在收費頁手動改為已收費
4. 已收費後才建立有效票券，並同步 `student_lookup`

如果已收費但學員頁仍查不到，可在管理員 Console 執行：

```js
reconcilePaidPaymentsToTickets()
```

它會把 paid payments 補開成 tickets，並同步 lookup。


## v14 restore original purchase flow

本版恢復你原本流程：

1. 學員購課後，直接在 `/data/students` 建立/更新學員資料。
2. 同時在 `/data/payments` 建立一筆 `status: unpaid`、`method: 待確認` 的收費紀錄。
3. 不會直接開通票券；管理員仍要在收費頁手動改為已收費。
4. 寫入方式改成 Firestore transaction，會先讀取 Firebase 最新資料再附加，避免舊手機快取覆蓋整包資料。

預約課程時：
- 更新 `public_booking/state`
- 同步更新後台行事曆用的 `/data/slots`


## v15 booking sync

本版修正學員預約後的後台連動：

預約成功時同一個 transaction 會更新：
- `public_booking/state`
- `/data/slots`：管理員行事曆會看到 1/1
- `/data/tickets`：方案紀錄剩餘堂數會扣除
- `/data/students`：學生資料增加 `scheduledBookings`
- `/student_lookup/{hash}`：學員頁剩餘堂數同步減少

如果你已有舊預約需要修復，可在管理員 Console 執行：

```js
repairBookingsToStudentRecords()
```


## v16 ticket match fix

修正學員頁已顯示剩餘堂數，但預約時出現「找不到可扣抵的後台票券」：

扣後台票券時現在會：
1. 優先比對 `typeId`
2. 再比對正規化後的 `typeName / planName / item`
3. 如果該學員只有一張有效票券，允許作為安全 fallback 扣除

這可處理舊資料中課程名稱一致但 typeId 缺失或不同步的情況。


## v17 remove purchase request UI

本版移除管理員頁右下角「待確認購課」按鈕與 approve/reject 購課工具。

舊的 `purchase_requests` 可在管理員 Console 執行：

```js
deleteAllPurchaseRequests()
```

刪除完成後，這個 collection 可留空，不影響系統。

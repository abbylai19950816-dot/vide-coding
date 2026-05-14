# 工作紀錄：管理員頁與學生頁潛在 bug 檢查

## 需求摘要

使用者要求檢查目前管理員頁面與學生頁面是否有潛在 bug 需要修復。另提醒先前 UX 改善建議先記錄，等目前 bug 修完後再回來優化。

## 發現與修正

### 1. 學生端課表可能顯示今天已過時間的時段

原本學生端課表主要用日期範圍顯示本週時段，沒有排除今天但時間已過的 slot。這會讓學生在下午仍可能看到今天上午或稍早已發生的空時段。

修正：

- 新增裝置當地時間 helper：
  - `localDateStr()`
  - `localDateTimeKey()`
  - `addDaysToDateStr()`
  - `normalizeTimeKey()`
  - `slotDateTimeKey()`
  - `isFutureSlot()`
- `renderSlotList()` 改為只顯示 `isFutureSlot(s)` 的時段。
- `loopBooking()` 候選時段也改為只選未來時段。

### 2. 學生端低成本驗證使用 UTC 日期

低成本驗證在判斷是否有 future open slot 時使用 `new Date().toISOString().split('T')[0]`，這是 UTC 日期。若使用者裝置在 UTC+8、UTC+9 等時區，日期可能與當地日期不同，造成可預約類型判斷不準。

修正：

- 改用 `isFutureSlot(s)` 判斷是否仍為可預約時段。

### 3. 管理端公開 lookup 同步使用 UTC 日期

管理端 `lowCostBuildLookupPayloads()` 原本使用 UTC 日期判斷 future open slot。這會影響 `student_lookup` 產生與 type mapping。

修正：

- 改用管理端裝置當地時間 helper 與 `isFutureSlot(s)`。
- 票券到期比對保留用 `todayStr()` 產生的裝置當地日期。

### 4. 管理端上課紀錄只用日期判斷歷史課程

學員詳情的最近課程與全部上課紀錄原本使用 `cl.date <= today`。今天未發生的晚間課可能被提前算進歷史紀錄。

修正：

- 新增 `classDateTimeKey()` 與 `isPastOrStartedClass()`。
- 最近課程與全部上課紀錄改用課程日期時間判斷。

### 5. 管理端取消預約用姓名移除 booking

`cancelStudentBooking()` 原本從 slot bookings 移除預約時用姓名比對。若有同名學員，可能誤刪另一人的預約。

修正：

- 優先使用 `studentId` 比對。
- 只有 legacy booking 沒有 `studentId` 時才用姓名 fallback。
- attendance members 與 refund ticket 的 studentId 比對改成字串正規化，避免 number/string 不一致。

## 變更檔案

- `active/gyrobooking_current/github_pages/index.html`
- `active/gyrobooking_current/github_pages/admin.html`
- `index.html`
- `admin.html`
- `docs/worklog/2026-05-14_1605_admin-student-bug-review.md`

## Firestore 讀寫影響

無新增 Firestore read/write。此次修正都是前端時間判斷、cache 篩選與管理端取消預約的比對邏輯。

學生端仍維持：

- 初始讀 `public_booking/state` 與 `web_config/flags`。
- 查詢讀單一 `student_lookup/{hash}`。
- 預約走既有 transaction。

## 驗證

- 用 Node 驗證時間判斷：
  - `2026-05-14T00:00` 在 `2026-05-14 15:39` 後為 false。
  - `2026-05-14T14:00` 為 false。
  - `2026-05-14T16:00` 為 true。
  - `2026-05-15T09:00` 為 true。
- 解析 `index.html` 與 `admin.html` 內 script：
  - `index.html scripts parsed: 5`
  - `admin.html scripts parsed: 7`
- 搜尋 Firestore 關鍵字，確認沒有新增學生端高成本 collection read。

## 後續風險

- 學生端檔案仍保留舊版 `batchSubmitBooking()` / `loopBooking()` 宣告，但檔案後段的低成本覆寫版本會覆蓋執行。後續整理時可移除舊版區塊，降低維護誤判。
- `firestore.rules` 仍是正式上線前的重要安全風險，需另案修正。

# Firestore 低讀寫成本規格

## 成本目標

學生端每次正常流程的讀寫上限：

- 首頁載入：最多 2 reads。
  - `public_booking/state`
  - `web_config/flags`
- 查詢學員剩餘堂數：最多 1 read。
  - `student_lookup/{hash}`
- 單次預約：最多 4 reads、5 writes。
  - reads：`public_booking/state`、`student_lookup/{hash}`、`/data/tickets`、`/data/students`
  - writes：`public_booking/state`、`/data/slots`、`/data/tickets`、`/data/students`、`student_lookup/{hash}`
- 購課送出：如果沒有付款串接，最多 1 create write。

管理端每次啟動：

- 可讀完整 `/data/*`，但應維持一次性讀取，不輪詢。
- 監聽器只建立一次，不重複 subscribe。
- render 必須 debounce。

## 禁止模式

學生端禁止：

- `getDocs(collection(db, 'students'))`
- `getDocs(collection(db, 'tickets'))`
- `getDocs(collection(db, 'payments'))`
- 讀 `/data/students` 只為了查身份。
- 讀 `/data/tickets` 只為了顯示剩餘堂數。
- 在非 transaction 流程中同時改 `slots`、`tickets`、`students`。
- 使用 `onSnapshot` 監聽大型資料集合。
- 沒有 hash diff 就重寫全部 `student_lookup`。

管理端禁止：

- 在 render function 裡直接觸發 Firestore read。
- 每次切頁都重新建立 listener。
- 修改一筆資料時無條件重寫公開鏡像與全部 lookup。
- 用 `setInterval` 輪詢 Firestore。

## 推薦模式

學生端：

- 首頁只讀公開鏡像。
- 學員驗證用 `name + phone` 正規化後 hash，get 單一 lookup 文件。
- 預約、扣堂、更新 lookup 必須包在 transaction。
- localStorage 只當快取，不當權威資料來源。

管理端：

- 初始化讀完整資料一次，存入 memory cache 與 localStorage。
- 所有 save function 先更新 memory cache，再寫 Firestore。
- Firestore listener 回來時，比對 JSON/hash；相同就跳過 render。
- 公開鏡像同步使用 debounce 與 hash diff。

## 部署前檢查

每次改動若碰到 Firestore、localStorage、預約、票券、課表，必須檢查：

- 學生端首頁是否仍只讀公開資料。
- 學生端查詢是否只 get 單一 `student_lookup/{hash}`。
- 預約是否在 transaction 中完成。
- 是否新增任何 `getDocs`、`onSnapshot`、無條件批次寫入。
- 是否可能造成整包 `/data/students`、`/data/tickets`、`/data/slots` 被反覆寫入。
- 是否會讓 `public_booking/state` 文件持續變大。
- Firestore rules 是否仍符合最小權限。

## 讀寫預算警戒線

- reads 超過 30,000/day：先檢查學生端是否多讀、重複 listener、公開鏡像是否被拆分。
- writes 超過 10,000/day：先檢查 lookup 是否整批重寫、admin 是否頻繁 save、公開鏡像是否無 hash diff。
- `public_booking/state` 接近 700 KiB：開始拆月份文件。
- 任一 `/data/*` 文件接近 700 KiB：開始拆 collection 或封存舊資料。


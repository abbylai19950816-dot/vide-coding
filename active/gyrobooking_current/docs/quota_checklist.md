# 讀寫額度防爆 checklist

## 學員頁

- [x] 不讀 `/data/students`
- [x] 不讀 `/data/payments`
- [x] 不讀 `/data/tickets`
- [x] 不訂閱私密資料 onSnapshot
- [x] 進頁只讀 `public_booking/state`
- [x] 查詢時只讀一筆 `student_lookup/{hash}`
- [x] 預約時用 transaction 更新 2 份文件

## 管理頁

- [x] 管理頁仍可讀 legacy admin data
- [x] public mirror 使用 debounce，避免每次打字都寫
- [x] lookup 文件使用 hash diff，沒變動不寫
- [x] 課表與設定集中在 `public_booking/state`，避免學生頁讀多筆

## 建議操作習慣

1. 不要一直反覆重整學生頁做壓測。
2. 後台大量修改學生資料後，等 3 秒再關頁。
3. 每天可在 Firebase Usage 看 read/write 是否異常。
4. 若 reads 接近 30,000/day，再拆 `public_booking/state` 成月份文件。
5. 若 writes 接近 10,000/day，表示多人同時預約量很高，應升級 Functions。

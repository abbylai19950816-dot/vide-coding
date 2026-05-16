# 學生查詢索引生命週期 SSOT

## 目的

`student_lookup/{hash}` 是學生端用姓名與手機查詢可預約方案的低成本索引。學生端不能 bulk read `students`、`tickets`、`payments`，因此 lookup 文件的生命週期必須由管理員端維護。

## 查詢語意

- `student_lookup` 不存在：代表查不到此姓名與手機的學員資料。
- `student_lookup` 存在，但 `totalRemaining` / `remainingByType` 沒有可用堂數：代表查得到學員，但目前沒有可用方案。
- `student_lookup` 存在，且有剩餘堂數，但沒有對應課程時段：代表學員已有方案，但管理員尚未新增對應課程或沒有未來名額。

學生端文案必須維持上述區分，避免把「已刪除或不存在的學員」顯示成「沒有可用方案」。

## 寫入與刪除規則

- 新增或更新學員、票券、預約、取消、刪除課程、收款狀態改變後，管理員端應同步更新 `student_lookup`。
- 刪除學員時，必須刪除該學員的 `student_lookup/{sha256(name|phone)}`。
- 若同一支手機沒有其他學員仍存在，也必須刪除 `phone_lookup/{sha256(phone)}`。
- 強制重建學員查詢索引時，除了重新寫入現有學員，也要清除不屬於現有學員的舊 `student_lookup` / `phone_lookup` 文件。

## 成本規則

- 學生端查詢仍只能讀取單一 `student_lookup/{hash}`。
- `student_lookup` / `phone_lookup` prune 只能在管理員端維運工具執行，不能放在學生端，也不能放在一般 render 流程。
- 未來多老師版本必須把 lookup 與 prune 範圍限制在同一個 `tenantId`。

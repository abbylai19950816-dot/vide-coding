# 2026-05-16 22:03 刪除學員 Cascade 集中化

## 需求摘要

依照下一步優化計畫，將刪除學員流程集中成 `deleteStudentCascade(studentId)`，避免刪除學員時只刪部分資料，留下行事曆預約、出缺勤、票券、收費或課程日誌孤兒資料。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/core_data_flows.md`
- `docs/worklog/2026-05-16_2203_delete-student-cascade.md`

## 行為變更

- 新增 `studentRecordMatches(record, studentId, student)`，統一判斷資料是否屬於同一學員。
- 新增 `deleteStudentCascade(studentId, options)`，集中處理：
  - `students`
  - `tickets`
  - `payments`
  - `slots[].bookings`
  - `classes[].members`
  - `course_logs`
  - `public_booking/state` / `student_lookup` 同步
- `deleteStudent(id)` 改成只負責確認、呼叫 cascade、刷新 UI 與顯示結果。
- 更新 `core_data_flows.md`，將刪除學員流程納入 SSOT。

## Firestore 讀寫影響

- 學員端讀取與寫入路徑沒有新增。
- 刪除學員屬管理員低頻危險操作，會依實際影響寫回 `students`、`tickets`、`payments`、`slots`、`classes`、`course_logs`，並同步公開鏡像。

## 驗證

- 已同步 active 版 `admin.html` 到根目錄 `admin.html`。
- 已用 `new Function()` 解析 active 與根目錄 `admin.html` 內非 module scripts，確認語法可解析。
- 已跑 `git diff --check`，僅有 Windows 換行警告，沒有 whitespace error。
- 已用假資料 smoke test：刪除學員「安安」後，另一位學員資料保留；安安的 `students`、`tickets`、`payments`、`slots[].bookings`、`classes[].members`、`course_logs` 關聯均移除。

## 後續風險

- 正式營運後建議新增「封存 / 停用學員」取代直接刪除，保留歷史資料但讓學員無法預約。

# 2026-05-16 清除孤兒日誌成員

## 需求摘要

資料一致性檢查顯示「課程日誌學員 ID 找不到學員」。這通常是測試期刪除學員後，課程日誌仍保留不存在的 `studentId`。需要提供一個低風險維運工具清除這類孤兒成員。

## 變更內容

- `active/gyrobooking_current/github_pages/admin.html`
  - 「課程日誌學員 ID 找不到學員」檢查項目新增 `清除孤兒日誌成員` 修復按鈕。
  - 新增 `cleanOrphanCourseLogMembers()`：
    - 以目前 `/data/students` 的 student id 為準。
    - 移除 `/data/course_logs` 中不存在的 `studentIds[]`。
    - 同步移除同 index 的 `studentNames[]`，避免 id/name 錯位。
    - 若 `attendance` 是數字，依移除人數扣回。
    - 保留空日誌列，不自動刪除整筆日誌。
    - 執行前顯示確認訊息，列出影響日誌數與成員數。
    - 執行後重新渲染並重跑資料一致性檢查。
- `admin.html`
  - 已同步 GitHub Pages 根目錄入口檔。
- `docs/ssot/data_model.md`
  - 補上孤兒日誌成員清理規格。
- `docs/ssot/cost_model.md`
  - 補上此工具的低頻維運寫入成本。

## Firestore 讀寫影響

- 學生端：無新增讀取或寫入。
- 管理員端：只有按下修復並確認後，會重寫 `/data/course_logs` 一份文件。
- 資料健康檢查仍由管理員端執行，不增加學生端讀取。

## 驗證

- 已確認 `course_logs` 腳本段語法可解析。
- 已確認修復工具只操作 `course_logs`，不會刪除學員、票券、收費、行事曆或出缺勤資料。

## 後續風險

- 若孤兒 studentId 其實是真實學員被誤刪，清除後日誌會移除該學員的歷史引用。因此工具保留確認步驟，正式營運時應先確認是否需要復原學員資料。

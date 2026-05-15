# 2026-05-15 18:03 預約列按鈕對齊課程名稱

## 需求摘要

使用者希望學員詳細頁「預約課程時段」中的操作按鈕不要只靠左到整列起點，而是跟第一行的課程名稱左邊界對齊。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-15_1803_booking-actions-align-course.md`

## 行為變更

- 預約列第二行按鈕維持靠左排列。
- 按鈕列增加左側間距，對齊第一行課程名稱欄位。

## Firestore 讀寫影響

- 無 Firestore read/write 變更。
- 純 UI 排版微調。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。

## 後續風險

- 目前用固定欄寬計算按鈕縮排，若未來日期格式或時間欄位寬度大幅調整，需同步調整縮排值或改成 CSS grid 共享欄位。

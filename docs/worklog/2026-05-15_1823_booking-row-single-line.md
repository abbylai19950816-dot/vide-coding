# 2026-05-15 18:23 預約列改回單行排版

## 需求摘要

使用者接受課程名稱在單行中約顯示 7-9 個中文字，要求將學員詳細頁「預約課程時段」改回單行排列：

`日期 時間 課程名稱 課程紀錄 改時間 取消`

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-15_1823_booking-row-single-line.md`

## 行為變更

- 預約列改為單行六欄 grid：
  - 日期 `74px`
  - 時間 `44px`
  - 課程名稱 `minmax(72px, 1fr)`
  - 三個操作按鈕 `auto`
- 課程名稱維持單行省略，避免壓縮操作按鈕。
- 課程名稱仍移除開頭 emoji，降低視覺偏移。

## Firestore 讀寫影響

- 無 Firestore read/write 變更。
- 純 UI 排版調整。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。

## 後續風險

- 若手機寬度更窄或按鈕文字變長，課程名稱會更早省略；目前依使用者接受的 7-9 個中文字顯示範圍設計。

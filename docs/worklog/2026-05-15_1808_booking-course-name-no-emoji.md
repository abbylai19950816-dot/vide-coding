# 2026-05-15 18:08 預約列課程名稱移除 emoji

## 需求摘要

使用者回報預約列中課程名稱與按鈕看起來沒有完全對齊，懷疑是課程名稱前方 emoji 造成視覺偏移，希望可以移除 emoji。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-15_1808_booking-course-name-no-emoji.md`

## 行為變更

- 學員詳細頁「預約課程時段」的課程名稱顯示會移除開頭 emoji/icon，只保留純課程名稱。
- 按鈕列改為使用與第一行相同的 grid 欄位，按鈕放在課程名稱同一欄，避免用固定 padding 模擬對齊。

## Firestore 讀寫影響

- 無 Firestore read/write 變更。
- 純 UI 顯示與排版調整。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。

## 後續風險

- 目前只在預約列移除開頭 emoji，不影響其他頁面的課程類型圖示顯示。

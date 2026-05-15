# 2026-05-15 18:30 預約列日期時間欄位微調

## 需求摘要

使用者希望在維持單行排版與原按鈕文字的前提下，減少時間左右兩側留白，讓課程名稱可顯示更多文字。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-15_1830_booking-row-compact-time.md`

## 行為變更

- 預約列單行 grid 微調：
  - 日期欄由 `74px` 改為 `68px`
  - 時間欄由 `44px` 改為 `38px`
  - 課程名稱欄由 `minmax(72px, 1fr)` 改為 `minmax(84px, 1fr)`
  - 欄距由 `6px` 改為 `4px`
- 操作按鈕文字維持 `課程紀錄`、`改時間`、`取消`。

## Firestore 讀寫影響

- 無 Firestore read/write 變更。
- 純 UI 排版微調。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。

## 後續風險

- 在極窄螢幕或課程名稱很長時仍會省略課程名稱；若仍不足，需考慮縮短按鈕文字或回到兩行配置。

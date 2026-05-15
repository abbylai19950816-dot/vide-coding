# 2026-05-15 18:15 預約列固定欄寬對齊

## 需求摘要

使用者回報移除 emoji 後，預約列的課程名稱與按鈕仍未完全對齊。

## 根因

上一版第一行與第二行使用兩個獨立 grid，且欄位使用 `minmax(..., auto)`。空欄位在第二行會重新計算寬度，導致按鈕列和課程名稱欄位仍有視覺偏移。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-15_1815_booking-row-fixed-grid.md`

## 行為變更

- 預約列第一行與第二行都改用固定欄寬：
  - 日期欄：`86px`
  - 時間欄：`56px`
  - 課程/按鈕欄：`minmax(0, 1fr)`
- 按鈕列放在與課程名稱相同的第三欄，避免獨立 grid 自動欄寬造成偏移。

## Firestore 讀寫影響

- 無 Firestore read/write 變更。
- 純 UI 排版調整。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。

## 後續風險

- 若未來日期格式改得更長，需重新評估日期欄固定寬度是否足夠。

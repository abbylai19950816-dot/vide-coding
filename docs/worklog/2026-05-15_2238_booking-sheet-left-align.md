# 2026-05-15 22:38 變更預約 Sheet 資訊靠左

## 需求摘要

使用者希望「變更預約」與「更改預約時間」sheet 中的資訊區塊靠左對齊，並與標題左緣一致；包含 `目前預約`、`原預約`、`可更改時段` 與其內容。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-15_2238_booking-sheet-left-align.md`

## 行為變更

- 移除變更預約 sheet 中 `目前預約` 的淺底卡片內縮。
- 移除更改預約時間 sheet 中 `原預約`、`可更改時段` 的淺底卡片內縮。
- 標籤與內容改為直接使用 sheet body 左緣，視覺上與 sheet 標題一致。

## Firestore 讀寫影響

- 無 Firestore read/write 變更。
- 純 UI 排版調整。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。

## 後續風險

- 若未來所有 sheet 都要統一左對齊風格，可再整理共用 CSS class，避免 inline style 分散。

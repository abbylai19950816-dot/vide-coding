# 2026-05-14 行事曆月份選擇器

## 需求摘要

管理員行事曆原本在年份與月份旁各有控制箭頭或下拉操作，雖然可自由切換年月，但視覺較雜。希望改成更直覺、符合目前系統 sheet 風格的月份切換設計。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-14_2135_schedule-month-picker.md`

## 行為變更

- 行事曆上方改為左右箭頭切換上一月/下一月。
- 中間顯示單一月份按鈕，例如 `2026 年 5 月`。
- 點中間月份後開啟 bottom sheet，可用年份左右箭頭切換年份，並用 12 個月份按鈕直接跳月份。
- 新增「回到本月」按鈕，會回到目前裝置當地日期所在月份，並選取今天。

## Firestore 讀寫影響

- 本次只調整管理員端行事曆 UI 與本地狀態。
- 沒有新增 Firestore read/write。
- 沒有影響學員端。

## 驗證

- 已執行 HTML script parse 檢查，`index.html` 與 `admin.html` 的所有 script 皆可解析。

## 後續風險

- 尚未用瀏覽器視覺驗收 sheet 排版；若需要可再做截圖檢查與微調。

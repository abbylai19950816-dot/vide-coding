# 2026-05-14 出缺勤日期選擇器年份月份流程

## 需求摘要

出缺勤日期選擇器點擊標題 `2026 年 5 月` 時，應先進入年份選擇，選完年份後再進入月份選擇，最後回到日期格，而不是只切換年份後直接回日期。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-14_2325_attendance-picker-year-month-flow.md`

## 行為變更

- 出缺勤日期選擇器新增三層狀態：
  - `date`: 顯示日期格。
  - `year`: 顯示年份格。
  - `month`: 顯示月份格。
- 點選日期選擇器標題會進入年份格。
- 選年份後自動進入月份格。
- 選月份後回到日期格並顯示該年月。
- 在年份與月份選擇狀態下，左右切月箭頭保持占位但隱藏，避免標題位置跳動。

## Firestore 讀寫影響

- 本次只調整管理員端 UI 與本地年月狀態。
- 沒有新增 Firestore read/write。
- 沒有影響學員端。

## 驗證

- 已執行 HTML script parse 檢查，`index.html` 與 `admin.html` 的所有 script 皆可解析。

## 後續風險

- 尚未用瀏覽器互動測試實際點擊手感；若需要可再根據實機畫面微調。

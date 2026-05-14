# 2026-05-14 出缺勤日期選擇器改為 Sheet

## 需求摘要

出缺勤頁「回到今天」按鈕放在主畫面仍不夠和諧。希望改採方案 C：主畫面不顯示回到今天，點日期後在日期選擇介面中提供「回到今天」，並讓日期選擇介面更接近行事曆的操作風格。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-14_2245_attendance-date-picker-sheet.md`

## 行為變更

- 移除出缺勤主畫面上的「回到今天」按鈕列。
- 點擊出缺勤日期會開啟 bottom sheet 日期選擇器。
- 日期選擇器提供：
  - 上一月 / 下一月
  - 當月日期格
  - 今天標示
  - 目前選取日期標示
  - 「回到今天」按鈕
- 選擇日期或回到今天後會關閉 sheet 並重新渲染出缺勤內容。

## Firestore 讀寫影響

- 本次只調整管理員端 UI 與本地日期狀態。
- 沒有新增 Firestore read/write。
- 沒有影響學員端。

## 驗證

- 已執行 HTML script parse 檢查，`index.html` 與 `admin.html` 的所有 script 皆可解析。

## 後續風險

- 尚未用瀏覽器截圖確認實際 sheet 視覺；如需要可再進行畫面微調。

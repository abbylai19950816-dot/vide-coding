# 2026-05-14 出缺勤今天按鈕位置調整

## 需求摘要

出缺勤頁新增「今天」按鈕後，按鈕出現在右箭頭旁邊，造成切到隔天時右箭頭位置被擠開，連續往右按時容易誤按成回到今天。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-14_2205_attendance-today-button-placement.md`

## 行為變更

- 將「回到今天」按鈕移到日期導覽列下方。
- 左右日期箭頭位置固定，不會因為按鈕顯示或隱藏而位移。
- 目前日期不是今天時，下方顯示「回到今天」；已在今天時自動隱藏。

## Firestore 讀寫影響

- 本次只調整管理員端 UI 排版與 class 切換。
- 沒有新增 Firestore read/write。
- 沒有影響學員端。

## 驗證

- 已執行 HTML script parse 檢查，`index.html` 與 `admin.html` 的所有 script 皆可解析。

## 後續風險

- 無。

# 2026-05-14 出缺勤回到今天按鈕

## 需求摘要

管理員出缺勤頁面需要一個快速回到今天的操作，方便查看其他日期後回到當日點名。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-14_2150_attendance-go-today.md`

## 行為變更

- 出缺勤日期導覽新增「今天」膠囊按鈕。
- 當目前選取日期不是今天時，按鈕會顯示。
- 點擊後會用裝置當地日期切回今天並重新渲染出缺勤內容。
- 當目前已是今天時，按鈕自動隱藏，避免重複操作。

## Firestore 讀寫影響

- 本次只調整管理員端 UI 與本地日期狀態。
- 沒有新增 Firestore read/write。
- 沒有影響學員端。

## 驗證

- 已執行 HTML script parse 檢查，`index.html` 與 `admin.html` 的所有 script 皆可解析。

## 後續風險

- 若手機寬度過窄，日期導覽可能略擁擠；已使用膠囊小按鈕降低寬度需求。

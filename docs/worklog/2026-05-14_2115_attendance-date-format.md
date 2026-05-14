# 2026-05-14 出缺勤日期格式調整

## 需求摘要

管理員出缺勤頁面在非今日日期時，同時顯示「5月15日」與「2026/5/15 (五)」，資訊重複。希望只有今天特別標示「今天」，其他日期只保留完整日期格式。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-14_2115_attendance-date-format.md`

## 行為變更

- 出缺勤頁日期導覽：
  - 今日顯示第一行「今天」，第二行顯示完整日期，例如 `2026/5/14 (四)`。
  - 非今日只顯示一行完整日期，例如 `2026/5/15 (五)`。
- 歷史紀錄與學員檢視中使用的 `fmtDate()` 也改成完整日期格式。

## Firestore 讀寫影響

- 本次只調整管理員端顯示文字。
- 沒有新增 Firestore read/write。
- 沒有影響學員端。

## 驗證

- 已執行 HTML script parse 檢查，`index.html` 與 `admin.html` 的所有 script 皆可解析。

## 後續風險

- 無。

# 2026-05-17 01:59 刪除學員後清除學生查詢索引

## 需求摘要

管理員刪除安安 `0911111111` 後，學員端查詢仍顯示「沒有可用方案」，但正確狀況應該是「查不到此姓名與手機的學員資料」。

## 原因

管理員端刪除學員會清除 `students`、`tickets`、`payments`、預約、出缺勤與日誌，但公開索引同步原本只會寫入目前存在學員的 `student_lookup`，不會主動刪除已不存在學員留下的舊 `student_lookup` 文件。

因此學生端仍可能讀到舊 lookup，進入「查得到學員但沒有可用方案」的流程。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `active/gyrobooking_current/github_pages/index.html`
- `index.html`
- `docs/ssot/student_lookup_lifecycle.md`
- `docs/ssot/README.md`
- `docs/worklog/2026-05-17_0159_student-lookup-delete.md`

## 行為變更

- `deleteStudentCascade()` 刪除學員後，會呼叫 `lowCostDeleteStudentLookup()` 清除該學員的 `student_lookup`。
- 若同手機沒有其他學員，會同步清除 `phone_lookup`。
- 強制重建學員查詢索引時，會 prune 不屬於現有學員的舊 `student_lookup` / `phone_lookup` 文件。
- 學生端 lookup 不存在時，提示改為「查不到此姓名與手機的學員資料，請確認輸入內容或聯絡老師」。

## Firestore 讀寫影響

- 學生端沒有新增任何讀寫，仍維持 `public_booking/state`、`web_config/flags`、單一 `student_lookup/{hash}` 的查詢模式。
- 管理員刪除學員時新增最多 1 次 `student_lookup` delete，以及必要時 1 次 `phone_lookup` delete。
- 管理員手動強制重建索引時，會列出並清除舊 lookup 文件。這是維運工具，不會在學生端或一般 render 中執行。

## 驗證

- 已執行 `node scripts/core_flow_regression.mjs`，21 項核心流程回歸通過。
- 已解析 `admin.html` / `index.html` script 語法，皆通過。
- 已檢查學生端新文案與管理員端 lookup cleanup 函式已同步到 active 與根目錄。
- 待推送後確認 GitHub Pages 線上檔案包含 `lowCostDeleteStudentLookup`、`lowCostPruneStaleLookupDocs` 與新的學生端查無資料文案。

## 後續風險

- 目前 prune stale lookup 屬於管理員手動強制重建工具。未來多老師版本必須依 `tenantId` 限制 prune 範圍，避免跨老師刪除 lookup。

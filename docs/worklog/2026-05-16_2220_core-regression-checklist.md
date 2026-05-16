# 2026-05-16 22:20 核心流程回歸清單與本機測試

## 需求摘要

使用者確認目前測試大致正常後，希望進入下一步：建立核心流程回歸測試清單，並加入一個不消耗 Firebase 讀寫的本機半自動測試工具，讓之後新增、修改、移除功能時能固定檢查票券、收費、預約、取消、改期、刪除等資料流。

## 變更檔案

- `docs/ssot/regression_checklist.md`
- `docs/ssot/README.md`
- `scripts/core_flow_regression.mjs`
- `docs/worklog/2026-05-16_2220_core-regression-checklist.md`

## 行為變更

- 新增 SSOT 回歸清單，列出每次改動後要檢查的核心流程。
- 新增本機測試腳本 `node scripts/core_flow_regression.mjs`。
- 測試腳本使用假資料驗證：
  - 學員購課未付款不開有效票券。
  - 管理員收款只開一張票券。
  - 管理員手動新增方案預設已收款且不重複開票。
  - 預約扣正確票券並建立預約/排程/出缺勤。
  - 取消預約會清理關聯並補回票券。
  - 改期不改變票券堂數。
  - 刪除課堂會取消所有預約並補回票券。
  - 刪除收費會移除 linked ticket 相關預約。
  - 刪除學員會移除所有私人資料關聯。

## Firestore 讀寫影響

- 無新增 Firestore read/write。
- `tools/core_flow_regression.mjs` 只跑本機假資料，不連 Firebase。
- 學員端讀取策略沒有變更。

## 驗證

- 已執行：`node tools/core_flow_regression.mjs`
- 移到可追蹤路徑後重新執行：`node scripts/core_flow_regression.mjs`
- 結果：8 項核心流程回歸檢查通過。
- 待檢查：`git status --short`

## 後續風險

- 目前測試腳本是本機資料模型回歸，主要防止核心流程觀念漂移；它不是瀏覽器 E2E 測試。
- 日後若 cascade 函式再被抽成可 import 的模組，應讓腳本直接引用正式函式，進一步降低測試腳本與正式邏輯分岔的風險。

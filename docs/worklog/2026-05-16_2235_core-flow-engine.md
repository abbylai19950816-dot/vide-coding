# 2026-05-16 22:35 Core flow engine

## 需求摘要

使用者同意下一步建立 core flow engine，讓回歸測試不再把所有流程邏輯寫在測試檔內，而是先測一組可重用的純函式。目標是降低之後修改正式流程時「測試邏輯和正式邏輯分岔」的風險。

## 變更檔案

- `scripts/core_flow_engine.mjs`
- `scripts/core_flow_regression.mjs`
- `docs/ssot/regression_checklist.md`
- `docs/worklog/2026-05-16_2235_core-flow-engine.md`

## 行為變更

- 新增 `scripts/core_flow_engine.mjs`，集中本機測試用核心流程純函式：
  - `createPayment`
  - `createTicketFromPayment`
  - `markPaymentPaid`
  - `addAdminPlan`
  - `addBooking`
  - `cancelBooking`
  - `moveBooking`
  - `deleteSlot`
  - `deletePayment`
  - `deleteStudent`
- `scripts/core_flow_regression.mjs` 改成 import engine 函式，只保留測試案例。
- `docs/ssot/regression_checklist.md` 補充目前測試腳本會呼叫 core flow engine。

## Firestore 讀寫影響

- 無新增 Firestore read/write。
- 本次沒有修改 `index.html`、`admin.html` 或 `firestore.rules`。
- `scripts/core_flow_engine.mjs` 只處理本機假資料，不連 Firebase。

## 驗證

- 已執行：`node scripts/core_flow_regression.mjs`
- 結果：8 項核心流程回歸檢查通過。
- 待檢查：`git status --short`

## 後續風險

- 目前 engine 還沒有被 `admin.html` 直接引用，所以它是「先建立測試核心」而非正式流程替換。
- 下一步若要讓正式 cascade 對齊 engine，應分批處理，優先從取消預約、刪課、刪收費、刪學員這些最容易影響資料一致性的流程開始。

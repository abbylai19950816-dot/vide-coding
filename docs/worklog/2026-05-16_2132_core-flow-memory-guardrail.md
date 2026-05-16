# 2026-05-16 21:32 核心流程記憶與必檢規則

## 需求摘要

使用者要求將目前已釐清的系統操作邏輯與資料關聯牢牢記住，未來新增、修改、移除系統功能，或強化資安時，都必須檢視並測試核心流程是否跑掉。

## 變更檔案

- `docs/ssot/core_data_flows.md`
- `skills/gyrobooking-low-cost/SKILL.md`
- `C:/Users/abby2/.codex/skills/gyrobooking-low-cost/SKILL.md`
- `docs/worklog/2026-05-16_2132_core-flow-memory-guardrail.md`

## 行為變更

- 在 `core_data_flows.md` 補上「未來改動必檢項目」。
- 明確要求任何功能變更或資安強化，都要檢查：
  - 學員購課申請到收費匯入。
  - 管理員手動新增方案。
  - `payments.status` 與 `tickets` 是否一致。
  - 同一 `paymentId` 是否只產生一張 ticket。
  - 預約、取消、改期、刪課是否仍走 cascade。
  - `slots`、`scheduledBookings`、`classes`、`course_logs` 是否以 `slotId` 正確串聯。
  - 學員端是否仍維持低讀取。
  - 未來多老師與登入權限是否能確保資料隔離。
- 更新專案 skill，要求未來修改前先讀 `docs/ssot/core_data_flows.md`，並依核心流程做回歸檢查。
- 同步更新 repo 內 skill 與本機 Codex 載入中的 skill，避免新對話或換環境時遺漏規則。

## Firestore 讀寫影響

- 本次只更新文件與 skill，沒有改動前端程式或 Firestore 讀寫路徑。

## 驗證

- 已確認 SSOT 與 skill 都加入核心流程必檢規則。

## 後續風險

- `docs/skill/README.md` 目前文字有部分編碼顯示異常；未來若整理新對話啟動規則，可同步重寫成乾淨中文版。

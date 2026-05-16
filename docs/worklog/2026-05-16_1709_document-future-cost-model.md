# 2026-05-16 17:09 Document Future Cost Model

## 需求摘要

使用者詢問依照未來多老師 SaaS 規劃會增加哪些成本，並要求「記起來」。本次將成本項目與免費版優先原則正式寫入 SSOT。

## 變更檔案

- `docs/ssot/cost_model.md`
- `docs/ssot/README.md`
- `docs/ssot/multi_tenant_saas_plan.md`
- `docs/worklog/2026-05-16_1709_document-future-cost-model.md`

## 行為變更

無系統行為變更。本次只更新文件。

## Firestore 讀寫影響

無新增 Firestore 讀寫。

文件中補充未來成本守則：

- 學生端維持低讀取，只讀公開 mirror 與單筆 lookup。
- 管理員 listener 必須 single-init 並 debounce。
- 多老師版本要按 `tenantId` 隔離資料與成本觀察。
- LINE Login、backend、LINE Messaging API 需獨立評估成本與 budget alert。

## 驗證

- 已確認只新增/更新 docs。
- 不需部署 GitHub Pages。

## 後續風險

- 未來若導入 Firebase Functions、Cloud Run 或 LINE Login，需先確認 Firebase billing、budget alert、rate limit 與 secret 管理。
- 多老師版本正式開放前，需補上每 tenant 用量監控與 Firestore rules 隔離測試。

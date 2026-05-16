# 2026-05-16 16:59 Document Multi-Tenant SaaS Plan

## 需求摘要

- 使用者說明未來規劃：系統穩定後，希望開放給其他老師或有類似需求的人使用。
- 不同老師需要能自行設定課程方案、分享自己的購課預約頁面給學生。
- 學生之間、老師之間資料不得互通。
- 需特別注意資料隔離、串接、登入與資訊安全。

## 變更檔案

- `docs/ssot/multi_tenant_saas_plan.md`
- `docs/ssot/README.md`

## 決策內容

- 新增乾淨 SSOT 文件 `multi_tenant_saas_plan.md`。
- 將未來方向定義為 multi-tenant SaaS architecture。
- 每位老師是一個 tenant。
- 資料模型方向改為 `tenants/{tenantId}/...`。
- 公開學生頁只能讀 tenant-scoped public mirror 與自己的 lookup document。
- 老師登入需有 `tenantId` / `tenantIds` / `role` / `superAdmin` 等權限資訊。
- 管理員頁必須檢查登入者 claims 與 URL tenant 一致。
- 未來 LINE Login 必須 tenant-scoped，且不得暴露 raw LINE user id。
- 多租戶遷移需分階段進行，不應直接一次搬動目前穩定的單老師系統。

## Firestore 讀寫影響

- 無。
- 本次只新增 SSOT 文件與索引，沒有修改程式碼、rules 或部署入口。

## 驗證

- 已確認文件新增並納入 `docs/ssot/README.md`。
- 無需執行前端語法檢查。
- 無需部署 GitHub Pages。

## 後續 Action Items

- 先繼續穩定單一老師版本。
- 下一階段設計 tenant-aware path helper。
- 設計 `tenantId` / `tenantSlug` 規則。
- 設計 Firebase custom claims 與 Firestore tenant rules。
- 寫 legacy `/data/*` 到 `tenants/default/data/*` 的 migration plan。
- 建立 A/B tenant 測試，驗證老師與學生資料隔離。

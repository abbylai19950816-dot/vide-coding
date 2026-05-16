# 2026-05-16 17:24 Admin Data Health Check

## 需求摘要

使用者確認要依序實作資料一致性基礎，並要求隨時更新 SSOT。本次先實作第一階段：管理員端 read-only 資料一致性檢查工具。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/data_model.md`
- `docs/worklog/2026-05-16_1724_admin-data-health-check.md`

## 行為變更

- 管理員設定頁新增「資料健康檢查」區塊。
- 可按「開始檢查」產生資料一致性報告。
- 報告會列出嚴重與需檢查項目，例如：
  - 已收款但沒有票券。
  - 同一筆收費產生多張票券。
  - 行事曆與學員 `scheduledBookings` 不一致。
  - 預約缺少票券扣堂 `slotIds` log。
  - 已發生預約沒有課程日誌。
  - 出缺勤或課程日誌成員找不到學員。
- 第一版只檢查，不自動修改資料。

## Firestore 讀寫影響

- 無新增學員端讀取。
- 無新增 Firestore 寫入。
- 管理員端檢查使用已載入本機快取的 `/data/*` 陣列，不新增 listener。

## 驗證

- 已同步 root `admin.html`。
- 已確認 active 與 root `admin.html` hash 一致。
- 已確認 active/root 都包含 `runDataHealthCheck`、`buildDataHealthReport` 與「資料健康檢查」UI。
- 已用 Node 解析 classic script blocks，4 個 script blocks 語法檢查通過。
- 待完成：commit / push 後檢查 GitHub Pages 線上檔案包含 `runDataHealthCheck`。

## 後續風險

- 健康檢查只指出疑點，不代表所有疑點都一定需要自動修復。
- 下一階段可以把嚴重項目拆成安全的個別修復工具，例如「已收款補開票券」、「行事曆預約回填 scheduledBookings」。

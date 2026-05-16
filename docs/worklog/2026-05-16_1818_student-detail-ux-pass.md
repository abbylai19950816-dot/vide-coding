# 2026-05-16 18:18 Student Detail UX Pass

## 需求摘要

使用者要求依照 `/critique 管理員學員詳細頁` 的建議依序優化。本次先處理第一輪高優先項目：學員狀態總覽、資訊排序、降低票券維護操作誤觸。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/product_scope.md`
- `docs/worklog/2026-05-16_1818_student-detail-ux-pass.md`

## 行為變更

- 管理員學員詳細頁新增頂部狀態摘要：
  - 剩餘堂數
  - 未來預約數
  - 上課紀錄數
  - 是否已有可預約方案
- 詳細頁資訊順序改為：
  1. 狀態總覽
  2. 未來預約
  3. 有效方案與方案紀錄
  4. 上課統計
  5. 最近上課
  6. 聯絡資訊
  7. 刪除學員
- 票券卡片中的扣堂、加堂、修改、刪除改收合在「調整」內，降低日常查看時誤觸維護操作的機率。
- 空狀態文案補上下一步，例如沒有方案、沒有未來預約、沒有上課紀錄時的處理方向。

## Firestore 讀寫影響

- 無新增 Firestore 讀取。
- 無新增 Firestore 寫入。
- 無新增 listener。
- 只重排管理員端已載入的本機資料呈現方式，不影響學生端低讀取策略。

## 驗證

- 已同步 root `admin.html`。
- 已確認 active 與 root `admin.html` hash 一致。
- 已用 Node 解析 classic script blocks，4 個 script blocks 語法檢查通過。
- 已確認 active/root 都包含 `student-status-summary`、`ticket-adjust` 與「有效方案與方案紀錄」。
- 待完成：commit / push 後檢查線上 `admin.html`。

## 後續風險

- 本次仍保留舊有 inline HTML 組字串，後續可再抽出穩定 class 或小型 render helper。
- 票券維護操作已收合，但刪除/扣堂仍需更完整的二階段確認與資料影響說明。

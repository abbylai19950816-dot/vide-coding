# 2026-05-16 票券重算報告

## 需求摘要

在資料一致性工具中新增「票券剩餘堂數重算報告」。此階段只產生報告，不自動修改票券，先確認系統能否可靠找出堂數錯位、缺少 slotId 的扣補堂紀錄、以及同課程多張有效票券。

## 變更內容

- `active/gyrobooking_current/github_pages/admin.html`
  - 資料健康區新增 `票券重算報告` 按鈕。
  - 新增 `buildTicketRecalcRows()`，使用既有本機資料推算每張票券狀態。
  - 新增 `renderTicketRecalcReport()` 只讀報告：
    - 顯示目前 `total / used / left`。
    - 顯示依 ticket `log[]` / `logs[]` 推算的扣堂、補回與預期剩餘堂數。
    - 標示缺 `slotIds` 的扣補堂紀錄。
    - 標示已預約但找不到票券 slotId log 的時段數。
    - 標示同學員同課程類型多張有效票券。
    - 若曾手動 `edit`，標示為需人工判讀。
  - 資料健康檢查新增：
    - `票券剩餘堂數與紀錄推算不同`
    - `同課程類型有多張有效票券`
  - 相關警示下方可點 `查看票券重算報告`。
- `admin.html`
  - 已同步 GitHub Pages 根目錄入口檔。
- `docs/ssot/data_model.md`
  - 補上票券重算報告規格。
- `docs/ssot/cost_model.md`
  - 補上此報告不新增學生端讀寫、不寫入 Firestore。

## Firestore 讀寫影響

- 學生端：無新增讀取或寫入。
- 管理員端：報告只使用已載入的 `tickets`、`students`、`slots` 本機資料，不新增 Firestore 寫入。
- 此階段不提供自動套用修正。

## 驗證

- 已確認 admin 腳本語法可解析。
- 已確認報告與資料健康檢查入口已同步到 active 與根目錄 `admin.html`。

## 後續風險

- 票券曾手動修改堂數時，log 無法完整還原歷史，因此報告會標示需人工判讀。
- 同課程多張票券不一定是錯誤；例如學員先後購買同類型方案。未來若要修復，應做單筆票券確認式套用，不做一鍵全批次修正。

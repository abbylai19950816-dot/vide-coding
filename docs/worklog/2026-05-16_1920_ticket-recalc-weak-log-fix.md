# 2026-05-16 票券重算報告缺 slotId 誤報修正

## 需求摘要

管理員在票券重算報告中看到某張票券 `total=1 / used=0 / left=1`，但報告因缺 `slotId` 的扣補堂紀錄而推算剩餘 `0`，造成誤報。

## 問題原因

票券重算報告第一版在遇到缺 `slotId` 的扣補堂紀錄時，仍然把這類 weak log 納入 deterministic expected-left 計算。

缺 `slotId` 代表這筆扣堂或補堂無法可靠對應特定預約/取消/刪課，因此不能拿來產生確定的推算剩餘堂數。

## 變更內容

- `active/gyrobooking_current/github_pages/admin.html`
  - `buildTicketRecalcRows()` 現在只要票券有缺 `slotId` 的扣補堂紀錄，就把 `expectedLeft` 設為 `null`。
  - 報告會顯示「需人工判讀」，不再產生「推算剩餘 X 堂，和目前 Y 堂不同」的誤報。
  - 手動 `edit` log 仍同樣視為需人工判讀。
- `admin.html`
  - 已同步 GitHub Pages 根目錄入口檔。
- `docs/ssot/data_model.md`
  - 更新票券重算規則：缺 `slotIds` 或手動 `edit` 時，不得顯示 deterministic expected-left。

## Firestore 讀寫影響

- 無新增讀取或寫入。
- 報告仍為只讀工具。

## 驗證

- 已確認 admin 腳本語法可解析。
- 此修正會讓缺 `slotId` 的票券只顯示需人工判讀，不再報堂數推算差異。

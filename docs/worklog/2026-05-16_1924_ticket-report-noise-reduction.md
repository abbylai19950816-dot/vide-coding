# 2026-05-16 票券重算報告降低誤警示

## 需求摘要

管理員回報：大學生777買了一堂一對一，學員資料中沒有已上課、沒有已預約，`total=1 / used=0 / left=1` 是正確狀態，不應顯示需檢查。

## 問題原因

票券重算報告把「歷史扣補堂紀錄缺 `slotId`」本身列成需檢查。對管理員來說，若目前票券 arithmetic 正確，且沒有任何現有預約或缺 log 的預約，這只是歷史 log 不完整，不是需要處理的票券問題。

## 變更內容

- `active/gyrobooking_current/github_pages/admin.html`
  - 新增 `arithmeticOk` 判斷：`total > 0 && used + left === total`。
  - 缺 `slotId` 的歷史扣補堂紀錄只有在以下情境才列為需檢查：
    - 這張票券有符合課程類型的預約。
    - 有預約找不到票券 `slotId` log。
    - `total / used / left` 本身不一致。
  - 若只是歷史 log 缺 `slotId`，但目前堂數正確且沒有預約關聯，報告仍會顯示數量，但不列為需檢查。
  - 文案從「缺 slotId 的扣補紀錄」調整為「歷史扣補堂缺 slotId」，降低管理員誤解。
- `admin.html`
  - 已同步 GitHub Pages 根目錄入口檔。
- `docs/ssot/data_model.md`
  - 補上缺 `slotIds` 不應單獨成為 action item 的規則。

## Firestore 讀寫影響

- 無新增讀取或寫入。
- 報告仍為只讀工具。

## 驗證

- 已確認 admin 腳本語法可解析。
- 此修正讓 `total=1 / used=0 / left=1` 且無預約關聯的票券不再因歷史 weak log 被列為需檢查。

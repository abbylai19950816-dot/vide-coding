# 2026-05-16 票券歷史紀錄校準

## 需求摘要

管理員指出：若學員買一堂課、沒有已上課、沒有已預約，`total=1 / used=0 / left=1` 是正確狀態，不應顯示需檢查或人工判讀。同時，歷史紀錄不完整也應能整理，避免一直干擾後續報告。

## 變更內容

- `active/gyrobooking_current/github_pages/admin.html`
  - 票券重算報告預設只顯示需處理項目；正常票券不再列出。
  - `人工判讀` 統計只計算需檢查票券，不再把正常票券算進去。
  - 若票券只有歷史扣補堂缺 `slotId`、但目前 `total = used + left` 且沒有預約關聯，視為「歷史紀錄不完整」而非需檢查。
  - 新增 `整理歷史票券紀錄` 按鈕：
    - 只針對目前沒有其他風險、但有舊 log 缺 `slotId` 的票券。
    - 不猜測缺少的 `slotId`。
    - 不改變 `total / used / left`。
    - 新增 `reconcile_balance` 校準紀錄到 `log[]` 與 `logs[]`。
    - 後續重算會以最新 `reconcile_balance` 為校準點，只看校準點之後的新紀錄。
- `admin.html`
  - 已同步 GitHub Pages 根目錄入口檔。
- `docs/ssot/data_model.md`
  - 補上 `reconcile_balance` 校準點規格。
- `docs/ssot/cost_model.md`
  - 補上此工具的低頻維運寫入成本。

## Firestore 讀寫影響

- 學生端：無新增讀取或寫入。
- 管理員端：只有按下 `整理歷史票券紀錄` 並確認後，才會重寫 `/data/tickets` 一份文件。
- 此工具不會改變剩餘堂數，只新增 audit/checkpoint log。

## 驗證

- 已確認 admin 腳本語法可解析。
- 已確認正常票券不會因歷史 weak log 被列入需檢查。

## 後續風險

- `reconcile_balance` 是校準點，不是完整還原歷史。若未來需要法律/會計等級完整審計，仍需保留原始資料與操作記錄。

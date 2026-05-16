# 2026-05-16 學員查詢空狀態提示修正

## 需求摘要

學員已購買方案，但管理員尚未在行事曆新增對應課程時段時，學生端不應顯示成「找不到可用方案」。這會讓學員誤以為購課資料不存在。

## 原因判斷

相關行為來自 `c88aeb4 Show total tickets and allow booking type switch`：

- 該版開始支援同一學員多課程類型切換。
- 學生端查詢後會用 `student_lookup.remainingByType` 對照 `public_booking/state.slots` 的課程類型。
- 這個設計符合低讀取策略，但原本空狀態文案沒有區分「沒有方案」與「有方案但目前沒有對應可預約時段」。

## 變更內容

- `active/gyrobooking_current/github_pages/index.html`
  - 新增 `lowCostLookupRemainingTotal(lookup)`，用既有 lookup 資料判斷學員是否仍有剩餘堂數。
  - 學生端查詢後若沒有可顯示時段，拆成三種提示：
    - 查無姓名與手機：維持查無方案提示。
    - 有方案但沒有對應課表類型：提示「老師尚未新增對應課程時段」。
    - 有方案且有課表類型，但沒有未來空位：提示「目前對應課程沒有未來可預約名額」。
- `index.html`
  - 已同步根目錄 GitHub Pages 入口檔。
- `docs/ssot/product_scope.md`
  - 補上學生端查詢方案的三種狀態文案規則。

## Firestore 讀寫影響

- 學生端沒有新增讀取或寫入。
- 仍只使用已經讀到的 `public_booking/state` 與單筆 `student_lookup/{hash}` 做前端判斷。

## 驗證

- 已確認修改範圍只影響學生端查詢後的空狀態判斷與提示文案。
- 待部署後可用「有剩餘方案但行事曆沒有對應課程時段」的測試資料驗證提示是否正確。

## 後續風險

- 若 `student_lookup` 文件本身不存在，學生端仍會顯示查無方案。這種情況應使用管理員端「強制重建學員查詢」或檢查同步流程。
- 若票券課程類型與課表課程類型命名不一致，仍可能落入「尚未新增對應課程時段」提示；後續可在資料健康檢查加入課程類型對應檢查。

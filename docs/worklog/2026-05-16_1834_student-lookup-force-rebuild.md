# 2026-05-16 學員查詢索引強制重建

## 需求摘要

管理員端學員管理顯示「大學生 0966666666」與「大學生 0977777777」各有一堂可用，但學生端輸入姓名與手機查不到可用方案。

## 檢查結果

- 依學生端規則計算 `student_lookup/{sha256(name|phone)}`：
  - `大學生|0966666666` -> `88d861a5f0f2b963fe09133b8be234ad490703418548e61bcebf020a001f99b2`
  - `大學生|0977777777` -> `e32e743158a9fbce1f8fdf83c80f4d548b71b9925f2fc7eab2fe737ef33201d9`
- 用 Firestore REST 讀取這兩筆公開 lookup，皆回傳 404。
- 判斷問題不是學生端輸入錯誤，而是管理員端資料存在、公開查詢索引遺失或未被重建。

## 變更內容

- `active/gyrobooking_current/github_pages/admin.html`
  - `lowCostSyncPublicMirror(reason, options)` 新增 `options.force`。
  - `force: true` 時略過 `localStorage` hash cache，直接重寫：
    - `public_booking/state`
    - `student_lookup/{hash}`
    - `phone_lookup/{hash}`
  - 設定頁資料健康區新增「強制重建學員查詢」按鈕。
  - `resetAllTestData()` 清除本機 cache 時也清除 `low_cost_phone_lookup_hash_*`。
- `docs/ssot/data_model.md`
  - 補上 public lookup 強制重建的使用情境與規則。
- `docs/ssot/cost_model.md`
  - 補上此維運工具的讀寫成本定位。

## Firestore 讀寫影響

- 學生端：無新增讀取或寫入。
- 管理員端一般同步：仍維持 hash/diff，未變動資料不重寫。
- 管理員端手動強制重建：會依目前學生 lookup 與 phone lookup 數量重寫公開索引，屬於低頻維運寫入。

## 驗證

- 已確認兩位測試學生對應的 `student_lookup` 文件目前不存在。
- 已新增強制重建功能，待部署後由管理員在設定頁手動執行，再回學生端重新查詢。

## 後續風險

- 若強制重建後仍查不到，下一步應檢查票券的 `typeId` / `typeName` 是否能對應目前公開課表的課程類型。
- 未來可把「lookup 文件缺失」加入資料健康檢查，但該檢查會在管理員端多讀公開索引，需維持為維運工具。

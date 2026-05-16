# 2026-05-16 17:52 Data Health Guidance

## 需求摘要

使用者實測資料一致性檢查後，回報管理員看到「發現 2 項」但不清楚下一步要做什麼。本次改善檢查報告的管理員可讀性。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/data_model.md`
- `docs/worklog/2026-05-16_1752_data-health-guidance.md`

## 行為變更

- 將資料健康檢查定位調整為「測試與維運工具」。
- UI 說明補充：正式上線後應收合或只開放給平台維運者。
- 資料健康檢查報告新增「建議處理順序」。
- 每個問題新增：
  - `這代表`
  - `建議下一步`
- 針對「課程日誌學員 ID 找不到學員」補上白話說明：
  - 多半是刪除學員或測試資料後，歷史日誌仍保留舊 studentId。
  - 通常不會直接影響現在學員預約。
  - 若是測試資料，可等後續「清除孤兒日誌成員」工具處理。
  - 若是真實學員，要先確認學員是否被誤刪。

## Firestore 讀寫影響

- 無新增 Firestore 讀取。
- 無新增 Firestore 寫入。
- 仍只使用管理員端已載入的本機快取資料產生報告。

## 驗證

- 已同步 root `admin.html`。
- 已用 Node 解析 classic script blocks，4 個 script blocks 語法檢查通過。
- 已確認 root `admin.html` 包含 `dataHealthGuidance` 與「測試期、資料清理或維運時使用」。
- 待完成：commit / push 後檢查線上 `admin.html`。

## 後續風險

- 本次只改善說明與判讀，不會修復資料。
- 下一步建議實作「清除孤兒日誌/出缺勤成員」或「資料修復中心」，讓管理員可以針對每種問題安全處理。

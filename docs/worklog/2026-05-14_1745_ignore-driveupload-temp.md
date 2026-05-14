# 忽略 `.tmp.driveupload` 暫存資料夾

## 請求摘要

使用者詢問未追蹤資料夾 `.tmp.driveupload/` 應如何處理。

## 變更檔案

- `.gitignore`
- `docs/worklog/2026-05-14_1745_ignore-driveupload-temp.md`

## 處理方式

- 檢查 `.tmp.driveupload/` 內容，確認其為大量數字命名暫存檔，非專案原始碼或部署必要檔案。
- 不刪除資料夾，避免誤刪使用者或外部工具仍需要的暫存資料。
- 將 `.tmp.driveupload/` 加入 `.gitignore`，避免之後反覆出現在 Git 未追蹤清單，也避免誤提交到 GitHub。

## Firestore 讀寫影響

無。此變更只影響 Git 追蹤規則。

## 驗證 performed

- 列出 `.tmp.driveupload/` 內容。
- 檢查 Git ignore 狀態。

## 後續風險

- 若確認 `.tmp.driveupload/` 是完全不再需要的暫存資料，可另行刪除本機資料夾；目前先保留並忽略。

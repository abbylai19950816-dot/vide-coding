# 2026-05-16 02:18 Adjust Sheet Card Padding

## 需求摘要

- 管理員頁學員資料中的「變更預約」與「更改預約時間」兩個底部彈窗，淡色資訊區塊左側需要保留空白，不要貼齊卡片邊緣。
- 學員資料內的淡色資訊列也需要同樣保留左右內距。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`

## 行為變更

- 「變更預約」彈窗的「目前預約」區塊改為 `padding:10px 14px`。
- 「更改預約時間」彈窗的「原預約」與「可更改時段」區塊改為 `padding:10px 14px`。
- `.form-section .info-row` 新增左右 `14px` 內距，讓學員資料的聯絡資訊等淡色卡片內容不會貼邊。
- 保留未包在 `.form-section` 內的單行列表既有對齊，避免影響「預約課程時段」一行式排版。

## Firestore 讀寫影響

- 無。
- 本次只調整 CSS/inline style，沒有新增或修改 Firestore 讀取、寫入、監聽或資料同步流程。

## 驗證

- 已用 Node 檢查 `admin.html` 內 7 個 script block，語法檢查通過。
- 已搜尋低成本檢查關鍵字；本次沒有新增 Firestore 讀寫路徑，搜尋結果只包含既有管理端同步流程。
- 待推送後確認 GitHub Pages 線上檔案包含新樣式。

## 後續風險

- 目前仍有部分 sheet 使用 inline style。若後續 UI 調整更多，建議整理成共用 `.sheet-info-block` class，減少重複調整。

# 2026-05-14 收費優惠 UI 調整

## 需求摘要

剛新增的客製化優惠功能可用，但收費明細中的優惠編輯 UI 不符合目前系統風格，需要調整得更一致、更好操作。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-14_2100_payment-discount-ui.md`

## 行為變更

- 收費明細改成「付款摘要」與「客製化優惠」兩個視覺區塊。
- 優惠編輯面板新增原價、折抵金額、優惠原因欄位的專屬樣式。
- 新增「不影響堂數」提示，讓管理員知道折扣只改收費金額，不改票券堂數與效期。
- 手機寬度下，原價與折抵金額會自動改成單欄排列。

## Firestore 讀寫影響

- 本次只調整管理員端 HTML/CSS 呈現。
- 沒有新增學員端 Firestore read/write。
- 沒有新增管理員端資料儲存路徑。

## 驗證

- 已執行 HTML script parse 檢查，`index.html` 與 `admin.html` 的所有 script 皆可解析。

## 後續風險

- 尚未用瀏覽器截圖檢查實際視覺效果；若之後要更精準，可開本機或 GitHub Pages 頁面做畫面驗收。

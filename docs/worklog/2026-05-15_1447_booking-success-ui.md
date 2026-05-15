# 學員預約申請成功提示 UI

## 需求摘要

學員送出預約申請後，原本使用瀏覽器 `alert()` 顯示成功訊息，視覺不一致且會顯示申請編號。需求是優化 UI，並移除申請編號顯示。

## 變更檔案

- `active/gyrobooking_current/github_pages/index.html`
- `index.html`

## 行為變更

- 新增站內樣式的預約申請成功彈窗。
- 成功訊息只顯示「預約申請已送出」與管理員確認後會更新名額/剩餘堂數。
- 不再顯示 `booking_requests` 申請編號。
- 學員頁版本由 `20260513-026` 更新為 `20260515-027`，協助瀏覽器載入新版。

## Firestore 讀寫影響

- 無新增 Firestore 讀取。
- 無新增 Firestore 寫入。
- 仍維持原本學員端低成本路徑：送出預約只建立一筆 `booking_requests/{requestId}`。

## 驗證

- 已同步 `active/gyrobooking_current/github_pages/index.html` 到根目錄 `index.html`。
- 以 `node --check` 檢查拆出的 classic scripts，語法通過。

## 後續風險

- 其他表單驗證錯誤仍使用原生 `alert()`；若要整體視覺一致，之後可再統一替換為站內 toast / dialog。

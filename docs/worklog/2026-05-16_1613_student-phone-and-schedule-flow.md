# 2026-05-16 16:13 Student Phone And Schedule Flow

## 需求摘要

- 學員購課或查詢預約時間時，若手機輸入 11 碼或更多，不能顯示英文 `Missing or insufficient permissions`，要改成中文提示。
- 學員購課成功後，如果直接按「去選擇上課時間」，仍要能回到完成畫面或聯絡老師。

## 變更檔案

- `active/gyrobooking_current/github_pages/index.html`
- `index.html`
- `docs/ssot/product_scope.md`

## 行為變更

- 新增 `validateMobileNumber()`：
  - 手機必須剛好 10 碼。
  - 手機必須以 `09` 開頭。
  - 購課表單與預約時間查詢共用同一套中文錯誤提示。
- 新增 `friendlyErrorMessage()`：
  - 若 Firebase 回傳 permission / insufficient permission 類錯誤，學生端改顯示中文：
    `資料驗證失敗，請確認姓名與手機號碼是否正確，或聯絡老師協助。`
- 購課成功後，將本次完成畫面需要的聯絡資料存到 `sessionStorage`：
  - `name`
  - `phone`
  - `social`
  - `note`
  - `type`
  - `plan`
  - `requestId`
- 學員進入「預約課程時間」頁後，若本次分頁有剛送出的購課申請，頁面上方會顯示提示卡：
  - `購課申請已送出`
  - `傳送訊息給老師`
  - `返回完成畫面`
- 「返回完成畫面」會重新打開原本購課成功畫面。
- 「傳送訊息給老師」會使用同一份購課資料開啟 Line 訊息。

## Firestore 讀寫影響

- 無新增 Firestore 讀取或寫入。
- `sessionStorage` 只保存在目前瀏覽器分頁，用來保存購課成功後的 UI 狀態。
- 學員頁仍維持低成本路徑：初始資料讀取與預約查詢流程沒有新增 collection-wide read。

## 驗證

- 已用 Node 檢查 `index.html` 內 5 個 script block，語法檢查通過。
- 已搜尋低成本關鍵字；本次新增的是 `sessionStorage.setItem(POST_PURCHASE_KEY, ...)`，沒有新增 Firestore 讀寫路徑。
- 既有學生端 Firestore 路徑維持不變：購課仍寫 `purchase_requests`，預約仍寫 `booking_requests`，查詢仍讀 `public_booking/state` 與單一 `student_lookup/{hash}`。
- 待推送後確認 GitHub Pages 線上 `index.html` 包含新流程字串。

## 後續風險

- 目前成功畫面狀態只保留在同一個瀏覽器分頁。若學員關掉分頁再回來，需要重新查詢或重新聯絡老師。

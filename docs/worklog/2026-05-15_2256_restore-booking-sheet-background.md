# 2026-05-15 22:56 Restore Booking Sheet Background

## 需求摘要

- 管理員頁「變更預約 / 更改預約時間」底部彈窗在左對齊調整後，原本的淡色資訊底色消失。
- 需補回底色，同時保留目前預約、原預約、可更改時段文字靠左的版面。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`

## 行為變更

- 「變更預約」彈窗的「目前預約」區塊重新顯示淡色背景。
- 「更改預約時間」彈窗的「原預約」與「可更改時段」區塊重新顯示淡色背景。
- 文字內容仍維持靠左排列，避免回到先前視覺上偏移的狀態。

## Firestore 讀寫影響

- 無。
- 本次只調整 HTML inline style，沒有新增或修改 `getDocs()`、`onSnapshot()`、`setDoc()`、`updateDoc()`、`writeBatch()`、`runTransaction()` 或任何資料同步流程。

## 驗證

- 已用 Node 直接讀取 `admin.html` 並檢查 7 個 script block，語法檢查通過。
- 已搜尋低成本檢查關鍵字；本次沒有新增任何 Firestore 讀寫或監聽，只看到既有管理端同步流程。
- 待同步 GitHub Pages 並以 cache-busting URL 確認線上檔案包含新樣式。

## 後續風險

- 這次為維持小範圍修正，仍沿用既有 inline style。若後續要更一致的 UI，建議把這類 sheet info block 抽成共用 class。

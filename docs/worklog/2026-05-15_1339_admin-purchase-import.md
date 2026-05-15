# 管理員購課申請即時匯入修正

## 需求摘要

學員送出購課後，資料已進入 `purchase_requests`，但管理員端沒有即時匯入到 `data/students` 與 `data/payments`。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`

## 行為變更

- 管理員端讀取 `purchase_requests` / `booking_requests` 時，若 Firestore 權限或連線失敗，不再靜默視為「沒有申請」。
- 匯入失敗時會顯示「申請匯入失敗，請重新登入」，方便辨識是權限或登入狀態問題。
- 管理員頁面在視窗重新聚焦、頁籤回到前景、網路恢復時會補跑一次 pending request 匯入。

## Firestore 讀寫影響

- 學員端無新增讀取或寫入。
- 管理員端新增的補跑觸發只在 `window focus`、`visibilitychange`、`online` 等管理員操作情境發生。
- 既有 30 秒備援輪詢保留，這部分僅限管理員端，不影響公開學員頁成本。

## 驗證

- 確認 `admin.html` 與 `active/gyrobooking_current/github_pages/admin.html` 已同步。
- 以 `node --check` 檢查拆出的 classic scripts，語法通過。
- Firestore 現況確認：`purchase_requests` 有 1 筆 pending，`students` / `payments` 尚未匯入，符合問題描述。
- 已用管理員權限補匯入卡住的 1 筆購課申請；補匯入後 `purchase_requests=0`、`students=1`、`payments=1`。

## 後續風險

- 若管理員目前瀏覽器保留舊版 GitHub Pages 快取，需要重新整理後才會載入修正版。
- 若仍看到「申請匯入失敗」，代表該管理員瀏覽器的 Firebase Auth 狀態不是 password admin，需登出後重新登入。

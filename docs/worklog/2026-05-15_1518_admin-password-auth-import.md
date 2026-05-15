# 2026-05-15 15:18 管理員匯入失敗修復

## 需求摘要

使用者回報賴俐婷購買「墊上嬋柔 一對二・體驗課（僅限一次）」後，管理員頁顯示「申請匯入失敗，請重新登入」。

## 根因

同一個瀏覽器若先使用學員頁，Firebase 會留下 anonymous auth。管理員頁原本只要偵測到任一 `user` 就啟動 `initFirebaseSync()`，因此會用 anonymous auth 嘗試讀取 `purchase_requests` / `booking_requests`。Firestore rules 正確拒絕匿名讀取，導致匯入失敗。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/security_and_tenancy_plan.md`
- `docs/worklog/2026-05-15_1518_admin-password-auth-import.md`

## 行為變更

- 管理員頁只有在 Firebase `providerData.providerId === 'password'` 且不是 anonymous user 時，才啟動管理員同步。
- 偵測到 anonymous/student auth 時，管理員頁會顯示登入畫面，並清除非管理員 auth。
- 申請匯入失敗提示改為依錯誤原因顯示：
  - permission denied: `管理員登入狀態失效，請重新登入`
  - 其他錯誤: `申請匯入失敗，請重新整理後再試`

## 資料補救

- 已用管理端 token 補匯入 pending `purchase_requests/pr_1778827988817_ksr6w8`。
- 已建立賴俐婷的未收款紀錄：
  - `墊上嬋柔 一對二・體驗課（僅限一次）`
  - 金額 `700`
  - 狀態 `unpaid`
- Firestore 已確認 `purchase_requests` 沒有剩餘 pending 購課申請。

## Firestore 讀寫影響

- 學員端讀寫路徑沒有變更，仍維持低成本 `purchase_requests` create-only 流程。
- 管理員端不新增 listener；只是避免 anonymous auth 啟動既有管理員 listener。
- 本次資料補救為一次性管理端 REST 寫入：讀取 `students`、`payments`、`purchase_requests`，更新 `data/students`、`data/payments`，刪除已匯入的 request。

## 驗證

- 已對 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。
- 已確認 Firestore `data/payments` 目前有 2 筆賴俐婷收費紀錄，其中一對二體驗課為 `unpaid`。

## 後續風險

- 管理員若在同一瀏覽器同時操作學員頁與管理員頁，管理員頁可能需要重新登入一次；這是為了避免 anonymous auth 汙染管理員同步。
- 日後若改成多老師 tenant/custom claims，需把 `isPasswordAdminUser()` 升級為檢查 custom claims 或 tenant role。

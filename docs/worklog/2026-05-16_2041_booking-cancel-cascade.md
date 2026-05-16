# 2026-05-16 20:41 取消預約連動修復

## 需求摘要

實測安安取消 5/19 一對一預約後，票券堂數有補回，但出缺勤頁面與行事曆仍殘留原紀錄；同時學員頁仍顯示沒有可用堂數。

## 原因

- 管理員端取消預約的新版覆寫流程只確實補回票券與移除部分 booking，但沒有同步清理 `course_logs`，且出勤清理只用 `studentId` 比對，遇到舊資料或部分資料缺 `studentId` 時容易殘留。
- 前一版為了防止學員端重複送出預約，新增同裝置 pending 預約快取；若管理員匯入後又取消補堂，學生端可能仍扣著本機 pending，導致雲端已補回 1 堂但畫面顯示 0。

## 修改內容

- 管理員取消預約時同步處理：
  - 移除 `slots[].bookings`
  - 移除 `students[].scheduledBookings`
  - 移除 `classes[].members`
  - 移除或更新 `course_logs` 內對應學生
  - 補回正確票券並寫入含 `slotIds` 的 refund log
  - 立即重建 `public_booking/state`、`student_lookup`、`phone_lookup`
- `student_lookup` 新增 `releasedSlotIds`，由近期 refund/cancel refund ticket logs 產生。
- 學員端重新查詢時，如果本機 pending 預約的 `slotIds` 已出現在 `releasedSlotIds`，會清掉該 pending，不再把補回堂數扣成 0。

## 修改檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `active/gyrobooking_current/github_pages/index.html`
- `admin.html`
- `index.html`
- `docs/ssot/data_model.md`

## Firestore 讀寫影響

- 不增加學生端讀取；學生端仍只讀 `public_booking/state`、`web_config/flags` 與單筆 `student_lookup/{hash}`。
- 管理員取消預約會比原本多一次即時 mirror sync，寫入公開課表與 lookup 索引。這是管理員低頻操作，符合 Firebase 免費版低成本策略。

## 驗證

- `admin.html` / `index.html` 相關 scripts 語法檢查通過。
- `git diff --check` 通過。
- 已用管理權限檢查安安資料：
  - 修復前：Firestore 仍有 5/19 09:00 slot booking、class member，票券 `left=0`。
  - 已執行一次性資料修復：移除 5/19 booking 1 筆、scheduledBookings 1 筆、class member 1 筆，補回票券 1 堂。
  - 修復後：安安 `scheduledBookings=[]`、`slotBookings=[]`、`classMembers=[]`、`logs=[]`、票券 `left=1` / `used=0`。
  - `student_lookup` 已重建，`remainingByType={"1":1}`，`releasedSlotIds` 包含 5/17 與 5/19 已取消時段。

## 後續注意

- 這次修的是單一取消預約流程。若之後新增批次取消或刪除整日課程，必須沿用同樣的 cascade 規則。

# 2026-05-15 15:30 票券剩餘顯示與學生頁課程切換

## 需求摘要

使用者回報刪除賴俐婷兩堂課程預約後：

- 管理員「學員管理」列表顯示剩 1 堂。
- 學員資料細節中兩個方案各顯示剩 1 堂。
- 學生頁只看到一對一可預約，沒有看到一對二。

## 根因

- 管理員列表原本只取剩餘堂數最高的一張票券作為 badge，因此同時有兩張有效票券時會顯示單張票券剩餘，而不是總剩餘。
- 學生頁低成本查詢已能從 `student_lookup.remainingByType` 取得多個課程類型，但 UI 只自動選第一個可用類型，沒有提供切換。
- 取消預約補堂時只回補 `left`，沒有同步扣回 `used`，容易讓資料細節與日後刪除/統計判斷變得混亂。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `active/gyrobooking_current/github_pages/index.html`
- `admin.html`
- `index.html`
- `docs/ssot/product_scope.md`
- `docs/worklog/2026-05-15_1530_ticket-summary-and-type-switch.md`

## 行為變更

- 管理員學員列表的 badge 改為顯示該學員所有未過期有效票券的總剩餘堂數。
- 管理員取消預約與刪除時段補堂時，會同時將票券 `used` 扣回 1，最低為 0。
- 學生頁查詢方案後，如果同一學員有多個可預約課程類型，會顯示課程類型切換 chip，例如一對一 / 一對二；切換後會重新顯示對應課程時段與剩餘堂數。

## 資料補救

- 已修正賴俐婷目前兩張體驗票券：
  - 一對一：`left = 1`，`used = 0`
  - 一對二：`left = 1`，`used = 0`
- `student_lookup` 原本已正確顯示 `remainingByType = { "1": 1, "2": 1 }`，本次不需要重建 lookup。

## Firestore 讀寫影響

- 學生頁仍只讀 `public_booking/state` 與單一 `student_lookup/{hash}`，沒有新增讀取路徑。
- 學生頁課程切換只使用已讀入的 `student_lookup.remainingByType` 與公開課表快取，不增加 Firestore reads。
- 管理員端取消預約原本就會寫入 `tickets`，本次只在同一次寫入內多更新 `used` 欄位。

## 驗證

- 已對 `admin.html` 與 `index.html` 的 classic scripts 執行 `node --check`，共 8 段 script 均通過。
- 已用 Firestore REST 檢查賴俐婷票券資料與公開課表：一對一與一對二未來可預約時段各 1 筆，兩張票券各剩 1 堂。

## 後續風險

- 目前學生頁只在查詢當下提供可切換類型；若管理員在學員停留頁面期間改課表，學員可能需要重新查詢或等待公開課表更新後重新整理。

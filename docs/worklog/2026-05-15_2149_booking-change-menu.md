# 2026-05-15 21:49 預約列新增變更選單

## 需求摘要

使用者希望保留單行排版，但減少操作按鈕佔用寬度。決定列表只保留 `課程紀錄` 與 `變更`，將 `改時間` 與 `取消預約` 放進 `變更` 選單。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-15_2149_booking-change-menu.md`

## 行為變更

- 學員詳細頁「預約課程時段」單行列表改為：
  - 日期
  - 時間
  - 課程名稱
  - `課程紀錄`
  - `變更`
- 點 `變更` 後開啟「變更預約」sheet，可選：
  - `改時間`
  - `取消預約`
- 原本的改時間與取消預約邏輯保留，不改資料處理流程。

## Firestore 讀寫影響

- 無新增 Firestore read/write。
- 本次只調整管理員端 UI 入口；實際資料寫入仍沿用既有 `openBookingMove()` 與 `cancelStudentBooking()` 流程。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。

## 後續風險

- `變更` sheet 目前只有兩個選項；若未來加入更多預約處理動作，可延伸同一入口。

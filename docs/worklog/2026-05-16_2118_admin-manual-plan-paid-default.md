# 2026-05-16 21:18 管理員手動新增方案預設已收款

## 需求摘要

使用者釐清購課與手動建方案應分兩種情境：

- 學員自己在預約頁面買方案：先建立收費與學員資料，但標記未收款；管理員改成已收款後，才顯示方案堂數。
- 管理員在學員資料頁手動幫學員建立方案：應自動視為已收費，建立收費紀錄並標記已收款，同時建立方案堂數。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/core_data_flows.md`
- `docs/worklog/2026-05-16_2118_admin-manual-plan-paid-default.md`

## 行為變更

- `openTicketAdd(preStudentId)` 若從學員詳細頁開啟，付款狀態預設為 `paid`。
- 管理員手動新增方案仍會建立一筆 `payments`，並因狀態為 `paid` 立即透過 `createTicketFromPayment()` 建立一張 `tickets`。
- 若未指定學員或管理員手動改成 `unpaid`，仍會保留待收款流程，不會提前給學員堂數。
- 學員端購課流程不變，仍走 `purchase_requests` 與管理員收款確認。

## Firestore 讀寫影響

- 學員端讀取與寫入路徑沒有新增。
- 管理員手動新增方案時，會寫入 `payments` 與 `tickets`，符合已收款建檔情境。
- 防重仍依 `paymentId` 保護，同一筆收費不會重複開票。

## 驗證

- 已同步 active 版 `admin.html` 到根目錄 `admin.html`。
- 已用 `new Function()` 解析 active 與根目錄 `admin.html` 內非 module scripts，確認語法可解析。
- 已跑 `git diff --check`，僅有 Windows 換行警告，沒有 whitespace error。

## 後續風險

- 管理員若只是想先登記一筆未收款方案，需要在新增方案 sheet 內把狀態改為「待收款」。

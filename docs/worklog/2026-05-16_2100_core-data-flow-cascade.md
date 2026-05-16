# 2026-05-16 21:00 核心資料流 SSOT 與 Cascade 重構

## 需求摘要

使用者要求把「核心資料流 SSOT」補完整，並將取消、預約、改期、刪課整理成共用 cascade 函式，降低之後改動 A 流程卻影響 C 流程的風險。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/core_data_flows.md`
- `docs/ssot/README.md`
- `docs/worklog/2026-05-16_2100_core-data-flow-cascade.md`

## 行為變更

- 新增管理員端預約資料流共用函式：
  - `createBookingCascadeState()`
  - `persistBookingCascadeState()`
  - `addBookingCascade()`
  - `cancelBookingCascade()`
  - `moveBookingCascade()`
  - `deleteSlotCascade()`
- 學員預約匯入改走 `addBookingCascade()`，同步扣票券、寫入行事曆、學員預約與出缺勤。
- 管理員取消預約改走 `cancelBookingCascade()`，同步移除行事曆 booking、學員 scheduledBookings、出缺勤成員、課程日誌關聯，並補回票券。
- 管理員改期改走 `moveBookingCascade()`，只搬移預約與相關紀錄，不重新扣堂。
- 管理員刪除課程時段改走 `deleteSlotCascade()`，對該時段所有預約執行取消 cascade，再刪除時段。
- 新增 `docs/ssot/core_data_flows.md`，定義購課、收款、預約、取消、改期、刪課與資料健康檢查的單一真相。

## Firestore 讀寫影響

- 學員端讀取路徑沒有新增，仍維持低讀取策略。
- 這次變更集中在管理員端低頻操作。
- 取消、改期、刪課會依 dirty flag 寫回需要變動的 `/data/*` 單文件，並同步 `public_booking/state` / `student_lookup`。
- 預約匯入原本就會寫回 `students`、`tickets`、`slots`；本次補齊 `classes` 的同步，避免出缺勤漏資料。

## 驗證

- 已將 active 版 `admin.html` 同步到根目錄 `admin.html`。
- 已用 `new Function()` 解析 active 與根目錄 `admin.html` 內非 module scripts，確認語法可解析。
- 已跑 `git diff --check`，僅有既有 Windows 換行警告，沒有 whitespace error。
- 已用假資料 smoke test 跑過 `addBookingCascade()`、`moveBookingCascade()`、`cancelBookingCascade()`、`deleteSlotCascade()`：
  - 新增預約會扣堂、寫入行事曆、學員預約與出缺勤。
  - 改期會搬移預約，不重複扣堂。
  - 取消會補堂並移除預約與出缺勤。
  - 刪課會移除時段、預約、出缺勤與課程日誌成員，並補回票券。

## 後續風險

- `admin.html` 仍有部分歷史函式與維修工具重複處理票券、日誌或學員資料；後續應逐步改成呼叫 SSOT cascade 或標註為維修工具。
- 正式多老師版本需要在 cascade state 補上 `tenantId` 隔離。

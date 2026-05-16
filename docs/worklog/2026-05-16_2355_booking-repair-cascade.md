# 2026-05-16 23:55 既有預約修復流程整理

## 需求摘要

使用者要求直接繼續下一步，整理 `repairExistingBookingCascade()` 資料修復流程，讓資料一致性檢查 / 修復工具更可靠。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `scripts/core_flow_regression.mjs`
- `docs/ssot/booking_repair.md`
- `docs/ssot/README.md`
- `docs/worklog/2026-05-16_2355_booking-repair-cascade.md`

## 行為變更

- `upsertAttendanceClassForSlotInState()` 改為回傳 `{changed, reason}`，讓修復 summary 更準確。
- `repairExistingBookingCascade()` 只在出缺勤真的變更時才增加 class summary。
- 新增修復回歸測試：
  - 只缺 scheduledBookings 時只補 scheduled。
  - 只缺 classes 時只補 class。
  - 已有排程與出缺勤但缺 ticket log 時只補扣票券。
  - 沒有可用票券時不硬扣。

## Firestore 讀寫影響

- 沒有新增 Firestore read path。
- 沒有新增學生端 read/write。
- 管理員端只在手動執行修復工具時，沿用既有資料寫回路徑。

## 驗證

- 已執行：`node scripts/core_flow_regression.mjs`
- 結果：21 項核心流程回歸檢查通過。
- 已檢查：active `admin.html` 已同步到 root `admin.html`
- 待檢查：GitHub Pages 線上 `admin.html` 包含 `{changed:false,reason:'empty-slot'}`

## 後續風險

- 下一步可開始整理資料一致性檢查 UI，讓管理員看到更明確的「影響 / 下一步」。

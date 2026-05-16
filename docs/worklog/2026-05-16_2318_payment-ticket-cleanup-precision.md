# 2026-05-16 23:18 刪除收費與票券 cleanup 精準化

## 需求摘要

使用者同意優化正式 `admin.html` 的刪除收費 / 刪除票券流程，目標是讓連動清理更可預期：刪除收費會連動移除該收費產生票券造成的預約、學員排程、出缺勤與課程日誌；刪除單一票券則清除該票券造成的預約 artifacts，但保留收費紀錄。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `scripts/core_flow_regression.mjs`
- `docs/ssot/admin_cascade_alignment.md`
- `docs/ssot/payment_ticket_cleanup.md`
- `docs/ssot/README.md`
- `docs/worklog/2026-05-16_2318_payment-ticket-cleanup-precision.md`

## 行為變更

- 正式 `admin.html` 的刪除收費 / 刪除票券 cleanup target 改為更精準：
  - 若 record 有明確 `studentId` 或 `id`，只用 id 比對。
  - 只有舊資料缺 id 時，才 fallback 到 phone/name。
- 降低同名或同電話不同學員時，被刪除收費 / 刪除票券流程誤清資料的風險。
- 回歸測試新增「刪除 A 學員收費時，不應清掉同電話 B 學員預約 artifacts」。

## Firestore 讀寫影響

- 沒有新增新的 Firestore 讀取路徑。
- 沒有新增學生端 read/write。
- 管理員端刪除收費 / 刪除票券時，仍只在原本需要 cleanup 的情境下寫回 `slots`、`students`、`classes`、`course_logs`、`tickets`、`payments`。

## 驗證

- 已執行：`node scripts/core_flow_regression.mjs`
- 結果：15 項核心流程回歸檢查通過。
- 已檢查：active `admin.html` 已同步到 root `admin.html`
- 待檢查：GitHub Pages 線上 `admin.html` 包含 `_ticketArtifactTarget`

## 後續風險

- 這次只精準化刪除收費 / 刪除票券 cleanup matching，尚未整理 `cancelBookingCascade()` 與 `deleteSlotCascade()` 的補票 lookup helper。

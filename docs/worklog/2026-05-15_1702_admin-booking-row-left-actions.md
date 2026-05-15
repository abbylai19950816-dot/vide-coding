# 2026-05-15 17:02 學員預約列按鈕靠左與課程名稱補齊

## 需求摘要

使用者回報學員詳細頁的「預約課程時段」新排版仍不理想，希望按鈕改靠左；同時畫面中有一筆預約缺少課程名稱，需要檢查並修復。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/worklog/2026-05-15_1702_admin-booking-row-left-actions.md`

## 行為變更

- 預約列第二行按鈕由靠右改為靠左排列。
- 課程名稱顯示改為：
  - 優先使用預約快照 `b.typeName`。
  - 若舊資料沒有 `typeName`，改用目前時段 `slot.typeId` 透過 `slotDisplayName(slot)` 回推課程名稱。

## Firestore 讀寫影響

- 無 Firestore read/write 變更。
- 純 UI 顯示修正，不寫回歷史預約資料。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`，4 段 script 均通過。

## 後續風險

- 如果舊預約資料沒有 `typeName`，且對應 slot 也已被刪除，仍可能無法回推課程名稱；目前會顯示空白，日後可考慮用 ticket log 或 class record 補更完整的 fallback。

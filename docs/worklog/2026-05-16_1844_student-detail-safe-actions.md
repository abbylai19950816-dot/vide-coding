# 2026-05-16 18:44 Student Detail Safe Actions

## 需求摘要

使用者回饋學員詳細頁票券「調整」展開後變成兩排，希望改成同一排，並且展開後原本的「調整」應改成「返回」。同時要求同步做下一輪修正，也就是危險操作二階段確認與影響說明。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/product_scope.md`
- `docs/worklog/2026-05-16_1844_student-detail-safe-actions.md`

## 行為變更

- 票券維護操作展開後改成同一排：
  - 返回
  - 扣堂
  - 加堂
  - 修改
  - 刪除
- `details[open]` 時 summary 顯示「返回」，未展開時顯示「調整」。
- 扣堂、加堂前會顯示確認訊息，列出學員、方案、堂數變化與影響。
- 修改剩餘堂數前會顯示確認訊息，列出堂數變化與影響。
- 刪除方案前會顯示確認訊息，提醒該票券會從學員端可用方案中消失，若已有預約/課程紀錄應優先用收費刪除或資料修復流程。
- 刪除學員前會顯示確認訊息，列出將移除的行事曆預約、出缺勤成員、方案票券、收費紀錄數量。
- 刪除學員時，行事曆預約移除條件補強為同時比對姓名與 `studentId`。

## Firestore 讀寫影響

- 無新增學生端讀取。
- 無新增 Firestore listener。
- 操作本身沿用既有 `saveTickets`、`saveStudents`、`saveSlots`、`saveClasses`、`savePayments` 流程；本次只在既有寫入前新增確認步驟。
- 展開/收合 UI 不產生 Firestore 讀寫。

## 驗證

- 已同步 root `admin.html`。
- 已確認 active 與 root `admin.html` hash 一致。
- 已用 Node 解析 classic script blocks，4 個 script blocks 語法檢查通過。
- 已確認 active/root 都包含 `close-label`、`這會直接更新學員可預約的剩餘堂數` 與 `將移除：`。
- 已 commit / push 到 `main`，commit `b71e778 Improve student detail safe actions`。
- GitHub Pages build 狀態為 `built`，commit `b71e778084225d921eb9fa876379623301717057`。
- 已檢查線上 `admin.html?codex_check=1844`，HTTP 200，且包含 `close-label` / `返回`、`這會直接更新學員可預約的剩餘堂數` 與 `將移除：`。

## 後續風險

- 目前仍使用 `confirm()` / `prompt()`，未來可改成更一致的底部 sheet 確認 UI，視覺會更貼近系統風格。
- 刪除方案仍是直接移除票券，不適合作為正式退款/作廢流程；長期應實作 `void/refund` workflow。

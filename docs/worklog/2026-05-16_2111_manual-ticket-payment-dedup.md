# 2026-05-16 21:11 手動新增方案重複開票修正

## 需求摘要

使用者實測手動新增學員「酷哥」，選擇 10 堂課方案後，系統先建立票券與收費紀錄；之後再按收款，學員變成 20 堂，正確應為 10 堂。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/core_data_flows.md`
- `docs/worklog/2026-05-16_2111_manual-ticket-payment-dedup.md`

## 行為變更

- `saveTicket()` 不再於待收款狀態直接建立 ticket。
- 手動新增方案現在先建立 `payments`。
- 若新增時狀態為 `paid`，才立即呼叫 `createTicketFromPayment()` 建立 ticket。
- 若新增時狀態為 `unpaid`，學員不會立刻得到可預約堂數；之後管理員按「標記為已收款」才會建立一張 ticket。
- `createTicketFromPayment()` 新增 legacy 防重：若已存在同學員、同方案、同購買日、同堂數但尚未連結 `paymentId` 的舊票券，會將該票券連回本次收費紀錄，不再新增第二張票券。

## Firestore 讀寫影響

- 學員端讀取路徑沒有新增。
- 管理員手動新增待收款方案時，少一次 `tickets` 寫入。
- 管理員標記已收款時，仍只會建立或連結一張票券，避免重複寫入與堂數膨脹。

## 驗證

- 已同步 active 版 `admin.html` 到根目錄 `admin.html`。
- 已用 `new Function()` 解析 active 與根目錄 `admin.html` 內非 module scripts，確認語法可解析。
- 已跑 `git diff --check`，僅有 Windows 換行警告，沒有 whitespace error。
- 已用假資料 smoke test：
  - 同一筆 paid payment 連續呼叫 `createTicketFromPayment()` 兩次，只會產生 1 張 ticket、10 堂。
  - 舊版已先建立的未連 `paymentId` ticket，再按收款時只會連回該 payment，不會新增第二張 ticket。

## 後續風險

- 這次修正避免未來新增重複票券；已經發生的酷哥 20 堂資料若仍留在線上，需要用資料健康檢查或手動刪除其中一張重複票券修復。

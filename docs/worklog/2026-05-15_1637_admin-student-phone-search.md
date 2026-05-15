# 2026-05-15 16:37 管理員學員手機搜尋修復

## 需求摘要

管理員頁「學員管理」搜尋提示顯示可輸入學員姓名或手機，但實測輸入手機號碼沒有結果，只能用姓名查詢。

## 根因

學員資料中的手機可能包含分隔符，例如 `0928-964-118`，但管理員搜尋常輸入純數字 `0928964118`。原本搜尋邏輯直接用原字串比對 `s.phone.includes(q)`，因此格式不同時查不到。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/product_scope.md`
- `docs/worklog/2026-05-15_1637_admin-student-phone-search.md`

## 行為變更

- 管理員學員搜尋維持姓名搜尋。
- 手機搜尋同時支援原字串與純數字比對。
- 例如輸入 `0928-964-118`、`0928964118`、或部分數字片段，都能找到對應學員。

## Firestore 讀寫影響

- 無新增 Firestore read/write。
- 搜尋只使用管理員端已載入的 `students` local cache。
- 學生端低成本讀取路徑不受影響。

## 驗證

- 已同步 active 與根目錄 `admin.html`。
- 已對根目錄 `admin.html` 的 classic scripts 執行 `node --check`。

## 後續風險

- 若未來加入其他聯絡欄位搜尋，例如 LINE ID 或緊急聯絡電話，需要另外定義是否也要做數字正規化比對。

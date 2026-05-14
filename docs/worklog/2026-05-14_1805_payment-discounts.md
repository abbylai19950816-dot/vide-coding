# 2026-05-14 收費客製化優惠

## 需求摘要

管理員需要在既有課程方案上套用客製化折扣優惠，但不希望新增複雜功能或改變學員購課流程。

## 變更檔案

- `active/gyrobooking_current/github_pages/admin.html`
- `admin.html`
- `docs/ssot/data_model.md`
- `docs/worklog/2026-05-14_1805_payment-discounts.md`

## 行為變更

- 收費紀錄新增 `originalAmount`、`discountAmount`、`discountReason`，並以 `amount` 表示實收金額。
- 管理員可在收費明細調整原價、折抵金額與優惠原因。
- 優惠只影響收費金額；課程方案的堂數、效期與票券規則仍由原方案決定。
- 若付款已標記為已收款且已建立票券，修改優惠只同步更新該票券的 `price`，不會重複開票券。
- 從學員購課申請匯入的收費紀錄預設 `discountAmount: 0`，日後由管理員手動套用優惠。

## Firestore 讀寫影響

- 學員端沒有新增 Firestore read/write。
- 管理員端仍沿用既有 `/data/payments` 儲存流程。
- 已付款後調整優惠時，若找到連動票券，會多更新一次 `/data/tickets`，屬管理員操作，不影響 Firebase 免費版學員端成本。

## 驗證

- 已同步 `active/gyrobooking_current/github_pages/admin.html` 到根目錄 `admin.html`。
- 已執行 HTML script parse 檢查，`index.html` 與 `admin.html` 的所有 script 皆可解析。

## 後續風險

- 目前折扣是單筆收費紀錄層級，不做折扣碼、活動期間、多人同行自動判斷；若未來優惠規則變複雜，再設計專門的 `promotions` 設定。

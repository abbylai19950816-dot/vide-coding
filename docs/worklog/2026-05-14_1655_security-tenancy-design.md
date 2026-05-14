# 安全規則與多老師隔離設計紀錄

## 請求摘要

使用者要求設計安全版 Firestore rules，但提醒之前 rules 太限縮會造成學員端與管理員端不同裝置讀不到最新設定與開課時間。新設計必須同時確保：

- 學員不同裝置都能讀到最新公開課表與預約時間。
- 學員資料不能外洩。
- 未來開放不同老師使用時，不同老師不能看到彼此學生資料。

## 變更檔案

- `docs/ssot/security_and_tenancy_plan.md`
- `docs/ssot/README.md`
- `docs/ssot/decision_log.md`
- `docs/worklog/2026-05-14_1655_security-tenancy-design.md`

## 設計重點

- 學員端跨裝置讀最新資料，靠公開 mirror：`public_booking/state`，未來改為 `tenants/{tenantId}/public_booking/state`。
- 公開 mirror 不放電話、LINE、IG、備註、收費、票券明細、出缺勤。
- 私密資料改放 tenant 私有區：`tenants/{tenantId}/data/{docId}`。
- 學員查詢剩餘堂數只允許 direct get `student_lookup/{hash}`，禁止 list。
- 多老師隔離依 Firebase Auth custom claims 中的 `tenantId` / `tenantIds` / `role` 判斷。
- 短期 Firebase 免費版建議採 `purchase_requests` / `booking_requests` create-only，管理員核准後寫入私有資料。
- 若未來要安全且即時扣堂，建議導入 Cloud Functions / Cloud Run 後端交易。

## Firestore 讀寫影響

本次只新增設計文件，沒有變更正式 rules，也沒有變更程式碼讀寫路徑。

設計目標是未來讓學生端維持：

- 讀 `public_booking/state`
- get 單一 `student_lookup/{hash}`
- create 單一 `purchase_requests` 或 `booking_requests`

並避免學生端讀寫 `/data/*`。

## 驗證 performed

- 讀取目前 `active/gyrobooking_current/firestore.rules`，確認仍為測試期全開。
- 讀取 `docs/ssot/data_model.md` 與既有 rules spec。
- 參考 Firebase 官方 Security Rules 與 App Check 文件，確認 rules 不是 query filter、公開 allow-all 不適合 production、Firebase Auth 與 rules 是角色控管基礎。

## 後續風險

- 不應直接部署新 rules 草案，因為目前學生即時預約仍會直接更新私有 `/data/*` 文件。
- 若要在 Firebase 免費版中提高安全性，需接受「預約申請/購課申請由管理員核准」的流程調整。
- 若一定要維持即時預約與即時扣堂，需評估 Blaze/Cloud Functions 或 Cloud Run 的成本與部署。

# 2026-05-16 16:42 Document LINE Login Future Identity

## 需求摘要

- 學員端未來可能改用 LINE Login 作為身份辨識，降低記查詢碼或提供手機的負擔。
- 目前先不實作，只寫入 SSOT，日後再作為身份系統升級處理。

## 變更檔案

- `docs/ssot/product_scope.md`
- `docs/ssot/security_and_tenancy_plan.md`

## 決策內容

- LINE Login 是未來優先考慮的身份系統升級方向。
- LINE Login 可用 LINE user id 辨識同一位學員，降低同名同姓、查詢碼忘記、手機隱私疑慮。
- 此功能不是 UI 小修，需視為身份系統升級。
- 純 GitHub Pages 前端不得保存 LINE channel secret。
- LINE Login callback / token 驗證應由安全後端處理，例如 Firebase Functions、Cloud Run，或其他可保管 secret 的後端。
- 公開 Firestore 文件不得保存 raw LINE user id，應使用 hash 或後端 mapping，例如 `line_lookup/{lineUserIdHash}`。
- 未來仍需保留 fallback 流程，避免不想或無法使用 LINE Login 的學員被卡住。

## 成本與 Firebase 影響

- 本次沒有程式碼變更，沒有新增 Firestore 讀寫。
- 未來若使用 Firebase Functions，通常需要升級 Firebase Blaze pay-as-you-go。
- 小流量可能落在 no-cost quota，但 Blaze 需綁定計費帳戶，因此實作前必須先設定 budget alert、用量監控與防濫用策略。

## 驗證

- 已確認只修改文件與 worklog。
- 無需部署 GitHub Pages。

## 後續

- 未來要實作 LINE Login 前，需先補完整技術規格：
  - LINE Developers channel 設定
  - callback URL
  - backend token 驗證
  - `line_lookup/{lineUserIdHash}` data model
  - Firestore rules
  - Firebase Blaze 預算與用量防護
  - fallback 登入流程

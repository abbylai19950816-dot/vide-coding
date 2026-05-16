# Multi-Tenant SaaS Architecture Plan

## 目標

未來當單一老師版本穩定後，Gyrobooking 應可讓不同老師或有類似需求的人使用同一套系統。每位老師都能自行設定課程方案、開課時間、收費與學員管理，並分享自己的購課預約頁面給學生。

此階段的核心目標是資料隔離、登入授權、低成本讀寫與資訊安全。任何新功能若會影響這些方向，都必須先檢查本文件。

## 核心原則

- 每位老師是一個獨立 tenant。
- 老師只能讀寫自己 tenant 底下的資料。
- 學生只能讀該老師的公開課表與自己的查詢結果。
- 不同老師之間的學生、收費、票券、課表、出缺勤、日誌不得互通。
- 公開學生頁不得讀取私密 `/data/*`。
- 公開 mirror 不得包含姓名、完整電話、LINE、IG、備註、付款、票券明細或課程日誌。
- localStorage 只能作為快取，不得成為跨 tenant 的資料來源。
- tenant routing、Firestore path、Firebase Auth claims、Firestore rules 必須一致。

## 未來 URL 與分享頁

短期可用 query string：

```text
index.html?tenant={tenantId}
admin.html?tenant={tenantId}
```

中期可用乾淨路由或子網域：

```text
booking.example.com/t/{tenantSlug}
{tenantSlug}.booking.example.com
```

規則：

- 學生頁必須先解析 tenant，再讀取該 tenant 的公開 mirror。
- 老師分享給學生的連結必須固定指向自己的 tenant。
- 若 tenant 不存在或被停用，學生頁應顯示友善錯誤，不得 fallback 到其他老師資料。

## Firestore 資料模型方向

未來目標結構：

```text
tenants/{tenantId}
tenants/{tenantId}/public_booking/state
tenants/{tenantId}/web_config/flags
tenants/{tenantId}/student_lookup/{lookupId}
tenants/{tenantId}/phone_lookup/{phoneHash}
tenants/{tenantId}/line_lookup/{lineUserIdHash}
tenants/{tenantId}/purchase_requests/{requestId}
tenants/{tenantId}/booking_requests/{requestId}
tenants/{tenantId}/data/students
tenants/{tenantId}/data/tickets
tenants/{tenantId}/data/payments
tenants/{tenantId}/data/classes
tenants/{tenantId}/data/slots
tenants/{tenantId}/data/course_logs
tenants/{tenantId}/data/booking_cfg
```

目前單一老師版本的 `/data/*`、`public_booking/state`、`student_lookup/{hash}`、`purchase_requests`、`booking_requests` 應視為 legacy single-tenant paths。正式多租戶前，要先建立 migration plan。

## 老師與管理員權限

Firebase Auth / custom claims 未來應至少支援：

- `tenantId`: 主要管理的 tenant。
- `tenantIds`: 可管理多個 tenant 時使用。
- `role`: `owner`、`admin`、`staff`。
- `superAdmin`: 平台維運者專用，平常不要用於日常操作。

權限規則：

- `owner/admin/staff` 只能讀寫自己 tenant。
- `superAdmin` 僅供維運、客服或資料修復，不應是一般老師權限。
- 管理員頁必須在登入後確認 token claim 與目前 URL tenant 一致。
- 若登入者沒有該 tenant 權限，必須拒絕讀寫並顯示無權限提示。

## 學生身份與隱私

學生端短期可維持：

- `public_booking/state`: 公開課表與名額。
- `student_lookup/{lookupId}`: 單一查詢結果，不可 list。
- `purchase_requests/{requestId}`: create-only。
- `booking_requests/{requestId}`: create-only。

未來若導入 LINE Login：

- LINE user id 不得以 raw value 暴露在前端可讀文件。
- 使用 `lineUserIdHash` 或後端 mapping。
- `line_lookup/{lineUserIdHash}` 必須 tenant-scoped，避免同一學生跨老師時資料混在一起。
- 仍需保留 fallback 流程，例如姓名 + 手機或老師協助確認。

## Firestore Rules 原則

必要規則：

- `tenants/{tenantId}/public_booking/state`: public read，tenant admin write。
- `tenants/{tenantId}/web_config/flags`: public read，tenant admin write。
- `tenants/{tenantId}/student_lookup/{lookupId}`: public get only，no list，tenant admin write。
- `tenants/{tenantId}/phone_lookup/{phoneHash}`: public get only，no list，tenant admin write。
- `tenants/{tenantId}/purchase_requests/{requestId}`: public create only，tenant admin read/update/delete。
- `tenants/{tenantId}/booking_requests/{requestId}`: public create only，tenant admin read/update/delete。
- `tenants/{tenantId}/data/{docId}`: tenant admin only。
- default deny all other paths。

公開 create rules 必須驗證欄位白名單與基本格式，避免垃圾資料與私密欄位被寫入。

## 低成本原則

- 學生頁初始讀取仍應控制在公開 mirror 與必要設定。
- 學生查詢本人資料只能讀一筆 tenant-scoped lookup document。
- 學生端不得 collection-wide read。
- 管理員端 listener 必須 single-init 並 debounce，不得在 render function 裡建立 listener。
- Public mirror 若接近文件大小上限，應改成依月份拆分，例如 `public_booking/months/{yyyyMM}`。

## Migration Plan 草案

### Phase 0：目前單一老師版本穩定

- 繼續修 bug 與 UI。
- 不急著搬資料路徑。
- 每次新增資料欄位時避免寫死全域假設。

### Phase 1：抽象 tenant context

- 新增 `tenantId = default` 的設定與 helper。
- 所有讀寫函式先透過 helper 組 path。
- UI 仍維持單一老師，但程式不再直接散落全域 path。

### Phase 2：建立 tenant-scoped mirror 與 lookup

- 寫入 `tenants/default/public_booking/state`。
- 寫入 `tenants/default/student_lookup/{hash}`。
- 保留 legacy path 過渡，確認學生端可讀新 path。

### Phase 3：管理員權限與 rules

- 老師登入 token 加上 tenant claims。
- `admin.html` 驗證目前 tenant 與 claims。
- Firestore rules 改成 tenant-scoped。

### Phase 4：資料遷移

- 將 legacy `/data/*` 搬到 `tenants/default/data/*`。
- 建立 migration script 與 rollback plan。
- 完成後逐步停用 legacy path。

### Phase 5：多老師 onboarding

- 建立 tenant 建立流程。
- 每個 tenant 有自己的 `booking_cfg`、公開頁、管理頁。
- 支援老師分享 tenant-specific student page。

### Phase 6：LINE Login 或其他身份系統

- 先完成後端 callback、budget alert、Firestore rules，再上線。
- LINE Login 作為推薦登入，fallback 流程仍保留。

## Action Items

### 近期，不破壞現有系統

- 建立 tenant-aware path helper 的設計稿，不急著改所有程式。
- 每次新增功能時避免硬寫全域 `/data/*` 假設。
- 檢查現有程式中所有 `public_booking/state`、`student_lookup`、`purchase_requests`、`booking_requests`、`/data/*` 的集中程度。
- 把「公開頁不得包含私密資料」加入每次 release checklist。

### 下一階段，正式設計

- 設計 `tenantId` / `tenantSlug` 規則。
- 設計老師角色與 Firebase custom claims。
- 設計 Firestore tenant rules。
- 設計 legacy single-tenant 到 `tenants/default` 的 migration script。
- 設計 tenant-specific URL 與 fallback 錯誤頁。

### 上線前必做

- 建立測試 tenant A / tenant B。
- 驗證 A 老師不能讀 B 資料。
- 驗證 B 老師不能讀 A 資料。
- 驗證 A 學生頁只看到 A 課表。
- 驗證 B 學生頁只看到 B 課表。
- 驗證學生端不能 list lookup 或讀 `/data/*`。
- 驗證管理員 listener 沒有重複建立造成讀取暴增。

# Cost Model and Budget Guardrails

## 目的

本文件記錄 Gyrobooking 從單一老師版本走向多老師 SaaS 版本時，可能增加的成本項目與控制原則。

現階段產品仍以 Firebase 免費額度與低讀寫設計為優先。任何新增功能若會讓學生端、管理員端或後端工作量明顯增加，都必須先評估是否會破壞免費版成本邊界。

## 成本總覽

| 成本項目 | 現階段 | 多老師版本可能變化 | 控制原則 |
| --- | --- | --- | --- |
| Frontend hosting | GitHub Pages 可維持免費 | 若要自訂網域、乾淨路由或更好部署流程，可考慮 Cloudflare Pages / Firebase Hosting | 前端仍維持靜態網站，避免為了 UI 導入固定月費服務 |
| Custom domain | 無固定成本或使用 GitHub Pages 網址 | 若使用品牌網域，會有每年網域費用 | 等產品穩定、需要正式對外分享時再購買 |
| Firestore reads/writes | 主要成本風險來自讀寫次數 | 老師與學生數增加後，讀寫會依 tenant 成長 | 學生端只讀公開 mirror 與單筆 lookup；管理員 listener single-init + debounce |
| Firestore storage | 目前很低 | 多老師、歷史紀錄、出缺勤、日誌會逐步增加 | 保留必要紀錄；大型匯出或歷史封存另行設計 |
| Firebase Authentication | 目前管理員登入需求低 | 多老師登入、角色、custom claims 會變重要 | 先設計 tenant claims，再收緊 rules |
| Firebase Functions / backend | 目前盡量不使用 | LINE Login、token 驗證、hash mapping、custom claims 可能需要 | 只有身份安全或資料隔離必要時才導入；導入前開 budget alert |
| LINE Login | 純登入本身不一定有固定費 | 安全串接需要 backend；若搭配 Messaging API 推播，可能有訊息量成本 | LINE Login 先列為未來身份升級，不做成短期必需功能 |
| LINE Messaging API | 目前未使用 | 若做自動通知、廣播、課前提醒，會依官方帳號方案與訊息量產生成本 | 預約通知先用頁面提示或老師手動聯絡；推播功能獨立評估 |
| Monitoring / backups | 目前手動與 GitHub 記錄 | 多老師版本需要資料備份、錯誤追蹤、客服流程 | 先用低成本匯出與操作日誌，商業化前再補正式維運工具 |
| Legal / support | 目前內部使用 | 對外開放後需要隱私權政策、服務條款、資料刪除流程 | 正式開放前列為上線必要項目 |

## 免費版優先原則

- 學生頁初始讀取只允許公開課表 mirror 與必要設定。
- 學生查詢個人資料只能讀一筆 lookup document，例如 `student_lookup/{lookupId}` 或未來的 `tenants/{tenantId}/student_lookup/{lookupId}`。
- 學生端不得使用 collection-wide `getDocs()` 或 `onSnapshot()`。
- 管理員端即時更新可以使用 listener，但必須集中初始化、避免重複監聽，且大量 UI render 不得建立新 listener。
- `public_booking/state` 若文件太大，先改成月份拆分，例如 `public_booking/months/{yyyyMM}`，不要讓每次讀取帶出整個歷史資料。
- 匯入申請、預約申請與 mirror 更新要避免無差異重寫；需要 hash/diff 檢查。
- 未來每個 tenant 應有用量觀察欄位，方便找出讀寫異常的老師帳號或流程。

## 多老師版本的成本風險

### 1. Firestore 讀取數

最容易失控的是管理員頁或學生頁不小心讀取整個 collection。

必須避免：

- 學生端讀 `/data/students`、`/data/tickets`、`/data/payments`。
- 每次切換頁籤都重新建立 `onSnapshot()`。
- 每個老師都讀全域共用資料後再用前端過濾 tenant。
- 公開頁讀完整年度或全部歷史課程。

推薦做法：

- 所有資料都先按 `tenantId` 分區。
- 公開課表 mirror 只放學生端需要看到的欄位。
- 課表 mirror 依目前週、月份或未來可預約範圍拆分。
- 管理員端資料集中讀取後用本機狀態 render，不在每個元件重讀 Firestore。

### 2. Firestore 寫入數

多老師版本中，寫入數通常來自購課、付款、預約、取消、改期、出缺勤與 mirror 同步。

控制原則：

- 一個業務動作應盡量集中在單一 transaction 或單一同步流程。
- 不要因為每個欄位變動就重寫整份大型 mirror。
- `student_lookup`、`phone_lookup`、`line_lookup` 只在必要時更新。
- 管理員批次操作需先比較差異，避免對沒有變動的資料重寫。

### 3. Backend 成本

只要導入 LINE Login、custom token、LINE callback 或安全 hash mapping，就會需要後端處理層。Firebase Functions 或 Cloud Run 可能仍有免費額度，但通常需要升級到 Blaze pay-as-you-go 並綁定付款方式。

導入後端前必做：

- 設定 Firebase budget alert。
- 設定 function rate limit 或基本防濫用機制。
- 先以最小 callback/token 驗證功能上線，不在 Functions 裡做大量報表或排程。
- 不把 LINE secret、service account、hash salt 放在 GitHub Pages 前端。

### 4. LINE 成本

LINE Login 主要解決身份辨識與登入便利性；LINE Messaging API 則是另一個成本面。

原則：

- LINE Login 可作為未來推薦身份方式。
- 自動推播、課前提醒、付款提醒、廣播行銷要另外估算訊息量。
- 不應把 LINE 推播列為預約系統的第一版必要功能。
- 若老師需要通知功能，先提供「複製訊息 / 開啟 LINE 聯絡」等低成本流程。

## 商業化前的成本門檻

在開放給其他老師前，至少要完成：

- 每個 tenant 的讀取、寫入、儲存用量觀察方式。
- Firebase budget alert。
- 明確定義免費或低價方案的使用上限，例如老師數、學員數、每月預約數、課表保留月份。
- Firestore rules tenant isolation 測試。
- 壓力測試：多名學生同時購課與預約時，讀寫次數是否仍可接受。
- 資料匯出、資料刪除、帳號停用流程。

## 目前決策

- 目前仍以 Firebase 免費版能承受的架構為主。
- 短期不為了 LINE Login 或多老師版本提前導入後端。
- 多老師版本啟動前，先完成 tenant path、tenant rules、teacher auth、public mirror 分區與成本觀察。
- 任何會新增 collection-wide listener、公開端大量讀取、後端長時間任務、推播訊息的功能，都必須先更新本文件並評估成本。

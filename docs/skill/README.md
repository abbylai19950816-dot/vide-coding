# Gyrobooking Codex Skill SSOT

這份文件是 Gyrobooking 專案給 Codex 使用的專案級 skill SSOT。新的對話框若要修改功能、修 bug、部署或寫文件，應先閱讀本文件，再閱讀 `skills/gyrobooking-low-cost/SKILL.md` 與相關 `docs/ssot/*`。

## 啟動前必讀

1. 本專案正式工作副本是 `active/gyrobooking_current`。
2. GitHub Pages 實際線上入口是 repo 根目錄的 `index.html` 與 `admin.html`。
3. 若修改 `active/gyrobooking_current/github_pages/index.html`，必須同步到根目錄 `index.html`。
4. 若修改 `active/gyrobooking_current/github_pages/admin.html`，必須同步到根目錄 `admin.html`。
5. 不要只看本機或 GitHub commit 成功；部署完成前，必須直接抓線上網址確認新功能字串存在。
6. 若線上看不到更新，優先檢查 GitHub Pages build 狀態，不要先要求使用者清快取。

## 低成本 Firebase 原則

- 學員端初始載入只應讀 `public_booking/state` 與 `web_config/flags`。
- 學員查詢方案只應讀單一 `student_lookup/{hash}`。
- 學員端不得 bulk-read `students`、`tickets`、`payments`。
- 學員端不得直接寫 `/data/*` 私密資料；公開端新增購課/預約應使用 `purchase_requests` / `booking_requests`。
- 管理員端可以讀寫 `/data/*`，但 listener 必須 single-init，避免重複監聽造成讀取暴增。
- 改動預約、票券、課表、公開 mirror 時，要說明 Firestore read/write 影響。

## 部署檔同步流程

修改 `index.html` 或 `admin.html` 時，使用以下流程：

1. 先修改 `active/gyrobooking_current/github_pages/{file}`。
2. 語法檢查通過後，複製到 repo 根目錄同名檔案。
3. 確認 active 與根目錄同名檔包含同一組功能關鍵字。
4. 更新 `docs/worklog/YYYY-MM-DD_HHMM_short-topic.md`。
5. 若影響部署、產品行為、資料形狀、安全或成本，更新對應 `docs/ssot/*`。
6. commit 並 push 到 `main`。
7. 查 GitHub Pages build 狀態。
8. 用線上網址驗證功能字串：
   - `https://abbylai19950816-dot.github.io/gyrobooking/index.html`
   - `https://abbylai19950816-dot.github.io/gyrobooking/admin.html`

## 線上驗證規則

每次 push 後都要確認：

- GitHub Pages source 是 `main /`。
- 根目錄 `.nojekyll` 存在。
- 線上 `admin.html` / `index.html` 包含本次功能的關鍵字或函式名稱。
- 如果 GitHub Pages build 顯示 `errored`，但線上檔案已更新，仍要在回覆中說明 Pages API 狀態與線上檔案實際檢查結果。
- 若線上檔案沒有更新，不要請使用者重開無痕；先修部署。

## 文件規則

- 規格文件、SSOT、工作紀錄以繁體中文為主。
- 技術名稱、檔案路徑、Firestore path、function name、command 保持英文。
- 每次變更檔案都必須寫 `docs/worklog/`。
- Worklog 至少包含：需求摘要、變更檔案、行為變更、Firestore 讀寫影響、驗證、後續風險。

## 新對話框提示詞

新對話框可以直接貼以下內容：

```text
這是 gyrobooking 專案。請先閱讀 docs/skill/README.md 與 skills/gyrobooking-low-cost/SKILL.md。

重要規則：
1. active/gyrobooking_current 是工作副本。
2. GitHub Pages 實際吃根目錄 index.html / admin.html。
3. 改 active/github_pages/index.html 或 admin.html 後，必須同步到根目錄同名檔案。
4. push 後要查 GitHub Pages build 狀態，並抓線上網址確認新功能字串存在。
5. 若線上看不到更新，先查部署，不要先叫我清快取。
6. 每次變更都要寫 docs/worklog，影響行為/安全/成本/部署時要更新 docs/ssot。
7. Firebase 以免費版低讀寫為優先，不可新增學員端 bulk read 或 collection-wide listener。
```

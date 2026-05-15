# 2026-05-15 16:23 GitHub Pages 部署失敗修復

## 需求摘要

使用者回報無痕視窗關掉重開後，線上管理員頁仍看不到「改時間」功能。

## 檢查結果

- 本機 `admin.html` 與 `active/gyrobooking_current/github_pages/admin.html` 都已包含 `openBookingMove()` 與「改時間」按鈕。
- 直接抓取線上 `https://abbylai19950816-dot.github.io/gyrobooking/admin.html`，確認線上檔案仍沒有 `openBookingMove`。
- GitHub Pages API 顯示部署來源是 `main /`，但 Pages build 狀態為 `errored`，因此線上停留在上一版成功部署。

## 變更檔案

- `.nojekyll`
- `docs/ssot/release_process.md`
- `docs/worklog/2026-05-15_1623_github-pages-nojekyll.md`

## 行為變更

- 新增根目錄 `.nojekyll`，讓 GitHub Pages 以靜態 HTML 專案服務，不再透過 Jekyll 處理整個 repo。
- SSOT 補充 GitHub Pages 入口與部署驗證規則。

## Firestore 讀寫影響

- 無 Firestore 行為變更。
- 無學生端或管理員端讀寫路徑變更。

## 驗證

- 已確認 Pages build 失敗是造成線上舊版未更新的原因。
- 推送後需再次檢查 Pages build 狀態，並用線上 `admin.html` 是否包含 `openBookingMove` 作為驗證。

## 後續風險

- 如果 Pages 仍失敗，需要改查 GitHub Pages build 的更詳細錯誤或改用 GitHub Actions 部署靜態檔案。

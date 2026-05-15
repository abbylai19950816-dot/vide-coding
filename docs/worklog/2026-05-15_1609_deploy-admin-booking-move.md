# 2026-05-15 同步管理端改時間功能到部署檔

## 需求摘要

使用者回報線上管理員頁看不到「改時間」功能。檢查後發現先前功能已實作並推到 `active/gyrobooking_current/github_pages/admin.html`，但 GitHub Pages 實際使用的是根目錄 `admin.html`。

## 變更檔案

- `admin.html`
- `docs/worklog/2026-05-15_1609_deploy-admin-booking-move.md`

## 行為變更

- 將管理員「更改預約時間」功能同步到實際部署用的根目錄 `admin.html`。
- 線上管理員頁應可在「學員詳細頁 → 預約課程時段 → 未來預約」旁看到「改時間」按鈕。

## Firestore 讀寫影響

- 未新增學生端 Firestore 讀取或監聽。
- 未新增學生端 `getDocs()`、大量 `onSnapshot()`，也未讀 `/data/students` 或 `/data/tickets`。
- 管理端沿用既有 `saveSlots()`、`saveStudents()`、`saveClasses()`、`saveLogs()`、`saveTickets()` 寫回資料。
- `saveSlots()` / `saveStudents()` 仍透過既有低成本公開鏡像 debounce 同步。

## 驗證

- 確認根目錄 `admin.html` 已包含 `sheet-bookingMove`、`openBookingMove()` 與「改時間」按鈕。
- 確認學生端 `github_pages/index.html` 未新增 `getDocs()`。

## 後續風險

- GitHub Pages 可能有短暫快取；推上 `main` 後仍可能需要等待或強制重新整理。

# 2026-05-15 21:45 Codex skill SSOT

## 需求摘要

使用者希望把「新對話框新增功能時，避免只改 active 檔、忘記根目錄部署檔」的規則寫進 `docs/skill`，並讓它成為 SSOT。

## 變更檔案

- `docs/skill/README.md`
- `docs/ssot/README.md`
- `skills/gyrobooking-low-cost/SKILL.md`
- `docs/worklog/2026-05-15_2145_codex-skill-ssot.md`

## 行為變更

- 新增 `docs/skill/README.md` 作為 Codex/new-chat 專案級 skill SSOT。
- 明確記錄：
  - `active/gyrobooking_current` 是工作副本。
  - GitHub Pages 實際入口是根目錄 `index.html` / `admin.html`。
  - 修改 active `github_pages/index.html` / `admin.html` 後必須同步根目錄同名檔。
  - push 後要查 GitHub Pages build 狀態，並抓線上檔案確認功能字串存在。
  - 線上看不到更新時，先查部署，不先要求使用者清快取。
- 更新 `skills/gyrobooking-low-cost/SKILL.md`，讓 skill 啟動時優先讀 `docs/skill/README.md`。
- 更新 `docs/ssot/README.md`，把 `docs/skill/README.md` 納入 SSOT index。

## Firestore 讀寫影響

- 無程式執行邏輯變更。
- 無 Firestore read/write 路徑變更。
- 本次只新增與更新文件/skill guardrails。

## 驗證

- 已確認 `docs/skill/README.md` 包含新對話框可直接貼上的提示詞。
- 已確認 repo 內 `skills/gyrobooking-low-cost/SKILL.md` 指向 `docs/skill/README.md`。

## 後續風險

- 本機已安裝到 Codex 的 skill 位於使用者 `.codex/skills`，不一定會自動跟 repo 內 `skills/gyrobooking-low-cost/SKILL.md` 同步。若未來需要讓 Codex 每次啟動都讀到新版 skill，需再同步安裝或複製到 Codex skills 目錄。

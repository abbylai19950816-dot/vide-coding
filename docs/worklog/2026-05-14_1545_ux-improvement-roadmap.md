# 工作紀錄：新增 UX 改善路線圖

## 需求摘要

使用者希望整理一些更新建議，說明如何讓使用者體驗更好，並寫入 `docs/ssot`。

## 變更檔案

- `docs/ssot/ux_improvement_roadmap.md`
- `docs/worklog/2026-05-14_1545_ux-improvement-roadmap.md`

## 行為變更

未修改預約系統 runtime 程式邏輯。此次只新增 SSOT 文件，整理學生端與管理端的 UX 改善方向、優先級、成本影響與驗收標準。

## Firestore 讀寫影響

無直接影響。文件中特別標註 UX 改善應優先使用既有 `public_booking/state`、`student_lookup/{hash}` 與管理端 memory cache，避免增加學生端 Firestore reads。並補充現階段成本策略以 Firebase 免費版為主，不把 Cloud Functions、外部付費服務或高頻即時監聽當成預設方案。

## 驗證

- 已讀取專案 SKILL。
- 已檢視 `docs/ssot` 現有結構。
- 已搜尋學生端與管理端主要流程、tab、預約、購課、提示與管理功能關鍵字。

## 後續風險

- 文件是建議路線圖，尚未實作 UI。
- 若後續要做「我的預約」或自助取消，需先確認資料模型與 Firestore rules，不宜只做前端 localStorage 同步。

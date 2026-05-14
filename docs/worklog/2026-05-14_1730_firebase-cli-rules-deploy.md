# Firebase CLI 與 Firestore rules 部署紀錄

## 請求摘要

使用者要求安裝 Firebase CLI，並由 Codex 協助部署已收緊的 Firestore rules。

## 變更檔案

- `firebase.json`
- `.firebaserc`
- `docs/worklog/2026-05-14_1730_firebase-cli-rules-deploy.md`

## 設定內容

- `firebase.json` 只設定 Firestore rules：
  - `active/gyrobooking_current/firestore.rules`
- `.firebaserc` 設定 default project：
  - `gyrobooking-fbfd5`

## Firestore 讀寫影響

此文件本身不改變前端讀寫；實際影響會在 `firebase deploy --only firestore:rules` 成功後生效。

## 驗證 performed

- Firebase CLI 版本確認：`15.18.0`。
- 登入狀態確認：`Logged in as abbylai19950816@gmail.com`。
- 專案確認：`gyrobooking-fbfd5`。
- 部署指令：`tools\firebase\firebase.exe deploy --only firestore:rules --project gyrobooking-fbfd5`。
- 部署結果：rules file `active/gyrobooking_current/firestore.rules` compiled successfully，並 released rules to `cloud.firestore`。

## 後續風險

- 部署 Firestore rules 會覆蓋 Firebase Console 現有 rules，需確認目前 repo rules 是預期正式版本。
- 若 rules 部署後發現學生購課/預約申請被拒，需檢查 request payload 與 rules 欄位白名單是否一致。

# 嬋柔課程管理系統

## 上傳到 GitHub Pages 步驟

### 第一次設定

1. 登入 [github.com](https://github.com)（沒有帳號請先免費註冊）
2. 點右上角「＋」→「New repository」
3. Repository name 填：`zhinrou`（或任何你想要的名稱）
4. 選 **Public**（免費方案需要 Public 才能使用 Pages）
5. 點「Create repository」

### 上傳檔案

6. 進入剛建立的 Repository
7. 點「Add file」→「Upload files」
8. 把以下三個檔案拖曳上傳：
   - `index.html`（學員預約頁）
   - `admin.html`（管理員後台）
   - `README.md`（這個說明）
9. 點「Commit changes」

### 開啟 GitHub Pages

10. 進到 Repository 的 **Settings**（右上角齒輪）
11. 左側選「Pages」
12. Source 選「Deploy from a branch」
13. Branch 選「main」，資料夾選「/ (root)」
14. 點「Save」
15. 等 1~2 分鐘，重新整理後頁面會顯示你的網址，例如：
    `https://yourname.github.io/zhinrou/`

---

## 網址說明

| 頁面 | 網址 |
|------|------|
| 學員預約頁（分享給學員） | `https://yourname.github.io/zhinrou/` |
| 管理員後台（自己使用） | `https://yourname.github.io/zhinrou/admin.html` |

---

## 管理員密碼

預設密碼：**`zhinrou2025`**

要修改密碼：在 `admin.html` 裡找到這行並修改：
```
var PW = 'zhinrou2025';
```
改完後重新上傳 `admin.html` 即可。

---

## 重要說明

- 資料儲存在**瀏覽器 localStorage**
- 學員在手機用你的網址預約 → 資料寫入同一個 GitHub Pages 網域
- 你用同一個瀏覽器開 `admin.html` → 可以看到學員的預約資料
- **不同裝置之間資料不會自動同步**（localStorage 是本機存的）
- 建議你固定用同一台電腦的同一個瀏覽器開管理後台

---

## 更新檔案

日後如果有新版本，只要重新上傳對應的 html 檔即可，舊資料會保留。

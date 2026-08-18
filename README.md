# Team Bonding Fund

團隊活動基金管理小工具。純前端靜態網頁（無需伺服器/建置流程），資料存在 Supabase。
每個團隊靠一個「組別代碼」互相隔離，不同團隊可以共用同一個部署站點。

## 功能

- 每個組員每月固定額度，當月沒用完可以**延到下個月**用（只延一個月，之後就過期）
- 個人與團隊的「本月配額 / 上月結轉 / 已用 / 可帶到下月」總覽
- 組員名單管理（新增、啟用/停用）
- 每月額度可調整，並保留歷史設定
- 使用紀錄（誰用了多少、備註、可刪除）

## 架構

- 純 HTML / CSS / vanilla JS，`js/supabaseClient.js` 直接用 Supabase JS SDK 從瀏覽器連線
- 資料表：`teams`、`members`、`monthly_quota`、`usage_log`（見 `sql/schema.sql`）
- 沒有帳號登入系統 —「組別代碼」是唯一的區隔機制，RLS 設定是完全公開讀寫（見 schema 註解）。
  適合內部小工具，**不要**拿來存真正敏感的資料。

## 第一次設定

1. 到 Supabase 專案 → SQL Editor → 貼上 `sql/schema.sql` 全部內容 → Run
2. `js/supabaseClient.js` 裡的 `SUPABASE_URL` / `SUPABASE_ANON_KEY` 已經填好對應這個專案
3. 部署到 Vercel：Add New → Project → Import 這個 GitHub repo → 直接 Deploy（純靜態，不需要設定 build command）

## 使用

- 開啟網站 → 建立新組別（會產生一個代碼）或輸入既有代碼加入
- 到「組員管理」新增組員
- 到「額度設定」設定每人每月固定額度
- 到「使用紀錄」登記花費
- 「總覽」看整體與各組員的結轉狀況

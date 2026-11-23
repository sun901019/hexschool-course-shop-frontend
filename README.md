# 辦公室小物電商｜課程前端

Vue 3 Composition API、Vite、Tailwind CSS 與 Pinia。此頁面瀏覽由 Express 和 PostgreSQL 提供的課程商品。

[課程後端 Repo](https://github.com/sun901019/hexschool-course-shop-backend)

## 本機操作

先依後端 Repo 的 README 啟動 PostgreSQL 和 API。前端另開一個終端機。

```sh
npm ci
npm run dev
```

開 `http://127.0.0.1:4410/`。Vite 將 `/api/v1` 轉給 `http://127.0.0.1:4411`。修改本機 API 位址時依 `.env.example` 設定 `COURSE_API_PROXY`。前端使用帶 Cookie 的 Fetch 呼叫課程 API。

## 演示順序

1. 進到所有商品。切換三個分類，再搜尋「筆記本」和一個查不到的字詞。每頁四件可實際翻頁。
2. 用課程測試信箱註冊，或用後端 seed 的會員登入。重新整理看會員名稱仍在。
3. 從商品明細選款式並加入，購物車改成兩件。重新整理後以 API 資料確認數量與合計，最後移除並登出。
4. 管理員透過後端 Repo 的 Postman 集合驗證權限及商品管理。

## 前端資料流

`views` 負責頁面與輸入，`components` 放商品卡與分類圖形，`stores` 管理會員與購物車畫面狀態。購物車變更呼叫 API，收到後端的最新購物車再更新 Pinia。商品查詢使用 URL 篩選，重新打開可查看同一組條件。

## 建置與測試

```sh
npm run build
npm run preview
npx playwright install chromium
npm test
```

`dev` 與 `preview` 共用 4410，擇一執行。兩個服務都運作時，瀏覽器測試連到真實課程 API。測試會用測試信箱建立課程會員。商品讀取失敗時的重試提示以一筆測試攔截檢查，其餘流程從資料庫取得資料。

## 獨立部署

以這個 Repo 建置 `dist`，使用獨立前端網址。部署時設定 Vue Router 的歷史路由回退。建議讓前端的 `/api/v1` 轉送到獨立的課程 API 並優先於頁面回退。另保留後端的公開 API Base URL 給 Postman。若使用 `VITE_COURSE_API_BASE_URL` 直接串接，先核對後端允許的來源與 Cookie 同站條件，並用另一個瀏覽器工作階段驗證。

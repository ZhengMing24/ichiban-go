# IchibanGo Backend

Go + Gin + GORM（SQLite）寫的最小可執行後端，提供註冊 / 登入 API，
給 `ichiban-go` 前端串接練習用。

## 快速開始

```bash
cd backend
cp .env.example .env   # 依需要修改，至少把 JWT_SECRET 換掉
go mod tidy
go run main.go
```

伺服器預設跑在 `http://localhost:8080`，資料庫檔案 `ichibango.db`
會自動在 `backend/` 目錄下建立（SQLite，免額外安裝資料庫）。

## API

| Method | Path            | 說明                                  | 需要登入 |
| ------ | --------------- | ------------------------------------- | :------: |
| GET    | `/api/health`   | 健康檢查                               |    否    |
| POST   | `/api/register` | 註冊 `{ email, password, nickname }`   |    否    |
| POST   | `/api/login`    | 登入 `{ email, password }`，成功會設定 `access_token` cookie |    否    |
| POST   | `/api/logout`   | 登出，清除 cookie                      |    否    |
| GET    | `/api/me`       | 取得目前登入使用者資訊                 |    是    |

## 手動測試

```bash
# 註冊
curl -i -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nickname":"測試員"}'

# 登入（-c 把 cookie 存到 cookie.txt）
curl -i -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -c cookie.txt \
  -d '{"email":"test@example.com","password":"password123"}'

# 帶著 cookie 打受保護的 /api/me
curl -i http://localhost:8080/api/me -b cookie.txt
```

## 跟前端（Vite React，`http://localhost:5174`）串接

前端 fetch 記得加 `credentials: 'include'`，瀏覽器才會帶上 / 收下 cookie：

```ts
fetch("http://localhost:8080/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});
```

## 上線前必改

- `JWT_SECRET` 換成隨機長字串，不要用預設值
- `internal/handlers/auth.go` 裡 `c.SetCookie` 的 Secure 參數改成 `true`，並確保網站跑 HTTPS
- SQLite 換成 PostgreSQL（把 `internal/db/db.go` 的 driver 換成 `gorm.io/driver/postgres`）
- `/api/register`、`/api/login` 加上 rate limit，避免暴力破解

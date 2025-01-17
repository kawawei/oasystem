# OA System

一個基於 Vue 3 和 Express 的辦公自動化系統。

## 系統要求

- Docker
- Docker Compose
- Node.js >= 18 (開發時需要)
- Git

## 本地開發

1. 克隆倉庫：
```bash
git clone git@github.com:kawawei/oasystem.git
cd oasystem
```

2. 複製環境變量文件：
```bash
cp .env.example .env
```

3. 修改 `.env` 文件中的配置

4. 啟動服務：
```bash
docker-compose up -d
```

5. 訪問：
- 前端：http://localhost:8081
- 後端：http://localhost:3000

## 生產環境部署

1. 在服務器上安裝必要軟件：
```bash
# 安裝 Docker
curl -fsSL https://get.docker.com | sh

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. 首次部署：
```bash
# 克隆倉庫
git clone [您的GitHub倉庫URL]
cd oasystem_mysql

# 設置環境變量
cp .env.example .env
nano .env  # 編輯生產環境配置

# 啟動服務
docker-compose up -d
```

3. 檢查服務狀態：
```bash
# 查看所有容器狀態
docker-compose ps

# 查看日誌
docker-compose logs
```

4. 訪問方式：
   - 通過域名：https://oasystem.lihengtech.com.tw（推薦，支持 SSL）
   - 通過 IP：http://[服務器IP]（不推薦）

## 環境變量說明

- `NODE_ENV`: 運行環境 (development/production)
- `DOMAIN`: 網站域名
- `FRONTEND_PORT`: 前端服務端口
- `BACKEND_PORT`: 後端服務端口
- `DB_*`: 數據庫相關配置
- `JWT_SECRET`: JWT 密鑰

## 目錄結構

```
.
├── web/                # 前端代碼
├── server/            # 後端代碼
├── mysql/             # 數據庫配置
├── docker-compose.yml # Docker 配置
├── deploy.sh          # 部署腳本
└── .env.example       # 環境變量範例
```

## 維護說明

### SSL 證書
- 證書會自動每月更新
- 可以通過 `certbot renew --dry-run` 測試更新

### 數據庫備份
建議定期備份數據庫：
```bash
docker-compose exec db mysqldump -u root -p oasystem > backup.sql
```

### 日誌查看
```bash
# 查看所有服務日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

## 安全建議

1. 在生產環境中：
   - 使用強密碼
   - 更改默認端口
   - 設置防火牆規則
   - 定期更新依賴包

2. 數據庫：
   - 定期備份
   - 使用強密碼
   - 限制遠程訪問

3. SSL/TLS：
   - 保持證書更新
   - 使用強加密套件
   - 啟用 HSTS

## 故障排除

1. 無法訪問網站：
   - 檢查服務狀態：`docker-compose ps`
   - 檢查日誌：`docker-compose logs`
   - 確認端口映射

2. 數據庫連接問題：
   - 檢查環境變量配置
   - 確認數據庫容器健康狀態
   - 檢查數據庫日誌

3. SSL 證書問題：
   - 檢查證書有效期：`certbot certificates`
   - 嘗試手動更新：`certbot renew`

## 更新說明

當需要更新系統時：

1. 在本地開發並測試：
```bash
# 提交更改
git add .
git commit -m "更新說明"
git push origin main
```

2. 在服務器上更新：
```bash
# 進入項目目錄
cd oasystem_mysql

# 拉取最新代碼
git pull origin main

# 重新部署
docker-compose down  # 停止當前服務
docker-compose up -d --build  # 重新構建並啟動服務
```

注意事項：
1. `.env` 文件不會被 git 更新，如有新增環境變量需手動更新
2. 使用 `--build` 參數確保新代碼被正確編譯
3. 每次更新後建議檢查服務狀態和日誌
4. 如果更新包含數據庫結構變化，請先備份數據

## 貢獻指南

1. Fork 本倉庫
2. 創建特性分支
3. 提交更改
4. 推送到分支
5. 創建 Pull Request

## 授權

[您的授權說明] 
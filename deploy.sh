#!/bin/bash

# 載入環境變量
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

echo "開始部署流程..."

# 檢查環境變量
if [ "$NODE_ENV" = "production" ]; then
    if [ -z "$DOMAIN" ]; then
        echo "錯誤：在生產環境中需要設置 DOMAIN 環境變量"
        exit 1
    fi
fi

# 停止所有運行中的容器
echo "停止現有容器..."
docker-compose down

# 刪除所有相關的容器和鏡像
echo "清理容器和鏡像..."
docker-compose rm -f
docker rmi $(docker images | grep 'oasystem' | awk '{print $3}') || true

# 清理 nginx 緩存（如果存在）
echo "清理 Nginx 緩存..."
if [ -d "/var/cache/nginx" ]; then
    sudo rm -rf /var/cache/nginx/*
fi

# 拉取最新的代碼
echo "拉取最新代碼..."
git fetch --all
git reset --hard origin/main  # 或你的主分支名稱

# 在生產環境中設置 SSL 證書
if [ "$NODE_ENV" = "production" ]; then
    echo "生產環境：設置 SSL 證書..."
    if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        echo "正在申請新的 SSL 證書..."
        certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email your-email@example.com
    else
        echo "更新現有的 SSL 證書..."
        certbot renew
    fi

    # 確保 SSL 證書目錄存在
    mkdir -p web/ssl
    cp -L /etc/letsencrypt/live/$DOMAIN/fullchain.pem web/ssl/
    cp -L /etc/letsencrypt/live/$DOMAIN/privkey.pem web/ssl/

    # 更新 nginx 配置中的域名
    echo "更新 Nginx 配置..."
    sed -i "s/server_name \${DOMAIN};/server_name $DOMAIN;/g" web/nginx.conf
fi

# 重新構建並啟動容器
echo "重新構建容器..."
docker-compose build --no-cache
echo "啟動服務..."
docker-compose up -d

# 清理未使用的鏡像和容器
echo "清理未使用的 Docker 資源..."
docker system prune -f

# 等待服務啟動
echo "等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "檢查服務狀態..."
docker-compose ps

# 檢查 nginx 配置
echo "檢查 Nginx 配置..."
FRONTEND_CONTAINER=$(docker-compose ps -q frontend)
if [ ! -z "$FRONTEND_CONTAINER" ]; then
    docker exec $FRONTEND_CONTAINER nginx -t
fi

# 在生產環境中設置 SSL 證書自動更新
if [ "$NODE_ENV" = "production" ]; then
    echo "設置 SSL 證書自動更新..."
    (crontab -l 2>/dev/null; echo "0 0 1 * * certbot renew --quiet && docker-compose restart frontend") | crontab -
fi

echo "部署完成！"
if [ "$NODE_ENV" = "production" ]; then
    echo "您的網站現在可以通過 https://$DOMAIN 訪問"
else
    echo "您的網站現在可以通過 http://localhost:8080 訪問"
fi
echo "請使用以下命令檢查服務日誌："
echo "docker-compose logs -f" 
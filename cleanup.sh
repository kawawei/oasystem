#!/bin/bash

echo "開始清理 Docker 環境..."

# 停止所有容器
echo "停止所有容器..."
docker-compose down

# 刪除所有相關容器
echo "刪除所有相關容器..."
docker rm -f $(docker ps -a | grep 'oasystem' | awk '{print $1}') || true

# 刪除所有相關鏡像
echo "刪除所有相關鏡像..."
docker rmi -f $(docker images | grep 'oasystem' | awk '{print $3}') || true

# 刪除所有相關卷
echo "刪除所有相關卷..."
docker volume rm $(docker volume ls -q | grep 'oasystem') || true

# 清理未使用的網絡
echo "清理未使用的網絡..."
docker network prune -f

# 清理系統
echo "清理系統..."
docker system prune -af

echo "清理完成！"

# 驗證清理結果
echo "當前運行的容器："
docker ps
echo "當前的 Docker 卷："
docker volume ls
echo "當前的 Docker 鏡像："
docker images 
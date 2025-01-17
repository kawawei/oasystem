FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 首先複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製源代碼
COPY . .

# 設置環境變數
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 啟動命令
CMD ["npm", "start"] 
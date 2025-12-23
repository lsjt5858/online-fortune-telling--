# ========== 后端构建阶段 ==========
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建
RUN npm run build

# ========== 后端生产阶段 ==========
FROM node:20-alpine

WORKDIR /app

# 复制 package.json 和构建产物
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8000

CMD ["npm", "run", "start:prod"]

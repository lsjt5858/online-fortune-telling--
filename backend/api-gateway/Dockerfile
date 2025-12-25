# ========== 后端构建阶段 ==========
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 shared 和 pkg 目录
COPY shared ./shared
COPY pkg ./pkg

# 切换到 api-gateway 目录
WORKDIR /app/api-gateway

# 复制 package.json 和 lock 文件
COPY api-gateway/package*.json ./

# 安装所有依赖（包括 devDependencies 用于构建）
RUN npm ci

# 创建符号链接让 shared 和 pkg 能访问 node_modules
RUN ln -sf /app/api-gateway/node_modules /app/shared/node_modules
RUN ln -sf /app/api-gateway/node_modules /app/pkg/node_modules

# 复制源代码和配置
COPY api-gateway/src ./src
COPY api-gateway/tsconfig.json ./
COPY api-gateway/nest-cli.json ./

# 构建
RUN npm run build

# ========== 后端生产阶段 ==========
FROM node:20-alpine

WORKDIR /app/api-gateway

# 复制 package.json
COPY api-gateway/package*.json ./

# 只安装生产依赖
RUN npm ci --omit=dev

# 复制构建产物
COPY --from=builder /app/api-gateway/dist ./dist

EXPOSE 8000

CMD ["npm", "run", "start:prod"]

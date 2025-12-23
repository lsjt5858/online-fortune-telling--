.PHONY: help dev dev:fe dev:be build up down restart clean install test lint

# 默认目标
help:
	@echo "神机妙算 - 开发命令"
	@echo ""
	@echo "开发命令:"
	@echo "  make dev         - 启动全部服务 (前端 + 后端 + 数据库)"
	@echo "  make dev:fe      - 只启动前端"
	@echo "  make dev:be      - 只启动后端"
	@echo ""
	@echo "构建命令:"
	@echo "  make build       - 构建全部项目"
	@echo "  make build:fe    - 只构建前端"
	@echo "  make build:be    - 只构建后端"
	@echo ""
	@echo "Docker 命令:"
	@echo "  make up          - 启动 Docker 服务"
	@echo "  make down        - 停止 Docker 服务"
	@echo "  make restart     - 重启 Docker 服务"
	@echo "  make clean       - 清理 Docker 资源"
	@echo ""
	@echo "安装命令:"
	@echo "  make install     - 安装全部依赖"
	@echo "  make install:fe  - 安装前端依赖"
	@echo "  make install:be  - 安装后端依赖"
	@echo ""
	@echo "其他命令:"
	@echo "  make test        - 运行测试"
	@echo "  make lint        - 代码检查"

# ========== 开发命令 ==========

dev: install
	@echo "启动全部服务..."
	docker-compose up

dev:fe:
	@echo "启动前端服务..."
	cd frontend && npm run dev

dev:be:
	@echo "启动后端服务..."
	docker-compose up postgres redis api-gateway

# ========== 构建命令 ==========

build:
	@echo "构建全部项目..."
	$(MAKE) build:fe
	$(MAKE) build:be

build:fe:
	@echo "构建前端..."
	cd frontend && npm run build

build:be:
	@echo "构建后端..."
	cd backend/api-gateway && npm run build

# ========== Docker 命令 ==========

up:
	@echo "启动 Docker 服务..."
	docker-compose up -d

down:
	@echo "停止 Docker 服务..."
	docker-compose down

restart:
	@echo "重启 Docker 服务..."
	docker-compose restart

clean:
	@echo "清理 Docker 资源..."
	docker-compose down -v
	docker system prune -f

# ========== 安装命令 ==========

install:
	$(MAKE) install:fe
	$(MAKE) install:be

install:fe:
	@echo "安装前端依赖..."
	cd frontend && npm install

install:be:
	@echo "安装后端依赖..."
	cd backend/api-gateway && npm install

# ========== 其他命令 ==========

test:
	@echo "运行测试..."
	cd frontend && npm run test
	cd backend/api-gateway && npm run test

lint:
	@echo "代码检查..."
	cd frontend && npm run lint
	cd backend/api-gateway && npm run lint

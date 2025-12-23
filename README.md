# 神机妙算 - 企业级在线算命平台

> 专业的在线算命平台，提供八字排盘、奇门遁甲、八卦测算、梅花易数等服务

## 项目简介

神机妙算是一个企业级在线算命平台，服务 C 端用户群体。项目采用前后端分离架构，支持多端访问（H5、小程序、App）。

### 核心功能

- **八字排盘** - 基于生辰八字，解析命运走势
- **奇门遁甲** - 中国古代最高预测学
- **八卦测算** - 易经八卦，洞察天地玄机
- **梅花易数** - 宋代邵雍所传，占卜灵验

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite
- UnoCSS
- Pinia
- Vue Router
- Axios
- Vant (移动端组件)

### 后端
- NestJS
- TypeScript
- PostgreSQL
- Redis
- Docker

## 项目结构

```
online-fortune-telling-神机妙算/
├── frontend/              # 前端项目 (Vue 3)
│   ├── src/
│   │   ├── components/   # 公共组件
│   │   ├── views/        # 页面视图
│   │   ├── stores/       # 状态管理
│   │   ├── router/       # 路由配置
│   │   ├── api/          # API 接口层
│   │   ├── utils/        # 工具函数
│   │   └── types/        # TypeScript 类型
│   ├── package.json
│   └── vite.config.ts
│
├── backend/              # 后端项目
│   ├── api-gateway/      # API 网关
│   ├── services/         # 业务服务
│   ├── shared/           # 共享代码
│   └── pkg/              # 公共包
│
├── infrastructure/       # 基础设施
│   ├── docker/
│   ├── kubernetes/
│   └── nginx/
│
├── docs/                 # 文档
│   ├── architecture/     # 架构文档
│   └── development.md    # 开发文档
│
├── docker-compose.yml    # Docker Compose 配置
├── Makefile             # 快捷命令
└── README.md            # 项目说明
```

## 快速开始

### 环境要求

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 20 | JavaScript 运行时 |
| pnpm | >= 8 | 包管理器 (自动安装) |
| Docker Desktop | 最新版 | 容器化服务 |

### 1. 安装依赖

```bash
# 安装全部依赖（前端 + 后端）
make install
```

**或分步安装：**
```bash
# 安装前端依赖
cd frontend && pnpm install

# 安装后端依赖
cd backend/api-gateway && npm install
```

### 2. 启动 Docker 服务

Docker 服务用于运行 PostgreSQL 和 Redis：

```bash
# 启动 Docker 服务
make up
```

**检查服务状态：**
```bash
docker ps
```

应该看到以下容器运行中：
- `shenji-miaosuan-postgres` (PostgreSQL 数据库)
- `shenji-miaosuan-redis` (Redis 缓存)

### 3. 启动开发服务器

#### 方式一：启动全部服务（推荐）

```bash
make dev
```

这会同时启动前端和后端服务。

#### 方式二：分别启动

```bash
# 终端 1：启动前端服务
make dev:fe

# 终端 2：启动后端服务
make dev:be
```

### 4. 访问应用

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost:3000/ | Vue 3 前端页面 |
| 后端 API | http://localhost:8000/ | NestJS API 服务 |
| API 健康检查 | http://localhost:8000/api/health | 服务状态检查 |

## 开发命令

### 安装命令

| 命令 | 说明 |
|------|------|
| `make install` | 安装全部依赖 |
| `make install:fe` | 只安装前端依赖 |
| `make install:be` | 只安装后端依赖 |

### 开发命令

| 命令 | 说明 |
|------|------|
| `make dev` | 启动全部服务（前端 + 后端） |
| `make dev:fe` | 只启动前端服务 |
| `make dev:be` | 只启动后端服务（含数据库） |

### 构建命令

| 命令 | 说明 |
|------|------|
| `make build` | 构建全部项目 |
| `make build:fe` | 只构建前端 |
| `make build:be` | 只构建后端 |

### Docker 命令

| 命令 | 说明 |
|------|------|
| `make up` | 启动 Docker 服务 |
| `make down` | 停止 Docker 服务 |
| `make restart` | 重启 Docker 服务 |
| `make clean` | 清理 Docker 资源 |

### 其他命令

| 命令 | 说明 |
|------|------|
| `make test` | 运行测试 |
| `make lint` | 代码检查 |

## 可用接口

### 健康检查

```bash
curl http://localhost:8000/api/health
```

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/sms/send` | 发送短信验证码 |
| POST | `/api/v1/auth/login/phone` | 手机号登录 |
| POST | `/api/v1/auth/login/wechat` | 微信登录 |
| POST | `/api/v1/auth/logout` | 登出 |
| POST | `/api/v1/auth/refresh` | 刷新令牌 |

更多接口文档请查看 [docs/development.md](docs/development.md)

## 停止服务

```bash
# 停止 Docker 服务
make down

# 停止前端/后端服务
# 在运行服务的终端按 Ctrl + C
```

## 文档

| 文档 | 说明 |
|------|------|
| [docs/architecture/enterprise-architecture.md](docs/architecture/enterprise-architecture.md) | 企业级架构设计文档 |
| [docs/development.md](docs/development.md) | 开发文档（接口、命令、开发计划） |

## 开发计划

### Phase 1: 基础框架 ✅
- [x] 前后端项目初始化
- [x] 基础组件库搭建
- [x] 开发环境配置

### Phase 2: 核心功能（进行中）
- [ ] 用户系统（注册登录）
- [ ] 占卜算法实现
- [ ] VIP 会员系统
- [ ] 订单支付系统

### Phase 3: 优化上线
- [ ] 性能优化
- [ ] 安全加固
- [ ] 监控告警
- [ ] 部署上线

## 常见问题

### Q: Docker 服务启动失败？
**A:** 确保 Docker Desktop 已启动，运行 `docker info` 检查状态

### Q: 前端页面无法访问后端接口？
**A:** 检查后端服务是否正常运行，访问 http://localhost:8000/api/health

### Q: 数据库连接失败？
**A:** 确保 PostgreSQL 容器正在运行：`docker ps | grep postgres`

### Q: 端口被占用？
**A:** 修改 `frontend/vite.config.ts` 和 `backend/api-gateway/.env.development` 中的端口配置

## 贡献指南

欢迎提交 Issue 和 Pull Request。

### 开发规范
- 代码风格：ESLint + Prettier
- 提交前运行：`make lint`
- 分支管理：`main` / `develop` / `feature/*`

## 许可证

MIT License

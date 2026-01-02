# 神机妙算 - 在线算命平台

> 专业的在线算命平台，提供八字排盘、奇门遁甲、八卦测算、梅花易数等服务

## 项目简介

神机妙算是一个在线算命平台，服务 C 端用户群体。项目采用前后端分离架构，支持多端访问（H5、小程序、App）。

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
- Vant (移动端组件)

### 后端
- NestJS + TypeScript
- PostgreSQL
- Redis
- Docker

## 项目结构

```
├── frontend/              # 前端项目 (Vue 3)
│   ├── src/
│   │   ├── components/    # 公共组件
│   │   ├── views/         # 页面视图
│   │   ├── stores/        # 状态管理
│   │   ├── router/        # 路由配置
│   │   ├── api/           # API 接口层
│   │   ├── composables/   # 组合式函数
│   │   ├── utils/         # 工具函数
│   │   └── types/         # TypeScript 类型
│   └── vite.config.ts
│
├── backend/               # 后端项目
│   ├── api-gateway/       # API 网关 (NestJS)
│   ├── services/          # 业务服务
│   ├── shared/            # 共享代码
│   └── migrations/        # 数据库迁移
│
├── infrastructure/        # 基础设施配置
│   ├── docker/
│   ├── kubernetes/
│   └── nginx/
│
├── docs/                  # 项目文档
├── scripts/               # 脚本文件
├── docker-compose.yml     # Docker Compose 配置
└── Makefile               # 快捷命令
```

## 快速启动

### 环境要求

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | >= 20 | JavaScript 运行时 |
| Docker Desktop | 最新版 | 容器化服务 |

### 方式一：Docker 一键启动（推荐）

```bash
# 启动所有服务（后台运行）
make up

# 查看服务状态
docker-compose ps
```

### 方式二：开发模式启动

```bash
# 安装依赖并启动（前台运行，可查看日志）
make dev
```

### 方式三：分开启动

```bash
# 终端 1：启动后端服务（含 PostgreSQL、Redis）
make dev-be

# 终端 2：启动前端服务
make dev-fe
```

### 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端应用 | http://localhost | Vue 3 前端页面 |
| 后端 API | http://localhost:8000 | NestJS API 服务 |
| PostgreSQL | localhost:5432 | 数据库 |
| Redis | localhost:6379 | 缓存 |

## 开发命令

运行 `make help` 查看所有可用命令：

### 开发命令

| 命令 | 说明 |
|------|------|
| `make dev` | 启动全部服务（前端 + 后端 + 数据库） |
| `make dev-fe` | 只启动前端服务 |
| `make dev-be` | 只启动后端服务 |

### Docker 命令

| 命令 | 说明 |
|------|------|
| `make up` | 启动 Docker 服务（后台运行） |
| `make down` | 停止 Docker 服务 |
| `make restart` | 重启 Docker 服务 |
| `make clean` | 清理 Docker 资源 |

### 构建命令

| 命令 | 说明 |
|------|------|
| `make build` | 构建全部项目 |
| `make build-fe` | 只构建前端 |
| `make build-be` | 只构建后端 |

### 安装命令

| 命令 | 说明 |
|------|------|
| `make install` | 安装全部依赖 |
| `make install-fe` | 安装前端依赖 |
| `make install-be` | 安装后端依赖 |

### 其他命令

| 命令 | 说明 |
|------|------|
| `make test` | 运行测试 |
| `make lint` | 代码检查 |

## API 接口

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

# 停止前台运行的服务
# 在终端按 Ctrl + C
```

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

### Docker 服务启动失败？

确保 Docker Desktop 已启动：
```bash
docker info
```

### 端口被占用？

查看占用端口的进程：
```bash
lsof -i :80
lsof -i :8000
```

### 前端无法访问后端接口？

检查后端服务是否正常运行：
```bash
curl http://localhost:8000/api/health
```

### 数据库连接失败？

确保 PostgreSQL 容器正在运行：
```bash
docker ps | grep postgres
```

## 相关文档

- [开发文档](docs/development.md)
- [架构设计](docs/architecture/)
- [部署指南](docs/deployment/)
- [支付配置](docs/payment-config-guide.md)

## 贡献指南

### 开发规范
- 代码风格：ESLint + Prettier
- 提交前运行：`make lint`
- 分支管理：`main` / `develop` / `feature/*`

## License

MIT

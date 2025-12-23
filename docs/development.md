# 神机妙算 - 开发文档

> 更新时间：2025-12-23

## 服务运行状态

| 服务 | 状态 | 地址 | 说明 |
|------|------|------|------|
| 前端 (Vue 3) | ✅ 运行中 | http://localhost:3000/ | Vite 开发服务器 |
| 后端 API 网关 (NestJS) | ✅ 运行中 | http://localhost:8000/ | API 服务 |
| PostgreSQL | ✅ 运行中 | localhost:5432 | 数据库 |
| Redis | ✅ 运行中 | localhost:6379 | 缓存 |

## 可用接口

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 服务健康检查 |

**响应示例：**
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T05:52:17.000Z",
  "service": "api-gateway"
}
```

### 认证接口

| 方法 | 路径 | 说明 | 是否需要认证 |
|------|------|------|-------------|
| POST | `/api/v1/auth/sms/send` | 发送短信验证码 | 否 |
| POST | `/api/v1/auth/login/phone` | 手机号登录 | 否 |
| POST | `/api/v1/auth/login/wechat` | 微信登录 | 否 |
| POST | `/api/v1/auth/logout` | 登出 | 是 |
| POST | `/api/v1/auth/refresh` | 刷新令牌 | 否 |

**发送验证码请求：**
```json
{
  "phone": "13800138000"
}
```

**发送验证码响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "expireIn": 300
  },
  "timestamp": 1734904337000
}
```

**手机号登录请求：**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**手机号登录响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "userInfo": {
      "id": "1",
      "phone": "13800138000",
      "nickname": "用户",
      "avatar": "",
      "vipLevel": 0,
      "vipExpireAt": null,
      "points": 0,
      "createdAt": "2025-12-23T00:00:00.000Z"
    }
  },
  "timestamp": 1734904337000
}
```

## 快捷命令

### 开发命令

| 命令 | 说明 |
|------|------|
| `make dev` | 启动全部服务 (前端 + 后端 + 数据库) |
| `make dev:fe` | 只启动前端服务 |
| `make dev:be` | 只启动后端服务 (含数据库) |
| `make install` | 安装全部依赖 |
| `make install:fe` | 只安装前端依赖 |
| `make install:be` | 只安装后端依赖 |

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

## 下一步开发建议

### Phase 1: 核心功能实现

#### 1.1 用户认证系统
- [ ] 实现 JWT Token 生成与验证
- [ ] 实现短信验证码发送（对接阿里云/腾讯云）
- [ ] 实现微信登录（对接微信开放平台）
- [ ] 实现用户注册/登录完整流程
- [ ] 添加 Refresh Token 机制

**相关文件：**
- `backend/api-gateway/src/controllers/auth.controller.ts`
- `backend/api-gateway/src/guards/auth.guard.ts`
- `backend/shared/utils/index.ts` (generateToken)

#### 1.2 数据库设计与 ORM
- [ ] 设计数据库表结构
- [ ] 创建 TypeORM/Prisma 实体模型
- [ ] 实现数据库迁移脚本

**核心表：**
- users (用户表)
- divination_records (占卜记录表)
- orders (订单表)
- payments (支付表)
- vip_memberships (VIP会员表)
- user_points (积分表)

#### 1.3 占卜算法实现
- [ ] **八字排盘算法**
  - 天干地支计算
  - 五行分析
  - 十神分析
  - 大运流年计算

- [ ] **奇门遁甲算法**
  - 起局方法
  - 格局分析
  - 吉凶判断

- [ ] **八卦测算算法**
  - 起卦方法
  - 卦象分析
  - 解卦规则

- [ ] **梅花易数算法**
  - 数字起卦
  - 体用互卦分析
  - 断卦方法

**相关文件：**
- `backend/services/divination-service/src/algorithms/`

### Phase 2: 业务功能

#### 2.1 VIP 会员系统
- [ ] VIP 权益配置
- [ ] 会员购买流程
- [ ] 会员到期处理
- [ ] VIP 专属功能

#### 2.2 订单支付系统
- [ ] 订单创建逻辑
- [ ] 对接微信支付
- [ ] 对接支付宝
- [ ] 支付回调处理
- [ ] 订单状态管理

#### 2.3 内容管理系统
- [ ] 文章发布功能
- [ ] 分类管理
- [ ] 评论系统
- [ ] 搜索功能

#### 2.4 营销活动系统
- [ ] 优惠券系统
- [ ] 积分系统
- [ ] 邀请奖励
- [ ] 拼团功能

### Phase 3: 优化与上线

#### 3.1 性能优化
- [ ] 接口缓存优化
- [ ] 数据库查询优化
- [ ] 前端打包优化
- [ ] CDN 部署

#### 3.2 安全加固
- [ ] 接口签名验证
- [ ] 敏感数据加密
- [ ] SQL 注入防护
- [ ] XSS 防护

#### 3.3 监控告警
- [ ] 服务监控（Prometheus + Grafana）
- [ ] 日志收集（ELK Stack）
- [ ] 错误追踪（Sentry）
- [ ] 性能监控（APM）

#### 3.4 部署上线
- [ ] 编写 Docker Compose 生产配置
- [ ] 编写 Kubernetes 部署文件
- [ ] 配置 CI/CD 流程
- [ ] 域名备案与 SSL 证书

## 开发规范

### 代码风格
- 前端：ESLint + Prettier
- 后端：ESLint + Prettier
- 提交前务必运行 `make lint`

### 分支管理
- `main` - 生产环境分支
- `develop` - 开发环境分支
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/工具链相关
```

## 环境变量说明

### 后端环境变量 (.env.development)
```bash
NODE_ENV=development
PORT=8000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=shenji_miaosuan

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=shenji-miaosuan-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=*
```

### 前端环境变量 (.env)
```bash
VITE_API_BASE_URL=/api
```

## 常见问题

### Q: Docker 服务启动失败？
A: 确保 Docker Desktop 已启动，运行 `docker info` 检查状态

### Q: 前端页面无法访问后端接口？
A: 检查后端服务是否正常运行，查看 `vite.config.ts` 中的代理配置

### Q: 数据库连接失败？
A: 确保 PostgreSQL 容器正在运行：`docker ps | grep postgres`

### Q: Redis 连接失败？
A: 确保 Redis 容器正在运行：`docker ps | grep redis`

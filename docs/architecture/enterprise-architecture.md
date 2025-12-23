# 神机妙算 - 企业级架构设计文档

> 项目概述：在线算命平台，服务 C 端用户群体
> 创建时间：2025-12-23
> 版本：v1.0

---

## 一、当前项目分析

### 1.1 项目现状

| 项目属性 | 说明 |
|---------|------|
| 项目类型 | 静态前端网站 |
| 技术栈 | HTML + Tailwind CSS + Vanilla JavaScript |
| 架构模式 | 多页面架构 (MPA) |
| 核心功能 | 八字排盘、奇门遁甲、八卦测算、梅花易数 |

### 1.2 现有文件结构

```
online-fortune-telling-神机妙算/
├── index.html          # 首页
├── input.html          # 输入页
├── result.html         # 结果页
├── knowledge.html      # 知识页
└── help.html           # 帮助页
```

### 1.3 改造目标

- 从静态网站升级为完整的前后端分离架构
- 支持多端访问（H5、小程序、App）
- 引入用户系统、支付系统、订单系统
- 支持高并发、高可用的企业级需求

---

## 二、整体架构设计

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端层                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  H5/Web App │  │   小程序     │  │   App (RN)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    API 网关层 (Nginx + Gateway)             │
│         (鉴权、限流、路由、日志、负载均衡)                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      业务服务层                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 用户服务 │ │ 占卜服务 │ │ 订单服务 │ │ 支付服务 │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 内容服务 │ │ 营销服务 │ │ 消息服务 │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                              │
│  MySQL + Redis + MongoDB + OSS                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈选型

| 层级 | 技术选择 | 说明 |
|------|---------|------|
| 前端框架 | Vue 3 + TypeScript | 生态成熟，适合 C 端 |
| 构建工具 | Vite | 极速开发体验 |
| UI 组件 | UnoCSS + Vant | 移动端优先 |
| 状态管理 | Pinia | Vue 官方推荐 |
| HTTP 客户端 | Axios | 成熟稳定 |
| 后端框架 | NestJS | 企业级 Node 框架 |
| ORM | TypeORM / Prisma | 类型安全 |
| 数据库 | PostgreSQL + Redis | 关系型 + 缓存 |
| 消息队列 | RabbitMQ | 异步处理 |
| 对象存储 | 阿里云 OSS / 腾讯云 COS | 文件存储 |
| 容器化 | Docker + K8s | 部署运维 |

---

## 三、目录结构设计

```
online-fortune-telling-enterprise/
├── frontend/                      # 前端项目 (Vue 3 + TypeScript + Vite)
│   ├── src/
│   │   ├── assets/               # 静态资源
│   │   ├── components/           # 公共组件
│   │   │   ├── common/          # 通用组件 (Button, Modal等)
│   │   │   ├── business/        # 业务组件 (FortuneCard, ResultCard等)
│   │   │   └── charts/          # 图表组件
│   │   ├── views/               # 页面视图
│   │   │   ├── home/            # 首页
│   │   │   ├── divination/      # 占卜相关
│   │   │   │   ├── bazi/        # 八字
│   │   │   │   ├── qimen/       # 奇门遁甲
│   │   │   │   ├── bagua/       # 八卦
│   │   │   │   └── meihua/      # 梅花易数
│   │   │   ├── result/          # 结果页
│   │   │   ├── user/            # 用户中心
│   │   │   └── knowledge/       # 知识库
│   │   ├── stores/              # 状态管理 (Pinia)
│   │   ├── router/              # 路由配置
│   │   ├── api/                 # API 接口层
│   │   ├── composables/         # 组合式函数
│   │   ├── utils/               # 工具函数
│   │   ├── styles/              # 样式文件
│   │   └── types/               # TypeScript 类型
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── admin/                        # 管理后台 (Vue 3 + Element Plus)
│   └── (类似结构)
│
├── backend/                      # 后端项目
│   ├── api-gateway/              # API 网关
│   │   ├── src/
│   │   │   ├── middlewares/     # 中间件
│   │   │   ├── routes/          # 路由
│   │   │   └── utils/           # 工具
│   │   └── package.json
│   │
│   ├── services/                 # 业务服务
│   │   ├── user-service/        # 用户服务
│   │   ├── divination-service/  # 占卜服务 (核心)
│   │   ├── order-service/       # 订单服务
│   │   ├── payment-service/     # 支付服务
│   │   ├── content-service/     # 内容服务
│   │   ├── marketing-service/   # 营销服务
│   │   └── notification-service/# 消息服务
│   │
│   ├── shared/                   # 共享代码
│   │   ├── types/               # 共享类型
│   │   ├── constants/           # 常量
│   │   ├── utils/               # 工具函数
│   │   └── config/              # 配置
│   │
│   └── pkg/                      # 公共包
│       ├── cache/               # 缓存封装
│       ├── database/            # 数据库封装
│       ├── logger/              # 日志封装
│       ├── middleware/          # 公共中间件
│       └── queue/               # 消息队列
│
├── infrastructure/               # 基础设施
│   ├── docker/                  # Docker 配置
│   ├── kubernetes/              # K8s 配置
│   ├── nginx/                   # Nginx 配置
│   └── terraform/               # IaC 配置
│
├── mobile/                       # 移动端
│   ├── miniprogram/             # 微信小程序
│   └── app/                     # React Native / Flutter
│
├── docs/                         # 文档
│   ├── api/                     # API 文档
│   ├── architecture/            # 架构文档
│   └── deployment/              # 部署文档
│
├── scripts/                      # 脚本
│   ├── deploy.sh
│   └── build.sh
│
├── .github/                      # GitHub 配置
│   └── workflows/               # CI/CD
│
├── docker-compose.yml            # 本地开发
├── Makefile                      # 快捷命令
└── README.md
```

---

## 四、核心功能模块

### 4.1 用户模块

| 功能 | 描述 |
|------|------|
| 注册/登录 | 手机号 + 验证码、微信一键登录 |
| 个人中心 | 用户信息、会员状态、积分余额 |
| VIP 会员 | 会员等级、权益管理、续费 |
| 积分系统 | 积分获取、消耗、过期 |

### 4.2 占卜模块（核心）

| 功能 | 描述 |
|------|------|
| 免费测算 | 每日限额 1 次，基础结果 |
| VIP 深度测算 | 完整解析，详细批注 |
| 历史记录 | 查看过往测算记录 |
| 分享功能 | 生成海报，社交分享 |

### 4.3 订单模块

| 功能 | 描述 |
|------|------|
| 创建订单 | 测算服务购买 |
| 订单支付 | 微信支付、支付宝 |
| 订单状态 | 待支付、已完成、已退款 |
| 退款处理 | 自动退款、人工审核 |

### 4.4 内容模块

| 功能 | 描述 |
|------|------|
| 知识文章 | 易经、八字、风水知识 |
| 视频讲解 | 专家视频解读 |
| SEO 优化 | 搜索引擎优化 |

### 4.5 营销模块

| 功能 | 描述 |
|------|------|
| 优惠券 | 满减券、折扣券、兑换券 |
| 拼团 | 多人优惠购买 |
| 邀请奖励 | 邀请好友获得积分 |
| 活动管理 | 节日、限时活动 |

### 4.6 数据分析

| 功能 | 描述 |
|------|------|
| 用户行为埋点 | PV/UV、页面停留时长 |
| 转化漏斗 | 访问→注册→付费转化 |
| 收入统计 | 日/月/年收入分析 |

---

## 五、数据库设计

### 5.1 核心表结构

```sql
-- 用户表
users (id, phone, openid, nickname, avatar, vip_level, points, created_at)

-- 占卜记录表
divination_records (id, user_id, type, input_data, result_data, is_vip, created_at)

-- 订单表
orders (id, order_no, user_id, service_id, amount, status, created_at)

-- 支付表
payments (id, order_id, payment_no, channel, status, paid_at)

-- 会员表
vip_memberships (id, user_id, level, expire_at)

-- 积分表
user_points (id, user_id, amount, source, expires_at)
```

### 5.2 Redis 缓存设计

| Key | 类型 | TTL | 说明 |
|-----|------|-----|------|
| user:info:{userId} | Hash | 1h | 用户信息缓存 |
| user:token:{token} | String | 7d | 登录令牌 |
| divination:daily:{userId}:{date} | String | 1d | 每日免费次数 |
| sms:code:{phone} | String | 5m | 验证码 |

---

## 六、API 设计规范

### 6.1 RESTful API 规范

```
POST   /api/v1/auth/register        # 用户注册
POST   /api/v1/auth/login           # 用户登录
POST   /api/v1/auth/refresh         # 刷新令牌

GET    /api/v1/user/profile         # 获取个人信息
PUT    /api/v1/user/profile         # 更新个人信息

GET    /api/v1/divination/types     # 获取占卜类型列表
POST   /api/v1/divination/calculate # 执行占卜计算
GET    /api/v1/divination/history   # 获取历史记录

POST   /api/v1/orders/create        # 创建订单
POST   /api/v1/orders/{id}/pay      # 支付订单
GET    /api/v1/orders               # 订单列表

GET    /api/v1/content/articles     # 文章列表
GET    /api/v1/content/articles/:id # 文章详情
```

### 6.2 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1703308800000
}
```

---

## 七、安全设计

### 7.1 安全措施

| 措施 | 说明 |
|------|------|
| JWT 认证 | 用户身份验证 |
| 接口签名 | 请求参数防篡改 |
| 限流降级 | 防止恶意请求 |
| 敏感加密 | 手机号、身份证加密 |
| SQL 注入防护 | 参数化查询 |

### 7.2 隐私合规

- 用户协议与隐私政策
- 手机号脱敏展示
- 数据删除权
- 数据最小化采集

---

## 八、部署方案

### 8.1 开发环境

```bash
make dev        # 启动全部服务
make dev:fe     # 只启动前端
make dev:be     # 只启动后端
```

### 8.2 生产环境

```
                    ┌─────────────┐
                    │   CDN/DNS   │
                    └──────┬──────┘
                           ↓
              ┌────────────────────────┐
              │      SLB 负载均衡       │
              └────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌───────────────┐                    ┌───────────────┐
│  K8s Cluster  │                    │  RDS MongoDB  │
│  ├─ Frontend  │                    │  Redis        │
│  ├─ Gateway   │                    │  OSS          │
│  └─ Services  │                    └───────────────┘
└───────────────┘
```

### 8.3 监控告警

- 服务监控：Prometheus + Grafana
- 日志收集：ELK Stack
- 错误追踪：Sentry
- 性能监控：APM

---

## 九、开发计划

### 9.1 第一阶段：基础框架（当前）

- [x] 架构设计文档
- [ ] 前后端项目初始化
- [ ] 基础组件库搭建
- [ ] 公共工具函数

### 9.2 第二阶段：核心功能

- [ ] 用户系统（注册登录）
- [ ] 占卜算法迁移
- [ ] 结果展示优化

### 9.3 第三阶段：商业功能

- [ ] VIP 会员系统
- [ ] 订单支付系统
- [ ] 营销活动系统

### 9.4 第四阶段：优化上线

- [ ] 性能优化
- [ ] 安全加固
- [ ] 监控告警
- [ ] 正式部署

---

## 十、参考资源

- [NestJS 官方文档](https://nestjs.com/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [微服务架构设计模式](https://microservices.io/patterns/microservices.html)

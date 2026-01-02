# 订单支付系统 API 文档

## 概述

订单支付系统提供完整的订单管理和支付功能，支持微信支付和支付宝两种支付渠道。

## 订单接口

### 创建订单
```
POST /api/v1/order/create
Authorization: Bearer {token}
```

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| serviceType | string | 是 | 服务类型：vip/divination/consultation |
| serviceId | string | 是 | 服务ID（如VIP等级：1/2/3） |
| amount | number | 否 | 订单金额（分），不传则自动计算 |

响应示例：
```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "orderNo": "ORD1704182400001234",
    "serviceType": "vip",
    "serviceId": "1",
    "serviceName": "月度会员",
    "amount": 2800,
    "amountYuan": "28.00",
    "status": "pending",
    "statusText": "待支付",
    "expiredAt": "2026-01-02T11:00:00.000Z",
    "isExpired": false,
    "createdAt": "2026-01-02T10:30:00.000Z"
  }
}
```

### 获取订单详情
```
GET /api/v1/order/:orderId
Authorization: Bearer {token}
```

### 根据订单号获取订单
```
GET /api/v1/order/no/:orderNo
Authorization: Bearer {token}
```

### 获取用户订单列表
```
GET /api/v1/order?page=1&pageSize=10&status=pending
Authorization: Bearer {token}
```

查询参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| status | string | 否 | 订单状态过滤 |

### 取消订单
```
POST /api/v1/order/:orderId/cancel
Authorization: Bearer {token}
```

## 支付接口

### 创建支付
```
POST /api/v1/payment/create
Authorization: Bearer {token}
```

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderNo | string | 是 | 订单号 |
| channel | string | 是 | 支付渠道：wechat/alipay |
| platform | string | 是 | 支付平台：app/h5/jsapi |
| openid | string | 否 | 微信小程序支付必填 |

响应示例（微信APP支付）：
```json
{
  "code": 0,
  "data": {
    "paymentId": "PAY1704182400001234",
    "channel": "wechat",
    "platform": "app",
    "prepayId": "wx...",
    "paySign": "...",
    "timestamp": "1704182400",
    "nonceStr": "..."
  }
}
```

响应示例（支付宝H5支付）：
```json
{
  "code": 0,
  "data": {
    "paymentId": "PAY1704182400001234",
    "channel": "alipay",
    "platform": "h5",
    "payUrl": "https://openapi.alipay.com/..."
  }
}
```

### 查询支付状态
```
GET /api/v1/payment/status/:paymentId
Authorization: Bearer {token}
```

响应示例：
```json
{
  "code": 0,
  "data": {
    "paymentId": "PAY1704182400001234",
    "orderId": "uuid",
    "orderNo": "ORD1704182400001234",
    "channel": "wechat",
    "channelText": "微信支付",
    "amount": 2800,
    "amountYuan": "28.00",
    "status": "success",
    "statusText": "支付成功",
    "paidAt": "2026-01-02T10:35:00.000Z",
    "createdAt": "2026-01-02T10:30:00.000Z"
  }
}
```

### 获取支付记录列表
```
GET /api/v1/payment/list?page=1&pageSize=10
Authorization: Bearer {token}
```

### 关闭支付订单
```
POST /api/v1/payment/close/:paymentId
Authorization: Bearer {token}
```

### 申请退款
```
POST /api/v1/payment/refund
Authorization: Bearer {token}
```

请求参数：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderNo | string | 是 | 订单号 |
| refundAmount | number | 是 | 退款金额（分） |
| reason | string | 否 | 退款原因 |

## 支付回调接口（公开）

### 支付宝回调
```
POST /api/v1/payment/alipay/notify
```

### 微信支付回调
```
POST /api/v1/payment/wechat/notify
```

## 订单状态说明

| 状态 | 说明 |
|------|------|
| pending | 待支付 |
| paid | 已支付 |
| completed | 已完成 |
| refunded | 已退款 |
| expired | 已过期 |
| cancelled | 已取消 |

## 支付状态说明

| 状态 | 说明 |
|------|------|
| pending | 待支付 |
| success | 支付成功 |
| failed | 支付失败 |
| refunded | 已退款 |
| closed | 已关闭 |

## 支付流程

1. 用户选择服务 → 调用创建订单接口
2. 获取订单信息 → 调用创建支付接口
3. 前端调起支付 → 用户完成支付
4. 支付平台回调 → 系统更新订单状态
5. 前端轮询支付状态 → 展示支付结果

## 注意事项

- 订单默认30分钟过期
- VIP订单支付成功后自动激活
- 退款金额不能超过订单金额
- 只有待支付状态的订单可以取消

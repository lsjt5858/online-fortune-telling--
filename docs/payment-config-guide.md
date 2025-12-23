# 支付功能配置指南

## 概述

本文档说明如何配置支付宝和微信支付功能，以便您能够收款。

---

## 一、支付宝支付配置

### 1.1 注册与开通

1. **注册支付宝开放平台账号**
   - 访问：https://open.alipay.com
   - 使用支付宝账号登录
   - 完成企业认证（个人开发者可申请沙箱环境）

2. **创建应用**
   - 进入控制台 → 网页&移动应用
   - 创建应用，选择类型（APP、H5等）
   - 获得 **APPID**（如：2021001234567890）

### 1.2 生成密钥对

1. **下载密钥生成工具**
   - 访问：https://opendocs.alipay.com/common/02kipl
   - 下载"支付宝开放平台开发助手"

2. **生成RSA2密钥**
   ```bash
   # 使用工具生成，或使用命令行：
   openssl genrsa -out app_private_key.pem 2048
   openssl rsa -in app_private_key.pem -pubout -out app_public_key.pem
   ```

3. **上传公钥到支付宝**
   - 应用详情 → 开发信息 → 接口加签方式
   - 选择"公钥"模式
   - 上传您的应用公钥（app_public_key.pem内容）
   - 获取支付宝公钥（保存下来）

### 1.3 配置回调地址

在应用设置中配置：
- **授权回调地址**：https://yourdomain.com/callback
- **异步通知地址**：https://yourdomain.com/api/v1/payment/alipay/notify

### 1.4 申请支付权限

在应用中开通以下功能：
- ✅ **App支付**（alipay.trade.app.pay）
- ✅ **手机网站支付**（alipay.trade.wap.pay）
- ✅ **当面付**（可选）

### 1.5 配置参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `ALIPAY_APP_ID` | 应用APPID | 2021001234567890 |
| `ALIPAY_PRIVATE_KEY` | 您的应用私钥（去掉头尾） | MIIEvQIBADAN... |
| `ALIPAY_PUBLIC_KEY` | 支付宝公钥（去掉头尾） | MIIBIjANBgkq... |
| `ALIPAY_NOTIFY_URL` | 异步回调地址 | https://yourdomain.com/api/v1/payment/alipay/notify |

**收款账户**：用户支付的钱会直接到您注册的支付宝账号

---

## 二、微信支付配置

### 2.1 注册与开通

1. **注册微信商户平台**
   - 访问：https://pay.weixin.qq.com
   - 提交企业资料进行审核
   - 获得**商户号**（如：1234567890）

2. **获取微信AppID**
   - 如果是APP支付：在微信开放平台注册应用
   - 如果是小程序：在小程序后台查看AppID
   - 如果是公众号：在公众号后台查看AppID

### 2.2 配置API密钥

1. **设置APIv3密钥**
   - 登录商户平台
   - 账户中心 → API安全 → 设置APIv3密钥
   - 设置32位字符串（保存好）

2. **下载商户证书**
   - 账户中心 → API安全 → 申请API证书
   - 下载证书文件（apiclient_key.pem 即商户私钥）
   - 查看证书序列号

### 2.3 配置回调地址

在产品中心 → 开发配置 → 支付配置：
- **支付回调URL**：https://yourdomain.com/api/v1/payment/wechat/notify

### 2.4 配置参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `WECHAT_APP_ID` | 微信AppID | wx1234567890abcdef |
| `WECHAT_MCH_ID` | 商户号 | 1234567890 |
| `WECHAT_API_V3_KEY` | APIv3密钥 | 32位字符串 |
| `WECHAT_PRIVATE_KEY` | 商户私钥 | apiclient_key.pem内容（去掉头尾） |
| `WECHAT_SERIAL_NO` | 证书序列号 | 在商户平台查看 |
| `WECHAT_NOTIFY_URL` | 支付回调地址 | https://yourdomain.com/api/v1/payment/wechat/notify |

**收款账户**：用户支付的钱会到您的微信商户账号，需绑定银行卡提现

---

## 三、配置文件设置

### 3.1 创建配置文件

在 `backend/api-gateway/` 目录下创建：

**开发环境**：`.env.development`
**生产环境**：`.env.production`

### 3.2 配置内容示例

```bash
# ========== 支付宝配置 ==========
ALIPAY_APP_ID=2021001234567890
ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
ALIPAY_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxxxx...
ALIPAY_NOTIFY_URL=https://yourdomain.com/api/v1/payment/alipay/notify
ALIPAY_RETURN_URL=https://yourdomain.com/payment/success

# ========== 微信支付配置 ==========
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_MCH_ID=1234567890
WECHAT_API_V3_KEY=your32characterapiv3keyhere12345
WECHAT_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
WECHAT_SERIAL_NO=5A02XXXXXXXXXXXXXXXXX
WECHAT_NOTIFY_URL=https://yourdomain.com/api/v1/payment/wechat/notify
```

---

## 四、测试环境（沙箱）

### 4.1 支付宝沙箱

1. 访问：https://openhome.alipay.com/develop/sandbox/app
2. 获取沙箱AppID、沙箱公钥
3. 使用沙箱买家账号测试

### 4.2 微信支付沙箱

1. 访问：https://pay.weixin.qq.com/wiki/doc/api/micropay.php?chapter=23_1
2. 获取沙箱商户号
3. 使用微信提供的测试账号

---

## 五、收款流程说明

### 5.1 完整支付流程

```
用户下单 → 创建支付订单 → 调起支付 → 用户支付 → 
支付平台回调 → 更新订单状态 → 到账您的账户
```

### 5.2 资金到账

- **支付宝**：
  - 交易成功后立即到账您的支付宝余额
  - 可设置自动提现到银行卡
  - T+0或T+1到账（看您的协议）

- **微信支付**：
  - 到账商户号余额
  - 需要手动提现到银行卡
  - T+1到账（一般次日到账）

### 5.3 手续费

- **支付宝**：一般 0.6% - 1.2%
- **微信支付**：一般 0.6%

（具体费率以您签约的协议为准）

---

## 六、安全建议

1. ✅ **私钥安全**：私钥不要提交到代码仓库
2. ✅ **HTTPS**：生产环境必须使用HTTPS
3. ✅ **验签**：必须验证回调签名
4. ✅ **防重**：处理回调时要防止重复处理
5. ✅ **日志**：记录所有支付相关操作日志

---

## 七、常见问题

### Q1: 没有企业资质怎么办？
**A**: 可以使用沙箱环境测试，或者使用个人支付宝的当面付功能（收款码）

### Q2: 回调地址必须是公网IP吗？
**A**: 是的，支付宝/微信需要能访问到您的服务器。开发环境可以使用内网穿透工具（如ngrok）

### Q3: 如何测试支付功能？
**A**: 
1. 使用支付宝/微信的沙箱环境
2. 使用内网穿透工具暴露本地服务
3. 配置沙箱账号信息

### Q4: 收款码可以直接用吗？
**A**: 收款码是固定金额的静态码，不适合商城系统。需要使用API动态创建订单。

---

## 八、快速开始

1. **复制配置示例**
   ```bash
   cd backend/api-gateway
   touch .env.development
   # 填入您的配置信息
   ```

2. **测试配置**
   - 启动服务器
   - 调用创建支付接口
   - 检查是否正确生成支付参数

3. **联调测试**
   - 使用沙箱环境测试支付流程
   - 验证回调是否正常
   - 确认订单状态更新正确

---

需要更多帮助，请查看官方文档：
- 支付宝：https://opendocs.alipay.com/
- 微信支付：https://pay.weixin.qq.com/wiki/doc/api/

import * as crypto from 'crypto'

/**
 * 支付宝支付工具类
 * 基于支付宝开放平台 API 实现支付功能
 */
export class AlipayUtil {
  private appId: string
  private privateKey: string
  private alipayPublicKey: string
  private gateway: string = 'https://openapi.alipay.com/gateway.do'
  private signType: string = 'RSA2'

  constructor(config: {
    appId: string
    privateKey: string
    alipayPublicKey: string
    sandbox?: boolean
  }) {
    this.appId = config.appId
    this.privateKey = config.privateKey
    this.alipayPublicKey = config.alipayPublicKey

    // 沙箱环境
    if (config.sandbox) {
      this.gateway = 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
    }
  }

  /**
   * 创建APP支付订单
   * @param params 订单参数
   * @returns 支付宝订单字符串
   */
  async createAppPayment(params: {
    outTradeNo: string // 商户订单号
    totalAmount: string // 订单总金额（元）
    subject: string // 订单标题
    body?: string // 订单描述
    timeoutExpress?: string // 超时时间（如：30m, 1h）
  }): Promise<string> {
    const bizContent = {
      out_trade_no: params.outTradeNo,
      total_amount: params.totalAmount,
      subject: params.subject,
      body: params.body || params.subject,
      timeout_express: params.timeoutExpress || '30m',
      product_code: 'QUICK_MSECURITY_PAY', // APP支付
    }

    const commonParams = {
      app_id: this.appId,
      method: 'alipay.trade.app.pay',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: this.signType,
      timestamp: this.getTimestamp(),
      version: '1.0',
      notify_url: process.env.ALIPAY_NOTIFY_URL || '',
      biz_content: JSON.stringify(bizContent),
    }

    const sign = this.sign(commonParams)
    const signedParams = { ...commonParams, sign }

    return this.buildOrderString(signedParams)
  }

  /**
   * 创建H5支付订单
   * @param params 订单参数
   * @returns 支付宝支付URL
   */
  async createWapPayment(params: {
    outTradeNo: string
    totalAmount: string
    subject: string
    body?: string
    returnUrl?: string
    quitUrl?: string
  }): Promise<string> {
    const bizContent = {
      out_trade_no: params.outTradeNo,
      total_amount: params.totalAmount,
      subject: params.subject,
      body: params.body || params.subject,
      product_code: 'QUICK_WAP_WAY', // H5支付
    }

    const commonParams = {
      app_id: this.appId,
      method: 'alipay.trade.wap.pay',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: this.signType,
      timestamp: this.getTimestamp(),
      version: '1.0',
      notify_url: process.env.ALIPAY_NOTIFY_URL || '',
      return_url: params.returnUrl || process.env.ALIPAY_RETURN_URL || '',
      biz_content: JSON.stringify(bizContent),
    }

    const sign = this.sign(commonParams)
    const signedParams = { ...commonParams, sign }

    return `${this.gateway}?${this.buildQueryString(signedParams)}`
  }

  /**
   * 验证支付宝回调签名
   * @param params 回调参数
   * @returns 验证结果
   */
  verifyNotify(params: Record<string, any>): boolean {
    const sign = params.sign
    const signType = params.sign_type

    if (!sign || signType !== this.signType) {
      return false
    }

    // 移除sign和sign_type参数
    const { sign: _, sign_type: __, ...data } = params

    // 验证签名
    return this.verify(data, sign)
  }

  /**
   * 查询订单状态
   * @param outTradeNo 商户订单号
   * @returns 订单查询结果
   */
  async queryOrder(outTradeNo: string): Promise<any> {
    const bizContent = {
      out_trade_no: outTradeNo,
    }

    const commonParams = {
      app_id: this.appId,
      method: 'alipay.trade.query',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: this.signType,
      timestamp: this.getTimestamp(),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    }

    const sign = this.sign(commonParams)
    const signedParams = { ...commonParams, sign }

    // 这里需要发起HTTP请求到支付宝网关
    // 实际项目中应该使用 axios 或其他 HTTP 客户端
    return this.request(signedParams)
  }

  /**
   * 退款
   * @param params 退款参数
   * @returns 退款结果
   */
  async refund(params: {
    outTradeNo: string
    refundAmount: string
    refundReason?: string
  }): Promise<any> {
    const bizContent = {
      out_trade_no: params.outTradeNo,
      refund_amount: params.refundAmount,
      refund_reason: params.refundReason || '用户退款',
    }

    const commonParams = {
      app_id: this.appId,
      method: 'alipay.trade.refund',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: this.signType,
      timestamp: this.getTimestamp(),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    }

    const sign = this.sign(commonParams)
    const signedParams = { ...commonParams, sign }

    return this.request(signedParams)
  }

  /**
   * 关闭订单
   * @param outTradeNo 商户订单号
   * @returns 关闭结果
   */
  async closeOrder(outTradeNo: string): Promise<any> {
    const bizContent = {
      out_trade_no: outTradeNo,
    }

    const commonParams = {
      app_id: this.appId,
      method: 'alipay.trade.close',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: this.signType,
      timestamp: this.getTimestamp(),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    }

    const sign = this.sign(commonParams)
    const signedParams = { ...commonParams, sign }

    return this.request(signedParams)
  }

  // ========== 私有方法 ==========

  /**
   * RSA2签名
   */
  private sign(params: Record<string, any>): string {
    const signString = this.buildSignString(params)
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signString, 'utf8')
    return sign.sign(this.formatPrivateKey(this.privateKey), 'base64')
  }

  /**
   * RSA2验签
   */
  private verify(params: Record<string, any>, signature: string): boolean {
    const signString = this.buildSignString(params)
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(signString, 'utf8')
    return verify.verify(this.formatPublicKey(this.alipayPublicKey), signature, 'base64')
  }

  /**
   * 构建签名字符串
   */
  private buildSignString(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort()
    const pairs = sortedKeys
      .filter((key) => params[key] !== '' && params[key] !== null && params[key] !== undefined)
      .map((key) => `${key}=${params[key]}`)

    return pairs.join('&')
  }

  /**
   * 构建订单字符串（用于APP支付）
   */
  private buildOrderString(params: Record<string, any>): string {
    return Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
  }

  /**
   * 构建查询字符串（用于H5支付）
   */
  private buildQueryString(params: Record<string, any>): string {
    return Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&')
  }

  /**
   * 获取时间戳
   */
  private getTimestamp(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    const second = String(now.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }

  /**
   * 格式化私钥
   */
  private formatPrivateKey(key: string): string {
    if (key.includes('BEGIN')) {
      return key
    }
    return `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`
  }

  /**
   * 格式化公钥
   */
  private formatPublicKey(key: string): string {
    if (key.includes('BEGIN')) {
      return key
    }
    return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`
  }

  /**
   * 发起HTTP请求到支付宝网关
   * 实际项目中应该使用 axios 或其他 HTTP 客户端
   */
  private async request(params: Record<string, any>): Promise<any> {
    // TODO: 实现HTTP请求
    // 这里仅作为示例，实际项目中需要实现完整的HTTP请求逻辑
    const url = `${this.gateway}?${this.buildQueryString(params)}`
    console.log('Alipay request URL:', url)
    return { url }
  }
}

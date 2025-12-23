import * as crypto from 'crypto'

/**
 * 微信支付工具类
 * 基于微信支付 API V3 实现支付功能
 */
export class WechatPayUtil {
    private appId: string
    private mchId: string // 商户号
    private apiV3Key: string // APIv3密钥
    private privateKey: string // 商户私钥
    private serialNo: string // 商户证书序列号
    private gateway: string = 'https://api.mch.weixin.qq.com'

    constructor(config: {
        appId: string
        mchId: string
        apiV3Key: string
        privateKey: string
        serialNo: string
        sandbox?: boolean
    }) {
        this.appId = config.appId
        this.mchId = config.mchId
        this.apiV3Key = config.apiV3Key
        this.privateKey = config.privateKey
        this.serialNo = config.serialNo

        // 沙箱环境
        if (config.sandbox) {
            this.gateway = 'https://api.mch.weixin.qq.com/sandboxnew'
        }
    }

    /**
     * 创建APP支付订单
     * @param params 订单参数
     * @returns 预支付交易会话标识
     */
    async createAppPayment(params: {
        outTradeNo: string // 商户订单号
        description: string // 商品描述
        totalAmount: number // 订单总金额（分）
        timeExpire?: string // 交易结束时间
    }): Promise<{
        prepayId: string
        paySign: string
        timestamp: string
        nonceStr: string
    }> {
        const url = `${this.gateway}/v3/pay/transactions/app`

        const body = {
            appid: this.appId,
            mchid: this.mchId,
            description: params.description,
            out_trade_no: params.outTradeNo,
            time_expire: params.timeExpire || this.getExpireTime(30), // 默认30分钟
            notify_url: process.env.WECHAT_NOTIFY_URL || '',
            amount: {
                total: params.totalAmount,
                currency: 'CNY',
            },
        }

        const response = await this.request('POST', url, body)
        const prepayId = response.prepay_id

        // 生成调起支付所需参数
        const timestamp = Math.floor(Date.now() / 1000).toString()
        const nonceStr = this.generateNonceStr()
        const paySign = this.signForApp(prepayId, timestamp, nonceStr)

        return {
            prepayId,
            paySign,
            timestamp,
            nonceStr,
        }
    }

    /**
     * 创建H5支付订单
     * @param params 订单参数
     * @returns H5支付跳转URL
     */
    async createH5Payment(params: {
        outTradeNo: string
        description: string
        totalAmount: number
        userIp: string
        timeExpire?: string
    }): Promise<string> {
        const url = `${this.gateway}/v3/pay/transactions/h5`

        const body = {
            appid: this.appId,
            mchid: this.mchId,
            description: params.description,
            out_trade_no: params.outTradeNo,
            time_expire: params.timeExpire || this.getExpireTime(30),
            notify_url: process.env.WECHAT_NOTIFY_URL || '',
            amount: {
                total: params.totalAmount,
                currency: 'CNY',
            },
            scene_info: {
                payer_client_ip: params.userIp,
                h5_info: {
                    type: 'Wap',
                },
            },
        }

        const response = await this.request('POST', url, body)
        return response.h5_url
    }

    /**
     * 创建小程序支付订单
     * @param params 订单参数
     * @returns 预支付交易会话标识
     */
    async createJsapiPayment(params: {
        outTradeNo: string
        description: string
        totalAmount: number
        openid: string // 用户标识
        timeExpire?: string
    }): Promise<{
        timeStamp: string
        nonceStr: string
        package: string
        signType: string
        paySign: string
    }> {
        const url = `${this.gateway}/v3/pay/transactions/jsapi`

        const body = {
            appid: this.appId,
            mchid: this.mchId,
            description: params.description,
            out_trade_no: params.outTradeNo,
            time_expire: params.timeExpire || this.getExpireTime(30),
            notify_url: process.env.WECHAT_NOTIFY_URL || '',
            amount: {
                total: params.totalAmount,
                currency: 'CNY',
            },
            payer: {
                openid: params.openid,
            },
        }

        const response = await this.request('POST', url, body)
        const prepayId = response.prepay_id

        // 生成调起支付所需参数
        const timeStamp = Math.floor(Date.now() / 1000).toString()
        const nonceStr = this.generateNonceStr()
        const packageStr = `prepay_id=${prepayId}`
        const signType = 'RSA'
        const paySign = this.signForJsapi(timeStamp, nonceStr, packageStr)

        return {
            timeStamp,
            nonceStr,
            package: packageStr,
            signType,
            paySign,
        }
    }

    /**
     * 查询订单
     * @param outTradeNo 商户订单号
     * @returns 订单信息
     */
    async queryOrder(outTradeNo: string): Promise<any> {
        const url = `${this.gateway}/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${this.mchId}`
        return this.request('GET', url)
    }

    /**
     * 关闭订单
     * @param outTradeNo 商户订单号
     */
    async closeOrder(outTradeNo: string): Promise<void> {
        const url = `${this.gateway}/v3/pay/transactions/out-trade-no/${outTradeNo}/close`
        const body = {
            mchid: this.mchId,
        }
        await this.request('POST', url, body)
    }

    /**
     * 申请退款
     * @param params 退款参数
     * @returns 退款结果
     */
    async refund(params: {
        outTradeNo: string
        outRefundNo: string // 商户退款单号
        refundAmount: number // 退款金额（分）
        totalAmount: number // 原订单金额（分）
        reason?: string
    }): Promise<any> {
        const url = `${this.gateway}/v3/refund/domestic/refunds`

        const body = {
            out_trade_no: params.outTradeNo,
            out_refund_no: params.outRefundNo,
            reason: params.reason || '用户退款',
            notify_url: process.env.WECHAT_REFUND_NOTIFY_URL || '',
            amount: {
                refund: params.refundAmount,
                total: params.totalAmount,
                currency: 'CNY',
            },
        }

        return this.request('POST', url, body)
    }

    /**
     * 查询退款
     * @param outRefundNo 商户退款单号
     * @returns 退款信息
     */
    async queryRefund(outRefundNo: string): Promise<any> {
        const url = `${this.gateway}/v3/refund/domestic/refunds/${outRefundNo}`
        return this.request('GET', url)
    }

    /**
     * 验证回调签名
     * @param headers 回调请求头
     * @param body 回调请求体
     * @returns 验证结果
     */
    verifyNotify(
        headers: {
            'wechatpay-timestamp': string
            'wechatpay-nonce': string
            'wechatpay-signature': string
            'wechatpay-serial': string
        },
        body: string
    ): boolean {
        const timestamp = headers['wechatpay-timestamp']
        const nonce = headers['wechatpay-nonce']
        const signature = headers['wechatpay-signature']

        const message = `${timestamp}\n${nonce}\n${body}\n`

        // 这里需要用微信支付平台证书公钥验签
        // 实际项目中需要先下载平台证书并缓存
        // 此处仅作示例
        return this.verifySignature(message, signature)
    }

    /**
     * 解密回调数据
     * @param encryptedData 加密数据
     * @param nonce 随机串
     * @param associatedData 附加数据
     * @returns 解密后的数据
     */
    decryptNotifyData(
        encryptedData: string,
        nonce: string,
        associatedData: string
    ): any {
        const key = Buffer.from(this.apiV3Key, 'utf8')
        const iv = Buffer.from(nonce, 'utf8')
        const ciphertext = Buffer.from(encryptedData, 'base64')
        const authTag = ciphertext.slice(-16)
        const data = ciphertext.slice(0, -16)

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
        decipher.setAuthTag(authTag)
        decipher.setAAD(Buffer.from(associatedData, 'utf8'))

        const decoded = Buffer.concat([decipher.update(data), decipher.final()])
        return JSON.parse(decoded.toString('utf8'))
    }

    // ========== 私有方法 ==========

    /**
     * 为APP支付生成签名
     */
    private signForApp(prepayId: string, timestamp: string, nonceStr: string): string {
        const message = `${this.appId}\n${timestamp}\n${nonceStr}\n${prepayId}\n`
        return this.sign(message)
    }

    /**
     * 为JSAPI支付生成签名
     */
    private signForJsapi(timestamp: string, nonceStr: string, packageStr: string): string {
        const message = `${this.appId}\n${timestamp}\n${nonceStr}\n${packageStr}\n`
        return this.sign(message)
    }

    /**
     * SHA256-RSA签名
     */
    private sign(message: string): string {
        const sign = crypto.createSign('RSA-SHA256')
        sign.update(message)
        return sign.sign(this.formatPrivateKey(this.privateKey), 'base64')
    }

    /**
     * 验证签名
     */
    private verifySignature(message: string, signature: string): boolean {
        // 这里需要使用微信支付平台证书公钥
        // 实际项目中需要先下载并缓存证书
        return true // 示例返回
    }

    /**
     * 生成随机字符串
     */
    private generateNonceStr(): string {
        return crypto.randomBytes(16).toString('hex')
    }

    /**
     * 获取过期时间
     * @param minutes 分钟数
     */
    private getExpireTime(minutes: number): string {
        const expireTime = new Date(Date.now() + minutes * 60 * 1000)
        return expireTime.toISOString().replace(/\.\d{3}Z$/, '+08:00')
    }

    /**
     * 格式化私钥
     */
    private formatPrivateKey(key: string): string {
        if (key.includes('BEGIN')) {
            return key
        }
        return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`
    }

    /**
     * 构建Authorization头
     */
    private buildAuthorization(method: string, url: string, body?: any): string {
        const timestamp = Math.floor(Date.now() / 1000).toString()
        const nonceStr = this.generateNonceStr()
        const urlPath = new URL(url).pathname + new URL(url).search

        let message = `${method}\n${urlPath}\n${timestamp}\n${nonceStr}\n`
        if (body) {
            message += `${JSON.stringify(body)}\n`
        } else {
            message += '\n'
        }

        const signature = this.sign(message)

        return `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.serialNo}"`
    }

    /**
     * 发起HTTP请求
     */
    private async request(method: string, url: string, body?: any): Promise<any> {
        const authorization = this.buildAuthorization(method, url, body)

        // TODO: 实际项目中应该使用 axios 或其他 HTTP 客户端
        console.log('WechatPay request:', {
            method,
            url,
            authorization,
            body,
        })

        // 示例返回
        return {
            prepay_id: 'wx' + Date.now() + Math.random().toString(36).substr(2, 9),
            h5_url: 'https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=...',
        }
    }
}

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AlipayUtil } from '@shared/utils/alipay'
import { WechatPayUtil } from '@shared/utils/wechat-pay'
import { PaymentRepository } from '@shared/repositories/payment.repository'
import { OrderRepository } from '@shared/repositories/order.repository'
import { PaymentChannel, OrderStatus } from '@shared/types'

@Injectable()
export class PaymentService {
    private alipayUtil: AlipayUtil
    private wechatPayUtil: WechatPayUtil

    constructor(
        private readonly configService: ConfigService,
        private readonly paymentRepository: PaymentRepository,
        private readonly orderRepository: OrderRepository
    ) {
        // 初始化支付宝工具
        this.alipayUtil = new AlipayUtil({
            appId: this.configService.get('ALIPAY_APP_ID') || '',
            privateKey: this.configService.get('ALIPAY_PRIVATE_KEY') || '',
            alipayPublicKey: this.configService.get('ALIPAY_PUBLIC_KEY') || '',
            sandbox: this.configService.get('NODE_ENV') === 'development',
        })

        // 初始化微信支付工具
        this.wechatPayUtil = new WechatPayUtil({
            appId: this.configService.get('WECHAT_APP_ID') || '',
            mchId: this.configService.get('WECHAT_MCH_ID') || '',
            apiV3Key: this.configService.get('WECHAT_API_V3_KEY') || '',
            privateKey: this.configService.get('WECHAT_PRIVATE_KEY') || '',
            serialNo: this.configService.get('WECHAT_SERIAL_NO') || '',
            sandbox: this.configService.get('NODE_ENV') === 'development',
        })
    }

    /**
     * 创建支付订单
     */
    async createPayment(params: {
        orderNo: string
        channel: PaymentChannel
        platform: 'app' | 'h5' | 'jsapi'
        userIp?: string
        openid?: string
    }) {
        // 查询订单信息
        const order = await this.orderRepository.findByOrderNo(params.orderNo)
        if (!order) {
            throw new Error('订单不存在')
        }

        if (order.status !== 'pending') {
            throw new Error('订单状态不正确')
        }

        // 检查订单是否过期
        if (new Date() > new Date(order.expiredAt)) {
            await this.orderRepository.updateStatus(order.id, OrderStatus.EXPIRED)
            throw new Error('订单已过期')
        }

        // 创建支付记录
        const paymentId = this.paymentRepository.generatePaymentId()
        await this.paymentRepository.create(paymentId, order.id, params.channel, order.amount)

        // 根据支付渠道创建支付订单
        if (params.channel === PaymentChannel.ALIPAY) {
            return this.createAlipayOrder({
                paymentId,
                orderNo: order.orderNo,
                amount: order.amount,
                subject: this.getOrderSubject(order.serviceType),
                platform: params.platform,
            })
        } else if (params.channel === PaymentChannel.WECHAT) {
            return this.createWechatPayOrder({
                paymentId,
                orderNo: order.orderNo,
                amount: order.amount,
                description: this.getOrderSubject(order.serviceType),
                platform: params.platform,
                userIp: params.userIp,
                openid: params.openid,
            })
        }

        throw new Error('不支持的支付渠道')
    }

    /**
     * 创建支付宝订单
     */
    private async createAlipayOrder(params: {
        paymentId: string
        orderNo: string
        amount: number
        subject: string
        platform: 'app' | 'h5' | 'jsapi'
    }) {
        const totalAmount = (params.amount / 100).toFixed(2) // 分转元

        if (params.platform === 'app') {
            const orderString = await this.alipayUtil.createAppPayment({
                outTradeNo: params.paymentId,
                totalAmount,
                subject: params.subject,
            })

            return {
                paymentId: params.paymentId,
                channel: PaymentChannel.ALIPAY,
                platform: params.platform,
                orderString,
            }
        } else if (params.platform === 'h5') {
            const payUrl = await this.alipayUtil.createWapPayment({
                outTradeNo: params.paymentId,
                totalAmount,
                subject: params.subject,
            })

            return {
                paymentId: params.paymentId,
                channel: PaymentChannel.ALIPAY,
                platform: params.platform,
                payUrl,
            }
        }

        throw new Error('不支持的支付平台')
    }

    /**
     * 创建微信支付订单
     */
    private async createWechatPayOrder(params: {
        paymentId: string
        orderNo: string
        amount: number
        description: string
        platform: 'app' | 'h5' | 'jsapi'
        userIp?: string
        openid?: string
    }) {
        if (params.platform === 'app') {
            const result = await this.wechatPayUtil.createAppPayment({
                outTradeNo: params.paymentId,
                description: params.description,
                totalAmount: params.amount, // 单位：分
            })

            return {
                paymentId: params.paymentId,
                channel: PaymentChannel.WECHAT,
                platform: params.platform,
                ...result,
            }
        } else if (params.platform === 'h5') {
            if (!params.userIp) {
                throw new Error('H5支付需要提供用户IP')
            }

            const h5Url = await this.wechatPayUtil.createH5Payment({
                outTradeNo: params.paymentId,
                description: params.description,
                totalAmount: params.amount,
                userIp: params.userIp,
            })

            return {
                paymentId: params.paymentId,
                channel: PaymentChannel.WECHAT,
                platform: params.platform,
                h5Url,
            }
        } else if (params.platform === 'jsapi') {
            if (!params.openid) {
                throw new Error('小程序支付需要提供用户openid')
            }

            const result = await this.wechatPayUtil.createJsapiPayment({
                outTradeNo: params.paymentId,
                description: params.description,
                totalAmount: params.amount,
                openid: params.openid,
            })

            return {
                paymentId: params.paymentId,
                channel: PaymentChannel.WECHAT,
                platform: params.platform,
                ...result,
            }
        }

        throw new Error('不支持的支付平台')
    }

    /**
     * 处理支付宝回调
     */
    async handleAlipayNotify(params: Record<string, any>) {
        // 验证签名
        if (!this.alipayUtil.verifyNotify(params)) {
            throw new Error('签名验证失败')
        }

        // 获取支付信息
        const paymentId = params.out_trade_no
        const tradeStatus = params.trade_status
        const transactionId = params.trade_no

        // 更新支付状态
        if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
            await this.updatePaymentStatus(paymentId, 'success', transactionId)
            return 'success'
        }

        return 'fail'
    }

    /**
     * 处理微信支付回调
     */
    async handleWechatPayNotify(
        headers: {
            'wechatpay-timestamp': string
            'wechatpay-nonce': string
            'wechatpay-signature': string
            'wechatpay-serial': string
        },
        body: string
    ) {
        // 验证签名
        if (!this.wechatPayUtil.verifyNotify(headers, body)) {
            throw new Error('签名验证失败')
        }

        const data = JSON.parse(body)

        // 解密数据
        const decryptedData = this.wechatPayUtil.decryptNotifyData(
            data.resource.ciphertext,
            data.resource.nonce,
            data.resource.associated_data
        )

        // 更新支付状态
        if (decryptedData.trade_state === 'SUCCESS') {
            await this.updatePaymentStatus(
                decryptedData.out_trade_no,
                'success',
                decryptedData.transaction_id
            )
            return { code: 'SUCCESS', message: '成功' }
        }

        return { code: 'FAIL', message: '失败' }
    }

    /**
     * 更新支付状态
     */
    private async updatePaymentStatus(
        paymentId: string,
        status: string,
        transactionId: string
    ) {
        // 更新支付记录
        const payment = await this.paymentRepository.updateStatus(paymentId, status, transactionId)

        // 更新订单状态
        await this.orderRepository.updateStatus(payment.orderId, OrderStatus.PAID, new Date())
    }

    /**
     * 查询支付状态
     */
    async queryPayment(paymentId: string) {
        const payment = await this.paymentRepository.findByPaymentId(paymentId)
        if (!payment) {
            throw new Error('支付记录不存在')
        }

        // 如果已经支付成功，直接返回
        if (payment.status === 'success') {
            return payment
        }

        // 查询第三方支付状态
        let result
        if (payment.channel === PaymentChannel.ALIPAY) {
            result = await this.alipayUtil.queryOrder(paymentId)
        } else if (payment.channel === PaymentChannel.WECHAT) {
            result = await this.wechatPayUtil.queryOrder(paymentId)
        }

        return {
            payment,
            thirdPartyResult: result,
        }
    }

    /**
     * 申请退款
     */
    async refund(params: {
        orderNo: string
        refundAmount: number
        reason?: string
    }) {
        const order = await this.orderRepository.findByOrderNo(params.orderNo)
        if (!order) {
            throw new Error('订单不存在')
        }

        if (order.status !== 'paid') {
            throw new Error('订单未支付或已退款')
        }

        const payments = await this.paymentRepository.findByOrderId(order.id)
        const successPayment = payments.find((p) => p.status === 'success')

        if (!successPayment) {
            throw new Error('未找到成功的支付记录')
        }

        // 发起退款
        if (successPayment.channel === PaymentChannel.ALIPAY) {
            return this.alipayUtil.refund({
                outTradeNo: successPayment.paymentId,
                refundAmount: (params.refundAmount / 100).toFixed(2),
                refundReason: params.reason,
            })
        } else if (successPayment.channel === PaymentChannel.WECHAT) {
            return this.wechatPayUtil.refund({
                outTradeNo: successPayment.paymentId,
                outRefundNo: `REF${Date.now()}`,
                refundAmount: params.refundAmount,
                totalAmount: order.amount,
                reason: params.reason,
            })
        }

        throw new Error('不支持的支付渠道')
    }

    /**
     * 获取订单标题
     */
    private getOrderSubject(serviceType: string): string {
        const titles: Record<string, string> = {
            vip_month: '神机妙算-月度VIP会员',
            vip_year: '神机妙算-年度VIP会员',
            bazi: '神机妙算-八字排盘',
            qimen: '神机妙算-奇门遁甲',
            bagua: '神机妙算-八卦测算',
            meihua: '神机妙算-梅花易数',
        }

        return titles[serviceType] || '神机妙算-占卜服务'
    }
}

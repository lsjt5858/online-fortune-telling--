import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AlipayUtil } from '@shared/utils/alipay'
import { WechatPayUtil } from '@shared/utils/wechat-pay'
import { PaymentRepository } from '@shared/repositories/payment.repository'
import { OrderRepository } from '@shared/repositories/order.repository'
import { VipRepository } from '@shared/repositories/vip.repository'
import { PaymentChannel, OrderStatus } from '@shared/types'

export interface PaymentResult {
    paymentId: string
    channel: PaymentChannel
    platform: string
    orderString?: string  // APP 支付
    payUrl?: string       // H5 支付
    h5Url?: string        // 微信 H5 支付
    prepayId?: string     // 微信 APP 支付
    paySign?: string
    timestamp?: string
    nonceStr?: string
    timeStamp?: string
    package?: string
    signType?: string
}

export interface PaymentStatusResult {
    paymentId: string
    orderId: string
    orderNo: string
    channel: PaymentChannel
    channelText: string
    amount: number
    amountYuan: string
    status: string
    statusText: string
    paidAt: Date | null
    createdAt: Date
}

@Injectable()
export class PaymentService {
    private alipayUtil: AlipayUtil
    private wechatPayUtil: WechatPayUtil

    constructor(
        private readonly configService: ConfigService,
        private readonly paymentRepository: PaymentRepository,
        private readonly orderRepository: OrderRepository,
        private readonly vipRepository: VipRepository,
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
    }): Promise<PaymentResult> {
        // 查询订单信息
        const order = await this.orderRepository.findByOrderNo(params.orderNo)
        if (!order) {
            throw new NotFoundException('订单不存在')
        }

        if (order.status !== 'pending') {
            throw new BadRequestException('订单状态不正确，无法支付')
        }

        // 检查订单是否过期
        const expiredAt = new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000)
        if (new Date() > expiredAt) {
            await this.orderRepository.updateStatus(order.id, OrderStatus.EXPIRED)
            throw new BadRequestException('订单已过期，请重新下单')
        }

        // 检查是否已有进行中的支付
        const existingPayments = await this.paymentRepository.findByOrderId(order.id)
        const pendingPayment = existingPayments.find(p => p.status === 'pending')
        if (pendingPayment) {
            // 返回已有的支付信息
            return {
                paymentId: pendingPayment.paymentId,
                channel: pendingPayment.channel as PaymentChannel,
                platform: params.platform,
            }
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

        throw new BadRequestException('不支持的支付渠道')
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

        throw new BadRequestException('不支持的支付平台')
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
                throw new BadRequestException('H5支付需要提供用户IP')
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
                throw new BadRequestException('小程序支付需要提供用户openid')
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

        throw new BadRequestException('不支持的支付平台')
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
        const order = await this.orderRepository.updateStatus(payment.orderId, OrderStatus.PAID, new Date())

        // 处理订单完成后的业务逻辑
        await this.handleOrderPaid(order)
    }

    /**
     * 处理订单支付成功
     */
    private async handleOrderPaid(order: any) {
        // VIP 订单自动激活
        if (order.serviceType === 'vip') {
            const level = parseInt(order.serviceId, 10)
            const config = await this.vipRepository.getConfigByLevel(level)
            if (config) {
                await this.vipRepository.upgradeUserVip(order.userId, level, config.duration)
                // 更新订单为已完成
                await this.orderRepository.updateStatus(order.id, OrderStatus.COMPLETED)
            }
        }
    }

    /**
     * 查询支付状态
     */
    async queryPayment(paymentId: string): Promise<PaymentStatusResult> {
        const payment = await this.paymentRepository.findByPaymentId(paymentId)
        if (!payment) {
            throw new NotFoundException('支付记录不存在')
        }

        // 获取订单信息
        const order = await this.orderRepository.findById(payment.orderId)

        // 如果还是待支付状态，主动查询第三方
        if (payment.status === 'pending') {
            await this.syncPaymentStatus(payment)
        }

        return this.formatPaymentStatus(payment, order)
    }

    /**
     * 同步支付状态（主动查询第三方）
     */
    private async syncPaymentStatus(payment: any): Promise<void> {
        try {
            let result
            if (payment.channel === PaymentChannel.ALIPAY) {
                result = await this.alipayUtil.queryOrder(payment.paymentId)
                if (result?.trade_status === 'TRADE_SUCCESS') {
                    await this.updatePaymentStatus(payment.paymentId, 'success', result.trade_no)
                }
            } else if (payment.channel === PaymentChannel.WECHAT) {
                result = await this.wechatPayUtil.queryOrder(payment.paymentId)
                if (result?.trade_state === 'SUCCESS') {
                    await this.updatePaymentStatus(payment.paymentId, 'success', result.transaction_id)
                }
            }
        } catch (error) {
            console.error('同步支付状态失败:', error)
        }
    }

    /**
     * 格式化支付状态
     */
    private formatPaymentStatus(payment: any, order: any): PaymentStatusResult {
        const channelTexts: Record<string, string> = {
            [PaymentChannel.WECHAT]: '微信支付',
            [PaymentChannel.ALIPAY]: '支付宝',
        }

        const statusTexts: Record<string, string> = {
            pending: '待支付',
            success: '支付成功',
            failed: '支付失败',
            refunded: '已退款',
        }

        return {
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            orderNo: order?.orderNo || '',
            channel: payment.channel,
            channelText: channelTexts[payment.channel] || '未知',
            amount: payment.amount,
            amountYuan: (payment.amount / 100).toFixed(2),
            status: payment.status,
            statusText: statusTexts[payment.status] || '未知',
            paidAt: payment.paidAt,
            createdAt: payment.createdAt,
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
            throw new NotFoundException('订单不存在')
        }

        if (order.status !== 'paid' && order.status !== 'completed') {
            throw new BadRequestException('订单未支付或已退款')
        }

        const payments = await this.paymentRepository.findByOrderId(order.id)
        const successPayment = payments.find((p) => p.status === 'success')

        if (!successPayment) {
            throw new NotFoundException('未找到成功的支付记录')
        }

        // 验证退款金额
        if (params.refundAmount > order.amount) {
            throw new BadRequestException('退款金额不能超过订单金额')
        }

        // 发起退款
        let result
        if (successPayment.channel === PaymentChannel.ALIPAY) {
            result = await this.alipayUtil.refund({
                outTradeNo: successPayment.paymentId,
                refundAmount: (params.refundAmount / 100).toFixed(2),
                refundReason: params.reason,
            })
        } else if (successPayment.channel === PaymentChannel.WECHAT) {
            result = await this.wechatPayUtil.refund({
                outTradeNo: successPayment.paymentId,
                outRefundNo: `REF${Date.now()}`,
                refundAmount: params.refundAmount,
                totalAmount: order.amount,
                reason: params.reason,
            })
        } else {
            throw new BadRequestException('不支持的支付渠道')
        }

        // 更新订单状态
        await this.orderRepository.updateStatus(order.id, OrderStatus.REFUNDED)
        await this.paymentRepository.updateStatus(successPayment.paymentId, 'refunded', null)

        return {
            success: true,
            message: '退款申请已提交',
            refundAmount: params.refundAmount,
            refundAmountYuan: (params.refundAmount / 100).toFixed(2),
            result,
        }
    }

    /**
     * 关闭支付订单
     */
    async closePayment(paymentId: string): Promise<{ success: boolean; message: string }> {
        const payment = await this.paymentRepository.findByPaymentId(paymentId)
        if (!payment) {
            throw new NotFoundException('支付记录不存在')
        }

        if (payment.status !== 'pending') {
            throw new BadRequestException('只能关闭待支付的订单')
        }

        try {
            if (payment.channel === PaymentChannel.ALIPAY) {
                await this.alipayUtil.closeOrder(paymentId)
            } else if (payment.channel === PaymentChannel.WECHAT) {
                await this.wechatPayUtil.closeOrder(paymentId)
            }

            await this.paymentRepository.updateStatus(paymentId, 'closed', null)
            return { success: true, message: '支付订单已关闭' }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }

    /**
     * 获取订单标题
     */
    private getOrderSubject(serviceType: string): string {
        const titles: Record<string, string> = {
            vip: '神机妙算-VIP会员',
            vip_month: '神机妙算-月度VIP会员',
            vip_year: '神机妙算-年度VIP会员',
            vip_lifetime: '神机妙算-终身VIP会员',
            divination: '神机妙算-占卜服务',
            bazi: '神机妙算-八字排盘',
            qimen: '神机妙算-奇门遁甲',
            bagua: '神机妙算-八卦测算',
            meihua: '神机妙算-梅花易数',
            consultation: '神机妙算-命理咨询',
        }

        return titles[serviceType] || '神机妙算-占卜服务'
    }

    /**
     * 获取用户支付记录列表
     */
    async getUserPayments(userId: string, page: number = 1, pageSize: number = 10) {
        // 先获取用户的订单
        const orders = await this.orderRepository.findByUserId(userId, { page, pageSize })
        
        // 获取所有订单的支付记录
        const paymentPromises = orders.list.map(order => 
            this.paymentRepository.findByOrderId(order.id)
        )
        const paymentsArrays = await Promise.all(paymentPromises)
        
        // 扁平化并格式化
        const payments = paymentsArrays.flat().map((payment, index) => {
            const order = orders.list.find(o => o.id === payment.orderId)
            return this.formatPaymentStatus(payment, order)
        })

        return {
            list: payments,
            total: payments.length,
            page,
            pageSize,
        }
    }
}

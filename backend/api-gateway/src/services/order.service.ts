import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { OrderRepository, PaymentRepository, VipRepository } from '@shared/repositories'
import { OrderStatus, PaymentChannel, PaginationParams } from '@shared/types'

export interface CreateOrderDto {
  userId: string
  serviceType: 'vip' | 'divination' | 'consultation'
  serviceId: string
  amount?: number // 可选，如果不传则根据 serviceType 和 serviceId 自动计算
}

export interface OrderDetailDto {
  id: string
  orderNo: string
  userId: string
  serviceType: string
  serviceId: string
  serviceName: string
  amount: number
  amountYuan: string
  status: OrderStatus
  statusText: string
  paidAt: Date | null
  expiredAt: Date
  isExpired: boolean
  createdAt: Date
  payments?: PaymentInfo[]
}

export interface PaymentInfo {
  paymentId: string
  channel: PaymentChannel
  channelText: string
  amount: number
  status: string
  statusText: string
  paidAt: Date | null
}

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly vipRepo: VipRepository,
  ) {}

  /**
   * 创建订单
   */
  async createOrder(dto: CreateOrderDto): Promise<OrderDetailDto> {
    // 计算订单金额
    const amount = dto.amount || await this.calculateAmount(dto.serviceType, dto.serviceId)
    
    if (amount <= 0) {
      throw new BadRequestException('订单金额无效')
    }

    // 创建订单
    const order = await this.orderRepo.create({
      userId: dto.userId,
      serviceType: dto.serviceType,
      serviceId: dto.serviceId,
      amount,
      expireMinutes: 30,
    })

    return this.formatOrderDetail(order)
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(orderId: string, userId?: string): Promise<OrderDetailDto> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    // 验证订单归属
    if (userId && order.userId !== userId) {
      throw new ForbiddenException('无权访问此订单')
    }

    // 获取支付记录
    const payments = await this.paymentRepo.findByOrderId(orderId)

    return this.formatOrderDetail(order, payments)
  }

  /**
   * 根据订单号获取订单详情
   */
  async getOrderByNo(orderNo: string, userId?: string): Promise<OrderDetailDto> {
    const order = await this.orderRepo.findByOrderNo(orderNo)
    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('无权访问此订单')
    }

    const payments = await this.paymentRepo.findByOrderId(order.id)
    return this.formatOrderDetail(order, payments)
  }

  /**
   * 获取用户订单列表
   */
  async getUserOrders(userId: string, pagination: PaginationParams, status?: OrderStatus) {
    const result = await this.orderRepo.findByUserId(userId, pagination)
    
    // 过滤状态
    let filteredList = result.list
    if (status) {
      filteredList = result.list.filter(order => order.status === status)
    }

    return {
      ...result,
      list: await Promise.all(filteredList.map(order => this.formatOrderDetail(order))),
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('无权操作此订单')
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('只能取消待支付的订单')
    }

    await this.orderRepo.updateStatus(orderId, OrderStatus.EXPIRED)
    return { success: true, message: '订单已取消' }
  }

  /**
   * 检查并更新过期订单
   */
  async checkExpiredOrders(): Promise<number> {
    await this.orderRepo.markExpiredOrders()
    return 0 // 返回更新数量，实际实现需要修改 repository
  }

  /**
   * 订单支付成功回调处理
   */
  async handlePaymentSuccess(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    // 根据服务类型处理
    if (order.serviceType === 'vip') {
      // VIP 订单 - 激活 VIP
      const level = parseInt(order.serviceId, 10)
      const config = await this.vipRepo.getConfigByLevel(level)
      if (config) {
        await this.vipRepo.upgradeUserVip(order.userId, level, config.duration)
      }
    }

    // 更新订单状态为已完成
    await this.orderRepo.updateStatus(orderId, OrderStatus.COMPLETED)
  }

  // ========== 私有方法 ==========

  /**
   * 计算订单金额
   */
  private async calculateAmount(serviceType: string, serviceId: string): Promise<number> {
    switch (serviceType) {
      case 'vip': {
        const level = parseInt(serviceId, 10)
        const config = await this.vipRepo.getConfigByLevel(level)
        return config?.price || 0
      }
      case 'divination': {
        // 占卜服务定价
        const prices: Record<string, number> = {
          bazi: 0, // 免费
          qimen: 9900, // ¥99
          bagua: 0,
          meihua: 0,
        }
        return prices[serviceId] || 0
      }
      case 'consultation': {
        // 咨询服务定价
        return 19900 // ¥199
      }
      default:
        return 0
    }
  }

  /**
   * 获取服务名称
   */
  private getServiceName(serviceType: string, serviceId: string): string {
    const names: Record<string, Record<string, string>> = {
      vip: {
        '1': '月度会员',
        '2': '年度会员',
        '3': '终身会员',
      },
      divination: {
        bazi: '八字排盘',
        qimen: '奇门遁甲',
        bagua: '八卦测算',
        meihua: '梅花易数',
      },
      consultation: {
        default: '命理咨询',
      },
    }

    return names[serviceType]?.[serviceId] || names[serviceType]?.default || '未知服务'
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: OrderStatus): string {
    const texts: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: '待支付',
      [OrderStatus.PAID]: '已支付',
      [OrderStatus.COMPLETED]: '已完成',
      [OrderStatus.REFUNDED]: '已退款',
      [OrderStatus.EXPIRED]: '已过期',
      [OrderStatus.CANCELLED]: '已取消',
    }
    return texts[status] || '未知状态'
  }

  /**
   * 获取支付渠道文本
   */
  private getChannelText(channel: PaymentChannel): string {
    const texts: Record<PaymentChannel, string> = {
      [PaymentChannel.WECHAT]: '微信支付',
      [PaymentChannel.ALIPAY]: '支付宝',
    }
    return texts[channel] || '未知渠道'
  }

  /**
   * 获取支付状态文本
   */
  private getPaymentStatusText(status: string): string {
    const texts: Record<string, string> = {
      pending: '待支付',
      success: '支付成功',
      failed: '支付失败',
      refunded: '已退款',
    }
    return texts[status] || '未知状态'
  }

  /**
   * 格式化订单详情
   */
  private async formatOrderDetail(order: any, payments?: any[]): Promise<OrderDetailDto> {
    const now = new Date()
    const expiredAt = order.expiredAt || new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000)
    
    return {
      id: order.id,
      orderNo: order.orderNo,
      userId: order.userId,
      serviceType: order.serviceType,
      serviceId: order.serviceId,
      serviceName: this.getServiceName(order.serviceType, order.serviceId),
      amount: order.amount,
      amountYuan: (order.amount / 100).toFixed(2),
      status: order.status,
      statusText: this.getStatusText(order.status),
      paidAt: order.paidAt,
      expiredAt,
      isExpired: order.status === OrderStatus.PENDING && now > expiredAt,
      createdAt: order.createdAt,
      payments: payments?.map(p => ({
        paymentId: p.paymentId,
        channel: p.channel,
        channelText: this.getChannelText(p.channel),
        amount: p.amount,
        status: p.status,
        statusText: this.getPaymentStatusText(p.status),
        paidAt: p.paidAt,
      })),
    }
  }
}

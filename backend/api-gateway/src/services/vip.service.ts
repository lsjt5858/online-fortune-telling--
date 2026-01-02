import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { VipRepository, VipConfig, OrderRepository, UserRepository } from '@shared/repositories'
import { OrderStatus } from '@shared/types'

@Injectable()
export class VipService {
  constructor(
    private readonly vipRepo: VipRepository,
    private readonly orderRepo: OrderRepository,
    private readonly userRepo: UserRepository,
  ) {}

  /**
   * 获取 VIP 配置列表
   */
  async getConfigs(): Promise<VipConfig[]> {
    return this.vipRepo.getConfigs()
  }

  /**
   * 获取用户 VIP 状态
   */
  async getStatus(userId: string) {
    return this.vipRepo.getUserVipStatus(userId)
  }

  /**
   * 购买 VIP（创建订单）
   */
  async purchase(userId: string, level: number): Promise<{ orderId: string; orderNo: string; amount: number }> {
    // 获取 VIP 配置
    const config = await this.vipRepo.getConfigByLevel(level)
    if (!config) {
      throw new NotFoundException('VIP 等级不存在')
    }

    // 检查用户当前 VIP 状态
    const currentStatus = await this.vipRepo.getUserVipStatus(userId)
    if (currentStatus.level >= level && currentStatus.isVip) {
      throw new BadRequestException('您已是该等级或更高等级的 VIP')
    }

    // 创建订单
    const order = await this.orderRepo.create({
      userId,
      serviceType: 'vip',
      serviceId: level.toString(),
      amount: config.price,
    })

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      amount: config.price,
    }
  }

  /**
   * 激活 VIP（支付成功后调用）
   */
  async activateVip(orderId: string): Promise<void> {
    // 获取订单
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new NotFoundException('订单不存在')
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('订单状态异常')
    }

    if (order.serviceType !== 'vip') {
      throw new BadRequestException('非 VIP 订单')
    }

    // 获取 VIP 配置
    const level = parseInt(order.serviceId, 10)
    const config = await this.vipRepo.getConfigByLevel(level)
    if (!config) {
      throw new NotFoundException('VIP 配置不存在')
    }

    // 升级用户 VIP
    await this.vipRepo.upgradeUserVip(order.userId, level, config.duration)

    // 更新订单状态为已完成
    await this.orderRepo.updateStatus(orderId, OrderStatus.COMPLETED)
  }

  /**
   * 获取 VIP 权益说明
   */
  async getBenefits(level: number): Promise<{ name: string; benefits: string[] } | null> {
    const config = await this.vipRepo.getConfigByLevel(level)
    if (!config) {
      return null
    }

    return {
      name: config.name,
      benefits: config.benefits,
    }
  }

  /**
   * 手动激活 VIP（用于测试或管理后台）
   */
  async manualActivate(orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.activateVip(orderId)
      return { success: true, message: 'VIP 激活成功' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

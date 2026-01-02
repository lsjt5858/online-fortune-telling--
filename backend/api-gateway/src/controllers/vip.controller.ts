import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common'
import { IsNumber, Min, Max } from 'class-validator'
import { Public } from '../decorators/public.decorator'
import { VipService } from '../services/vip.service'

export class PurchaseVipDto {
  @IsNumber()
  @Min(1)
  @Max(3)
  level: number
}

@Controller('v1/vip')
export class VipController {
  constructor(private readonly vipService: VipService) {}

  /**
   * 获取 VIP 配置列表（公开接口）
   */
  @Public()
  @Get('config')
  async getConfigs() {
    const configs = await this.vipService.getConfigs()
    return configs.map(config => ({
      level: config.level,
      name: config.name,
      price: config.price,
      priceYuan: (config.price / 100).toFixed(2),
      duration: config.duration,
      durationText: config.duration === 0 ? '永久' : `${config.duration}天`,
      benefits: config.benefits,
    }))
  }

  /**
   * 获取用户 VIP 状态
   */
  @Get('status')
  async getStatus(@Request() req) {
    return this.vipService.getStatus(req.user.userId)
  }

  /**
   * 购买 VIP（创建订单）
   */
  @Post('purchase')
  async purchase(@Request() req, @Body() dto: PurchaseVipDto) {
    return this.vipService.purchase(req.user.userId, dto.level)
  }

  /**
   * 获取 VIP 权益说明
   */
  @Public()
  @Get('benefits/:level')
  async getBenefits(@Param('level') level: string) {
    return this.vipService.getBenefits(parseInt(level, 10))
  }

  /**
   * 激活 VIP（支付成功后调用）
   */
  @Post('activate/:orderId')
  async activate(@Request() req, @Param('orderId') orderId: string) {
    return this.vipService.manualActivate(orderId)
  }
}

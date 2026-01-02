import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common'
import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator'
import { OrderService } from '../services/order.service'
import { OrderStatus } from '@shared/types'

// DTO 定义
export class CreateOrderDto {
  @IsEnum(['vip', 'divination', 'consultation'])
  serviceType: 'vip' | 'divination' | 'consultation'

  @IsString()
  serviceId: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number
}

@Controller('v1/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 创建订单
   * POST /api/v1/order/create
   */
  @Post('create')
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder({
      userId: req.user.userId,
      serviceType: dto.serviceType,
      serviceId: dto.serviceId,
      amount: dto.amount,
    })
  }

  /**
   * 获取订单详情（通过订单ID）
   * GET /api/v1/order/:orderId
   */
  @Get(':orderId')
  async getOrderDetail(@Request() req, @Param('orderId') orderId: string) {
    return this.orderService.getOrderDetail(orderId, req.user.userId)
  }

  /**
   * 根据订单号获取订单详情
   * GET /api/v1/order/no/:orderNo
   */
  @Get('no/:orderNo')
  async getOrderByNo(@Request() req, @Param('orderNo') orderNo: string) {
    return this.orderService.getOrderByNo(orderNo, req.user.userId)
  }

  /**
   * 获取用户订单列表
   * GET /api/v1/order/list
   */
  @Get()
  async getUserOrders(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('status') status?: OrderStatus,
  ) {
    return this.orderService.getUserOrders(
      req.user.userId,
      { page, pageSize },
      status,
    )
  }

  /**
   * 取消订单
   * POST /api/v1/order/:orderId/cancel
   */
  @Post(':orderId/cancel')
  async cancelOrder(@Request() req, @Param('orderId') orderId: string) {
    return this.orderService.cancelOrder(orderId, req.user.userId)
  }
}

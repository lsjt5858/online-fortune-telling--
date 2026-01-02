import { Module } from '@nestjs/common'
import { OrderController } from '../controllers/order.controller'
import { OrderService } from '../services/order.service'
import { OrderRepository, PaymentRepository, VipRepository } from '@shared/repositories'
import { DatabaseService } from '@pkg/database'

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    PaymentRepository,
    VipRepository,
    DatabaseService,
  ],
  exports: [OrderService],
})
export class OrderModule {}

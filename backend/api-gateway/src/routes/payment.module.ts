import { Module } from '@nestjs/common'
import { PaymentController } from '../controllers/payment.controller'
import { PaymentService } from '../services/payment.service'
import { PaymentRepository } from '@shared/repositories/payment.repository'
import { OrderRepository } from '@shared/repositories/order.repository'
import { VipRepository } from '@shared/repositories/vip.repository'
import { DatabaseService } from '@pkg/database'

@Module({
    controllers: [PaymentController],
    providers: [
        PaymentService,
        PaymentRepository,
        OrderRepository,
        VipRepository,
        DatabaseService,
    ],
    exports: [PaymentService],
})
export class PaymentModule { }

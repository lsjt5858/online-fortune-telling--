import { Module } from '@nestjs/common'
import { VipController } from '../controllers/vip.controller'
import { VipService } from '../services/vip.service'
import { VipRepository, OrderRepository, UserRepository } from '@shared/repositories'
import { DatabaseService } from '@pkg/database'

@Module({
  controllers: [VipController],
  providers: [
    VipService,
    VipRepository,
    OrderRepository,
    UserRepository,
    DatabaseService,
  ],
  exports: [VipService],
})
export class VipModule {}

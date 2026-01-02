import { Module } from '@nestjs/common'
import { DivinationController } from '../controllers/divination.controller'
import { DivinationService } from '../services/divination.service'
import { DivinationRepository, UserRepository } from '@shared/repositories'
import { DatabaseService } from '@pkg/database'

@Module({
  controllers: [DivinationController],
  providers: [
    DivinationService,
    DivinationRepository,
    UserRepository,
    DatabaseService,
  ],
  exports: [DivinationService],
})
export class DivinationModule {}

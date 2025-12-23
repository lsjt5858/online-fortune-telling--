import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from '../controllers/auth.controller'
import { AuthService, JwtService } from '../services/auth.service'
import { JwtStrategy } from '../strategies/jwt.strategy'
import { DatabaseService } from '@pkg/database'
import { UserRepository, SmsRepository, RefreshTokenRepository } from '@shared/repositories'
import { jwtConfig } from '@shared/config'
import 'reflect-metadata'

// 配置依赖注入容器
import { container } from 'tsyringe'

// 注册服务到依赖注入容器
container.registerSingleton(DatabaseService)
container.registerSingleton(UserRepository)
container.registerSingleton(SmsRepository)
container.registerSingleton(RefreshTokenRepository)

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy],
  exports: [AuthService, JwtService],
})
export class AuthModule {}

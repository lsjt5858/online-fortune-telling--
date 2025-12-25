import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from '../controllers/auth.controller'
import { AuthService } from '../services/auth.service'
import { JwtService } from '../services/jwt.service'
import { JwtStrategy } from '../strategies/jwt.strategy'
import { DatabaseService } from '@pkg/database'
import { UserRepository, SmsRepository, RefreshTokenRepository } from '@shared/repositories'
import { jwtConfig } from '@shared/config'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    DatabaseService,
    UserRepository,
    SmsRepository,
    RefreshTokenRepository,
  ],
  exports: [AuthService, JwtService],
})
export class AuthModule {}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'

import { AppController } from './controllers/app.controller'
import { ThrottlerGuard } from './guards/throttler.guard'
import { AuthGuard } from './guards/auth.guard'
import { HttpExceptionFilter } from './filters/http-exception.filter'
import { TransformInterceptor } from './interceptors/transform.interceptor'
import { LoggingInterceptor } from './interceptors/logging.interceptor'

// 认证路由模块
import { AuthModule } from './routes/auth.module'
import { PaymentModule } from './routes/payment.module'
import { DivinationModule } from './routes/divination.module'
import { VipModule } from './routes/vip.module'

// 数据库服务
import { DatabaseService } from '@pkg/database'

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // 限流模块
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // 路由模块
    AuthModule,
    PaymentModule,
    DivinationModule,
    VipModule,
  ],
  controllers: [AppController],
  providers: [
    // 数据库服务
    DatabaseService,

    // 全局守卫
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },

    // 全局过滤器和拦截器
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
  exports: [DatabaseService],
})
export class AppModule { }

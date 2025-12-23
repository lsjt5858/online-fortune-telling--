import { Injectable } from '@nestjs/common'
import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  protected errorMessage = '请求过于频繁，请稍后再试'
}

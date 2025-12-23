import { Controller, Post, Body, Get, Request, HttpCode, HttpStatus } from '@nestjs/common'
import { Public } from '../decorators/public.decorator'
import { AuthService } from '../services/auth.service'
import { UserInfo, TokenPair } from '@shared/types'

export class SendSmsDto {
  phone: string
}

export class LoginWithPhoneDto {
  phone: string
  code: string
}

export class LoginWithWechatDto {
  code: string
}

export class RefreshTokenDto {
  refreshToken: string
}

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  async sendSms(@Body() dto: SendSmsDto) {
    return this.authService.sendSmsCode(dto.phone)
  }

  @Public()
  @Post('login/phone')
  async loginWithPhone(@Body() dto: LoginWithPhoneDto) {
    const result = await this.authService.loginWithPhone(dto.phone, dto.code)
    return {
      accessToken: result.tokenPair.accessToken,
      refreshToken: result.tokenPair.refreshToken,
      expiresIn: result.tokenPair.expiresIn,
      userInfo: result.userInfo,
    }
  }

  @Public()
  @Post('login/wechat')
  async loginWithWechat(@Body() dto: LoginWithWechatDto) {
    const result = await this.authService.loginWithWechat(dto.code)
    return {
      accessToken: result.tokenPair.accessToken,
      refreshToken: result.tokenPair.refreshToken,
      expiresIn: result.tokenPair.expiresIn,
      userInfo: result.userInfo,
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Body() body: { refreshToken: string }) {
    await this.authService.logout(req.user.userId, body.refreshToken)
    return { success: true }
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const tokenPair = await this.authService.refreshTokens(dto.refreshToken)
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn,
    }
  }

  @Get('user-info')
  async getUserInfo(@Request() req) {
    return this.authService.getUserInfo(req.user.userId)
  }
}

import { Controller, Post, Body, Get, Request, HttpCode, HttpStatus } from '@nestjs/common'
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator'
import { Public } from '../decorators/public.decorator'
import { AuthService } from '../services/auth.service'

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
  phone: string
}

export class LoginWithPhoneDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号' })
  phone: string

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: '验证码为6位数字' })
  code: string
}

export class LoginWithWechatDto {
  @IsString()
  @IsNotEmpty()
  code: string
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
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

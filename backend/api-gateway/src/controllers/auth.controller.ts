import { Controller, Post, Body } from '@nestjs/common'
import { Public } from '../decorators/public.decorator'

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

@Controller('v1/auth')
export class AuthController {
  @Public()
  @Post('sms/send')
  sendSms(@Body() dto: SendSmsDto) {
    // TODO: 调用短信服务
    return {
      expireIn: 300,
    }
  }

  @Public()
  @Post('login/phone')
  loginWithPhone(@Body() dto: LoginWithPhoneDto) {
    // TODO: 调用用户服务
    return {
      token: 'jwt_token',
      refreshToken: 'refresh_token',
      userInfo: {
        id: '1',
        phone: dto.phone,
        nickname: '用户',
        avatar: '',
        vipLevel: 0,
        vipExpireAt: null,
        points: 0,
        createdAt: new Date().toISOString(),
      },
    }
  }

  @Public()
  @Post('login/wechat')
  loginWithWechat(@Body() dto: LoginWithWechatDto) {
    // TODO: 调用微信登录
    return {
      token: 'jwt_token',
      refreshToken: 'refresh_token',
      userInfo: {
        id: '1',
        phone: '',
        nickname: '微信用户',
        avatar: '',
        vipLevel: 0,
        vipExpireAt: null,
        points: 0,
        createdAt: new Date().toISOString(),
      },
    }
  }

  @Post('logout')
  logout() {
    // TODO: 清除 token
    return { success: true }
  }

  @Post('refresh')
  refreshToken(@Body() body: { refreshToken: string }) {
    // TODO: 刷新 token
    return {
      token: 'new_jwt_token',
    }
  }
}

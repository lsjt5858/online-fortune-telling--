import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface WechatUserInfo {
  openid: string
  unionid?: string
  nickname: string
  headimgurl: string
  sex: number
  province: string
  city: string
  country: string
}

export interface WechatAccessToken {
  access_token: string
  expires_in: number
  refresh_token: string
  openid: string
  scope: string
  unionid?: string
}

@Injectable()
export class WechatService {
  private readonly mpAppId: string
  private readonly mpAppSecret: string
  private readonly openAppId: string
  private readonly openAppSecret: string

  constructor(private readonly configService: ConfigService) {
    this.mpAppId = this.configService.get<string>('WECHAT_MP_APP_ID', '')
    this.mpAppSecret = this.configService.get<string>('WECHAT_MP_APP_SECRET', '')
    this.openAppId = this.configService.get<string>('WECHAT_OPEN_APP_ID', '')
    this.openAppSecret = this.configService.get<string>('WECHAT_OPEN_APP_SECRET', '')
  }

  /**
   * 通过授权码获取用户信息 (公众号)
   */
  async getUserInfoByMpCode(code: string): Promise<WechatUserInfo> {
    const tokenData = await this.getAccessTokenByCode(code, this.mpAppId, this.mpAppSecret)
    return this.getUserInfo(tokenData.access_token, tokenData.openid)
  }

  /**
   * 通过授权码获取用户信息 (开放平台)
   */
  async getUserInfoByOpenCode(code: string): Promise<WechatUserInfo> {
    const tokenData = await this.getAccessTokenByCode(code, this.openAppId, this.openAppSecret)
    return this.getUserInfo(tokenData.access_token, tokenData.openid)
  }

  /**
   * 通过 code 获取 access_token
   */
  private async getAccessTokenByCode(
    code: string,
    appId: string,
    appSecret: string,
  ): Promise<WechatAccessToken> {
    try {
      const url = 'https://api.weixin.qq.com/sns/oauth2/access_token'
      const response = await axios.get<WechatAccessToken & { errcode?: number; errmsg?: string }>(url, {
        params: {
          appid: appId,
          secret: appSecret,
          code,
          grant_type: 'authorization_code',
        },
      })

      if (response.data.errcode) {
        console.error('微信获取access_token失败:', response.data)
        throw new UnauthorizedException('微信授权失败，请重试')
      }

      return response.data
    } catch (error) {
      console.error('微信API调用失败:', error)
      throw new UnauthorizedException('微信授权失败，请重试')
    }
  }

  /**
   * 获取用户信息
   */
  private async getUserInfo(accessToken: string, openid: string): Promise<WechatUserInfo> {
    try {
      const url = 'https://api.weixin.qq.com/sns/userinfo'
      const response = await axios.get<WechatUserInfo & { errcode?: number; errmsg?: string }>(url, {
        params: {
          access_token: accessToken,
          openid,
          lang: 'zh_CN',
        },
      })

      if (response.data.errcode) {
        console.error('微信获取用户信息失败:', response.data)
        throw new UnauthorizedException('获取微信用户信息失败')
      }

      return response.data
    } catch (error) {
      console.error('微信API调用失败:', error)
      throw new UnauthorizedException('获取微信用户信息失败')
    }
  }

  /**
   * 判断是否为公众号授权码 (简单判断，实际可能需要更复杂的逻辑)
   */
  isMpCode(code: string): boolean {
    // 可以通过前端传递的额外参数来判断
    // 这里简单返回 true，实际使用时需要根据业务逻辑调整
    return true
  }
}

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { nanoid } from 'nanoid'
import { UserRepository, SmsRepository, RefreshTokenRepository } from '@shared/repositories'
import { JwtService, TokenPair } from './jwt.service'
import { UserInfo } from '@shared/types'

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly smsRepo: SmsRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async sendSmsCode(phone: string): Promise<{ expireIn: number }> {
    // 检查是否可以发送（60秒间隔）
    const canSend = await this.smsRepo.canSendSms(phone, 60)
    if (!canSend) {
      throw new ConflictException('验证码发送过于频繁，请稍后再试')
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 保存验证码，5分钟有效
    await this.smsRepo.saveCode(phone, code, 300)

    // TODO: 调用短信服务发送验证码
    console.log(`[SMS] 发送验证码到 ${phone}: ${code}`)

    return { expireIn: 300 }
  }

  async loginWithPhone(phone: string, code: string): Promise<{ tokenPair: TokenPair; userInfo: UserInfo }> {
    // 验证验证码
    const isValid = await this.smsRepo.verifyCode(phone, code)
    if (!isValid) {
      throw new UnauthorizedException('验证码无效或已过期')
    }

    // 查找或创建用户
    let user = await this.userRepo.findByPhone(phone)
    if (!user) {
      user = await this.userRepo.create({ phone, nickname: this.generateNickname() })
    }

    // 生成token
    const tokenPair = await this.jwtService.generateTokens(user)

    // 保存refresh token
    const refreshTokenExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天
    await this.refreshTokenRepo.save(user.id, tokenPair.refreshToken, refreshTokenExpireAt)

    return { tokenPair, userInfo: user }
  }

  async loginWithWechat(code: string): Promise<{ tokenPair: TokenPair; userInfo: UserInfo }> {
    // TODO: 调用微信API获取用户信息
    // const wechatUserInfo = await this.getWechatUserInfo(code)

    // 模拟微信返回数据
    const mockWechatUser = {
      openid: `wx_${nanoid(20)}`,
      unionid: null,
      nickname: '微信用户',
      avatar: '',
    }

    // 查找或创建用户
    let user = await this.userRepo.findByOpenid(mockWechatUser.openid)
    if (!user) {
      user = await this.userRepo.create({
        openid: mockWechatUser.openid,
        unionid: mockWechatUser.unionid,
        nickname: mockWechatUser.nickname,
        avatar: mockWechatUser.avatar,
      })
    }

    // 生成token
    const tokenPair = await this.jwtService.generateTokens(user)

    // 保存refresh token
    const refreshTokenExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await this.refreshTokenRepo.save(user.id, tokenPair.refreshToken, refreshTokenExpireAt)

    return { tokenPair, userInfo: user }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // 验证refresh token
    const payload = await this.jwtService.verifyRefreshToken(refreshToken)

    // 检查token是否存在数据库中
    const userId = await this.refreshTokenRepo.findUserId(refreshToken)
    if (!userId || userId !== payload.sub) {
      throw new UnauthorizedException('无效的refresh token')
    }

    // 获取用户信息
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    // 生成新的token对
    const tokenPair = await this.jwtService.generateTokens(user)

    // 删除旧的refresh token，保存新的
    await this.refreshTokenRepo.delete(refreshToken)
    const refreshTokenExpireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await this.refreshTokenRepo.save(user.id, tokenPair.refreshToken, refreshTokenExpireAt)

    return tokenPair
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.refreshTokenRepo.delete(refreshToken)
    // TODO: 可选：将access token加入黑名单（使用Redis）
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }
    return user
  }

  private generateNickname(): string {
    const adjectives = ['快乐', '幸运', '聪明', '勇敢', '善良', '神秘', '智慧', '优雅']
    const nouns = ['星星', '月亮', '太阳', '风', '云', '雨', '雪', '彩虹']
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const num = Math.floor(Math.random() * 1000)
    return `${adj}${noun}${num}`
  }
}

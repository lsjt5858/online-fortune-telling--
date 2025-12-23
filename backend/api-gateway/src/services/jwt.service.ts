import { Injectable } from '@nestjs/common'
import { JwtService as NestJwtService } from '@nestjs/jwt'
import { jwtConfig } from '@shared/config'
import { UserInfo } from '@shared/types'

export interface JwtPayload {
  sub: string
  phone?: string
  openid?: string
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  async generateTokens(user: UserInfo): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      openid: user.openid,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: jwtConfig.expiresIn,
      }),
      this.generateRefreshToken(user.id),
    ])

    const expiresIn = this.parseExpiresIn(jwtConfig.expiresIn)

    return {
      accessToken,
      refreshToken,
      expiresIn,
    }
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token)
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const payload = { sub: userId, type: 'refresh' }
    return this.jwtService.signAsync(payload, {
      expiresIn: jwtConfig.refreshExpiresIn,
      secret: jwtConfig.secret + '-refresh',
    })
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string }> {
    return this.jwtService.verifyAsync<{ sub: string }>(token, {
      secret: jwtConfig.secret + '-refresh',
    })
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1)
    const value = parseInt(expiresIn.slice(0, -1))

    switch (unit) {
      case 's':
        return value
      case 'm':
        return value * 60
      case 'h':
        return value * 3600
      case 'd':
        return value * 86400
      default:
        return 86400 // 默认1天
    }
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) return null
    const [type, token] = authHeader.split(' ')
    return type === 'Bearer' ? token : null
  }
}

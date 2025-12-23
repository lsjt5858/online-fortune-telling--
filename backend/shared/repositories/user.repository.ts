import { injectable } from 'tsyringe'
import { DatabaseService } from '@pkg/database'
import { UserInfo } from '@shared/types'

export interface CreateUserDto {
  phone?: string
  openid?: string
  unionid?: string
  nickname?: string
  avatar?: string
}

export interface UpdateUserDto {
  nickname?: string
  avatar?: string
  vipLevel?: number
  vipExpireAt?: Date | null
  points?: number
}

@injectable()
export class UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<UserInfo | null> {
    const row = await this.db.queryOne<any>(
      `SELECT id, phone, openid, nickname, avatar, vip_level as "vipLevel",
              vip_expire_at as "vipExpireAt", points, created_at as "createdAt"
       FROM users WHERE id = $1`,
      [id]
    )
    return row || null
  }

  async findByPhone(phone: string): Promise<UserInfo | null> {
    const row = await this.db.queryOne<any>(
      `SELECT id, phone, openid, nickname, avatar, vip_level as "vipLevel",
              vip_expire_at as "vipExpireAt", points, created_at as "createdAt"
       FROM users WHERE phone = $1`,
      [phone]
    )
    return row || null
  }

  async findByOpenid(openid: string): Promise<UserInfo | null> {
    const row = await this.db.queryOne<any>(
      `SELECT id, phone, openid, nickname, avatar, vip_level as "vipLevel",
              vip_expire_at as "vipExpireAt", points, created_at as "createdAt"
       FROM users WHERE openid = $1`,
      [openid]
    )
    return row || null
  }

  async create(dto: CreateUserDto): Promise<UserInfo> {
    const row = await this.db.queryOne<any>(
      `INSERT INTO users (phone, openid, unionid, nickname, avatar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, phone, openid, nickname, avatar, vip_level as "vipLevel",
                 vip_expire_at as "vipExpireAt", points, created_at as "createdAt"`,
      [dto.phone || null, dto.openid || null, dto.unionid || null, dto.nickname || '用户', dto.avatar || '']
    )
    return row
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserInfo> {
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (dto.nickname !== undefined) {
      updates.push(`nickname = $${paramIndex++}`)
      values.push(dto.nickname)
    }
    if (dto.avatar !== undefined) {
      updates.push(`avatar = $${paramIndex++}`)
      values.push(dto.avatar)
    }
    if (dto.vipLevel !== undefined) {
      updates.push(`vip_level = $${paramIndex++}`)
      values.push(dto.vipLevel)
    }
    if (dto.vipExpireAt !== undefined) {
      updates.push(`vip_expire_at = $${paramIndex++}`)
      values.push(dto.vipExpireAt)
    }
    if (dto.points !== undefined) {
      updates.push(`points = $${paramIndex++}`)
      values.push(dto.points)
    }

    values.push(id)

    const row = await this.db.queryOne<any>(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, phone, openid, nickname, avatar, vip_level as "vipLevel",
                 vip_expire_at as "vipExpireAt", points, created_at as "createdAt"`,
      values
    )
    return row
  }

  async addPoints(id: string, points: number): Promise<UserInfo> {
    const row = await this.db.queryOne<any>(
      `UPDATE users
       SET points = points + $1
       WHERE id = $2
       RETURNING id, phone, openid, nickname, avatar, vip_level as "vipLevel",
                 vip_expire_at as "vipExpireAt", points, created_at as "createdAt"`,
      [points, id]
    )
    return row
  }

  async isVip(userId: string): Promise<boolean> {
    const row = await this.db.queryOne<{ is_vip: boolean }>(
      `SELECT (vip_level > 0 AND vip_expire_at > CURRENT_TIMESTAMP) as is_vip
       FROM users WHERE id = $1`,
      [userId]
    )
    return row?.is_vip || false
  }
}

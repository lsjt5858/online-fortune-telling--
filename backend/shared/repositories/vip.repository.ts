import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@pkg/database'

export interface VipConfig {
  id: number
  level: number
  name: string
  price: number
  duration: number
  benefits: string[]
  isActive: boolean
}

@Injectable()
export class VipRepository {
  constructor(private readonly db: DatabaseService) {}

  async getConfigs(): Promise<VipConfig[]> {
    const rows = await this.db.query<any>(
      `SELECT id, level, name, price, duration, benefits, is_active as "isActive"
       FROM vip_configs
       WHERE is_active = TRUE
       ORDER BY level ASC`
    )
    return rows
  }

  async getConfigByLevel(level: number): Promise<VipConfig | null> {
    const row = await this.db.queryOne<any>(
      `SELECT id, level, name, price, duration, benefits, is_active as "isActive"
       FROM vip_configs
       WHERE level = $1 AND is_active = TRUE`,
      [level]
    )
    return row || null
  }

  async upgradeUserVip(userId: string, level: number, duration: number): Promise<void> {
    if (duration === 0) {
      // 终身会员
      await this.db.query(
        `UPDATE users
         SET vip_level = $1, vip_expire_at = '2099-12-31'::timestamp
         WHERE id = $2`,
        [level, userId]
      )
    } else {
      // 有期限会员
      await this.db.query(
        `UPDATE users
         SET vip_level = $1,
             vip_expire_at = GREATEST(COALESCE(vip_expire_at, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP) + INTERVAL '1 day' * $2
         WHERE id = $3`,
        [level, duration, userId]
      )
    }
  }

  async getUserVipStatus(userId: string): Promise<{
    isVip: boolean
    level: number
    expireAt: string | null
    levelName: string | null
  }> {
    const row = await this.db.queryOne<any>(
      `SELECT u.vip_level as level,
              u.vip_expire_at as "expireAt",
              v.name as "levelName",
              (u.vip_level > 0 AND u.vip_expire_at > CURRENT_TIMESTAMP) as "isVip"
       FROM users u
       LEFT JOIN vip_configs v ON u.vip_level = v.level
       WHERE u.id = $1`,
      [userId]
    )

    return {
      isVip: row?.isVip || false,
      level: row?.level || 0,
      expireAt: row?.expireAt || null,
      levelName: row?.levelName || null,
    }
  }
}

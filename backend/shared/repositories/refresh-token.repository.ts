import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@pkg/database'

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly db: DatabaseService) {}

  async save(userId: string, token: string, expireAt: Date): Promise<void> {
    await this.db.query(
      `INSERT INTO refresh_tokens (user_id, token, expire_at) VALUES ($1, $2, $3)`,
      [userId, token, expireAt]
    )
  }

  async findUserId(token: string): Promise<string | null> {
    const row = await this.db.queryOne<{ user_id: string }>(
      `SELECT user_id FROM refresh_tokens
       WHERE token = $1 AND expire_at > CURRENT_TIMESTAMP`,
      [token]
    )
    return row?.user_id || null
  }

  async delete(token: string): Promise<void> {
    await this.db.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token])
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.db.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId])
  }

  async cleanupExpired(): Promise<void> {
    await this.db.query(`DELETE FROM refresh_tokens WHERE expire_at < CURRENT_TIMESTAMP`)
  }
}

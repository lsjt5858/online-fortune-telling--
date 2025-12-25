import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@pkg/database'

@Injectable()
export class SmsRepository {
  constructor(private readonly db: DatabaseService) {}

  async saveCode(phone: string, code: string, expireInSeconds: number = 300): Promise<void> {
    const expireAt = new Date(Date.now() + expireInSeconds * 1000)
    await this.db.query(
      `INSERT INTO sms_codes (phone, code, expire_at) VALUES ($1, $2, $3)`,
      [phone, code, expireAt]
    )
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    const row = await this.db.queryOne<any>(
      `SELECT id FROM sms_codes
       WHERE phone = $1 AND code = $2 AND used = FALSE AND expire_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [phone, code]
    )

    if (row) {
      // 标记为已使用
      await this.db.query(
        `UPDATE sms_codes SET used = TRUE WHERE id = $1`,
        [row.id]
      )
      return true
    }
    return false
  }

  async canSendSms(phone: string, intervalSeconds: number = 60): Promise<boolean> {
    const row = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM sms_codes
       WHERE phone = $1 AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 second' * $2`,
      [phone, intervalSeconds]
    )
    return row.count === 0
  }

  async cleanupExpired(): Promise<void> {
    await this.db.query(
      `DELETE FROM sms_codes WHERE expire_at < CURRENT_TIMESTAMP - INTERVAL '1 day'`
    )
  }
}

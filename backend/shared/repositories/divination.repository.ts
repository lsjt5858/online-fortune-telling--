import { injectable } from 'tsyringe'
import { DatabaseService } from '@pkg/database'
import { DivinationType, DivinationResult, PaginationParams, PaginationResponse } from '@shared/types'

@injectable()
export class DivinationRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    userId: string,
    type: DivinationType,
    inputData: any,
    resultData: Record<string, unknown>,
    isVip: boolean
  ): Promise<DivinationResult> {
    const row = await this.db.queryOne<any>(
      `INSERT INTO divinations (user_id, type, input_data, result_data, is_vip)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id as "userId", type, input_data as "inputData",
                 result_data as "resultData", is_vip as "isVip",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, type, JSON.stringify(inputData), JSON.stringify(resultData), isVip]
    )
    return row
  }

  async findById(id: string): Promise<DivinationResult | null> {
    const row = await this.db.queryOne<any>(
      `SELECT id, user_id as "userId", type, input_data as "inputData",
              result_data as "resultData", is_vip as "isVip",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM divinations WHERE id = $1`,
      [id]
    )
    return row || null
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginationResponse<DivinationResult>> {
    const offset = (pagination.page - 1) * pagination.pageSize

    const [rows, countRow] = await Promise.all([
      this.db.query<any>(
        `SELECT id, user_id as "userId", type, input_data as "inputData",
                result_data as "resultData", is_vip as "isVip",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM divinations
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, pagination.pageSize, offset]
      ),
      this.db.queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM divinations WHERE user_id = $1`,
        [userId]
      ),
    ])

    return {
      list: rows,
      total: parseInt(countRow.count),
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  async getUserFreeCount(userId: string, type: DivinationType): Promise<number> {
    const row = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM divinations
       WHERE user_id = $1 AND type = $2 AND is_vip = FALSE
       AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 day'`,
      [userId, type]
    )
    return row.count
  }
}

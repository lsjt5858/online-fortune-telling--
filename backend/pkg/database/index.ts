import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common'
import { Pool, PoolConfig } from 'pg'
import { databaseConfig } from '@shared/config'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name)
  private pool: Pool

  constructor() {
    const config: PoolConfig = {
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }

    this.pool = new Pool(config)

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected database error:', err)
    })

    this.pool.on('connect', () => {
      this.logger.log('Database connected successfully')
    })
  }

  async onModuleDestroy() {
    await this.pool.end()
    this.logger.log('Database connection closed')
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now()
    try {
      const result = await this.pool.query(text, params)
      const duration = Date.now() - start
      this.logger.debug(`Executed query (${duration}ms): ${text.substring(0, 100)}`)
      return result.rows
    } catch (error) {
      this.logger.error('Query error:', error)
      throw error
    }
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params)
    return rows.length > 0 ? rows[0] : null
  }

  getPool(): Pool {
    return this.pool
  }
}

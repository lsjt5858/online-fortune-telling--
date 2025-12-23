import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common'
import { createClient, RedisClientType } from 'redis'
import { redisConfig } from '@shared/config'

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name)
  private client: RedisClientType

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      password: redisConfig.password || undefined,
      database: redisConfig.db,
    })

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err)
    })

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully')
    })

    await this.client.connect()
  }

  async onModuleDestroy() {
    await this.client.quit()
  }

  // ========== 字符串操作 ==========
  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key)
    return result === 1
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl)
  }

  // ========== Hash 操作 ==========
  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hGet(key, field)
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hSet(key, field, value)
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hGetAll(key)
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hDel(key, field)
  }

  // ========== List 操作 ==========
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.client.lPush(key, values)
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.client.rPush(key, values)
  }

  async lpop(key: string): Promise<string | null> {
    return this.client.lPop(key)
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lRange(key, start, stop)
  }

  // ========== Set 操作 ==========
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sAdd(key, members)
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.sRem(key, members)
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.sMembers(key)
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sIsMember(key, member)
    return result
  }
}

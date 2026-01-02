import { Injectable } from '@nestjs/common'
import { DatabaseService } from '@pkg/database'
import { Order, OrderStatus, PaginationParams, PaginationResponse } from '@shared/types'

export interface CreateOrderDto {
  userId: string
  serviceType: string
  serviceId: string
  amount: number
  expireMinutes?: number
}

@Injectable()
export class OrderRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const orderNo = this.generateOrderNo()
    const expireMinutes = dto.expireMinutes || 30
    const expiredAt = new Date(Date.now() + expireMinutes * 60 * 1000)

    const row = await this.db.queryOne<any>(
      `INSERT INTO orders (order_no, user_id, service_type, service_id, amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, order_no as "orderNo", user_id as "userId", service_type as "serviceType",
                 service_id as "serviceId", amount, status, paid_at as "paidAt",
                 created_at as "createdAt"`,
      [orderNo, dto.userId, dto.serviceType, dto.serviceId, dto.amount]
    )
    return row
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.queryOne<any>(
      `SELECT id, order_no as "orderNo", user_id as "userId", service_type as "serviceType",
              service_id as "serviceId", amount, status, paid_at as "paidAt",
              created_at as "createdAt"
       FROM orders WHERE id = $1`,
      [id]
    )
    return row || null
  }

  async findByOrderNo(orderNo: string): Promise<Order | null> {
    const row = await this.db.queryOne<any>(
      `SELECT id, order_no as "orderNo", user_id as "userId", service_type as "serviceType",
              service_id as "serviceId", amount, status, paid_at as "paidAt",
              created_at as "createdAt"
       FROM orders WHERE order_no = $1`,
      [orderNo]
    )
    return row || null
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginationResponse<Order>> {
    const offset = (pagination.page - 1) * pagination.pageSize

    const [rows, countRow] = await Promise.all([
      this.db.query<any>(
        `SELECT id, order_no as "orderNo", user_id as "userId", service_type as "serviceType",
                service_id as "serviceId", amount, status, paid_at as "paidAt",
                created_at as "createdAt"
         FROM orders
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, pagination.pageSize, offset]
      ),
      this.db.queryOne<{ count: string }>(
        `SELECT COUNT(*) as count FROM orders WHERE user_id = $1`,
        [userId]
      ),
    ])

    return {
      list: rows,
      total: parseInt(countRow?.count || '0', 10),
      page: pagination.page,
      pageSize: pagination.pageSize,
    }
  }

  async updateStatus(id: string, status: OrderStatus, paidAt: Date | null = null): Promise<Order> {
    const row = await this.db.queryOne<any>(
      `UPDATE orders
       SET status = $2, paid_at = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, order_no as "orderNo", user_id as "userId", service_type as "serviceType",
                 service_id as "serviceId", amount, status, paid_at as "paidAt",
                 created_at as "createdAt"`,
      [id, status, paidAt]
    )
    return row
  }

  async markExpiredOrders(): Promise<void> {
    await this.db.query(
      `UPDATE orders SET status = 'expired' WHERE status = 'pending' AND expired_at < CURRENT_TIMESTAMP`
    )
  }

  generateOrderNo(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    return `ORD${timestamp}${random}`
  }
}

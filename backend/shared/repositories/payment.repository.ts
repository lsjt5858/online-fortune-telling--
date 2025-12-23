import { injectable } from 'tsyringe'
import { DatabaseService } from '@pkg/database'
import { Payment, PaymentChannel } from '@shared/types'

@injectable()
export class PaymentRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    paymentId: string,
    orderId: string,
    channel: PaymentChannel,
    amount: number
  ): Promise<Payment> {
    const row = await this.db.queryOne<any>(
      `INSERT INTO payments (payment_id, order_id, channel, amount)
       VALUES ($1, $2, $3, $4)
       RETURNING id, payment_id as "paymentId", order_id as "orderId", channel, amount,
                 status, transaction_id as "transactionId", paid_at as "paidAt",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [paymentId, orderId, channel, amount]
    )
    return row
  }

  async findByPaymentId(paymentId: string): Promise<Payment | null> {
    const row = await this.db.queryOne<any>(
      `SELECT id, payment_id as "paymentId", order_id as "orderId", channel, amount,
              status, transaction_id as "transactionId", paid_at as "paidAt",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM payments WHERE payment_id = $1`,
      [paymentId]
    )
    return row || null
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    const rows = await this.db.query<any>(
      `SELECT id, payment_id as "paymentId", order_id as "orderId", channel, amount,
              status, transaction_id as "transactionId", paid_at as "paidAt",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM payments WHERE order_id = $1`,
      [orderId]
    )
    return rows
  }

  async updateStatus(
    paymentId: string,
    status: string,
    transactionId: string | null = null
  ): Promise<Payment> {
    const row = await this.db.queryOne<any>(
      `UPDATE payments
       SET status = $2, transaction_id = $3, paid_at = CASE WHEN $2 = 'success' THEN CURRENT_TIMESTAMP ELSE paid_at END
       WHERE payment_id = $1
       RETURNING id, payment_id as "paymentId", order_id as "orderId", channel, amount,
                 status, transaction_id as "transactionId", paid_at as "paidAt",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [paymentId, status, transactionId]
    )
    return row
  }

  generatePaymentId(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')
    return `PAY${timestamp}${random}`
  }
}

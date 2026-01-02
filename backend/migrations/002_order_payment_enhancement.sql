-- 订单支付系统增强迁移脚本
-- 执行时间: 2026-01-02

-- 1. 为订单表添加过期时间字段
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP;

-- 更新现有订单的过期时间（创建时间 + 30分钟）
UPDATE orders 
SET expired_at = created_at + INTERVAL '30 minutes' 
WHERE expired_at IS NULL;

-- 设置默认值
ALTER TABLE orders ALTER COLUMN expired_at SET DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 minutes');

-- 添加过期时间索引
CREATE INDEX IF NOT EXISTS idx_orders_expired ON orders(expired_at);

-- 2. 为支付表添加 payment_id 字段（如果不存在）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE payments ADD COLUMN payment_id VARCHAR(50);
        
        -- 为现有记录生成 payment_id
        UPDATE payments 
        SET payment_id = 'PAY' || EXTRACT(EPOCH FROM created_at)::BIGINT || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
        WHERE payment_id IS NULL;
        
        -- 设置非空约束和唯一约束
        ALTER TABLE payments ALTER COLUMN payment_id SET NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
    END IF;
END $$;

-- 3. 添加支付状态索引
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 4. 添加 updated_at 字段到 payments 表
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 5. 创建自动更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 为订单表创建触发器
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. 为支付表创建触发器
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 添加退款记录表
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_no VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_id VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100),
    refunded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- 9. 为退款表创建触发器
DROP TRIGGER IF EXISTS update_refunds_updated_at ON refunds;
CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

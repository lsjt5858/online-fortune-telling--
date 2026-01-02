-- 神机妙算 数据库初始化脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== 用户表 ==========
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE,
    openid VARCHAR(100) UNIQUE,
    unionid VARCHAR(100),
    nickname VARCHAR(50) NOT NULL DEFAULT '用户',
    avatar TEXT DEFAULT '',
    vip_level SMALLINT NOT NULL DEFAULT 0,
    vip_expire_at TIMESTAMP,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_openid ON users(openid);

-- ========== 短信验证码表 ==========
CREATE TABLE IF NOT EXISTS sms_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    expire_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sms_codes_phone ON sms_codes(phone);
CREATE INDEX idx_sms_codes_expire ON sms_codes(expire_at);

-- ========== 刷新令牌表 ==========
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expire_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ========== 占卜记录表 ==========
CREATE TABLE IF NOT EXISTS divination_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB,
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_divination_user ON divination_records(user_id);
CREATE INDEX idx_divination_type ON divination_records(type);
CREATE INDEX idx_divination_created ON divination_records(created_at DESC);

-- ========== 订单表 ==========
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(20) NOT NULL,
    service_id VARCHAR(100),
    amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP,
    expired_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 minutes'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_expired ON orders(expired_at);

-- ========== 支付记录表 ==========
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100),
    amount INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    pay_info JSONB,
    callback_data JSONB,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ========== VIP 配置表 ==========
CREATE TABLE IF NOT EXISTS vip_configs (
    id SERIAL PRIMARY KEY,
    level SMALLINT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    benefits TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认 VIP 配置
INSERT INTO vip_configs (level, name, price, duration, benefits) VALUES
    (1, '月度会员', 2800, 30, ARRAY['无限次测算', '专属客服', '历史记录永久保存']),
    (2, '年度会员', 19800, 365, ARRAY['无限次测算', '专属客服', '历史记录永久保存', '优先体验新功能']),
    (3, '终身会员', 49800, 0, ARRAY['无限次测算', '专属客服', '历史记录永久保存', '优先体验新功能', '专属命理师咨询'])
ON CONFLICT (level) DO NOTHING;

-- ========== 文章表 ==========
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    cover TEXT,
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    views INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(is_published);

-- ========== 积分记录表 ==========
CREATE TABLE IF NOT EXISTS point_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_point_records_user ON point_records(user_id);

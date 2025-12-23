// ========== 数据库配置 ==========
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'shenji_miaosuan',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
}

// ========== Redis 配置 ==========
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0'),
}

// ========== JWT 配置 ==========
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'shenji-miaosuan-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}

// ========== 短信配置 ==========
export const smsConfig = {
  provider: process.env.SMS_PROVIDER || 'aliyun',
  accessKeyId: process.env.SMS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET || '',
  signName: process.env.SMS_SIGN_NAME || '神机妙算',
  templateCode: process.env.SMS_TEMPLATE_CODE || '',
}

// ========== 微信配置 ==========
export const wechatConfig = {
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
}

// ========== 支付配置 ==========
export const paymentConfig = {
  wechat: {
    appId: process.env.WECHAT_PAY_APP_ID || '',
    mchId: process.env.WECHAT_PAY_MCH_ID || '',
    apiKey: process.env.WECHAT_PAY_API_KEY || '',
  },
  alipay: {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  },
}

// ========== 对象存储配置 ==========
export const ossConfig = {
  provider: process.env.OSS_PROVIDER || 'aliyun',
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.OSS_BUCKET || '',
}

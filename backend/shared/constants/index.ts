// ========== Redis Keys ==========
export const RedisKeys = {
  USER_INFO: (userId: string) => `user:info:${userId}`,
  USER_TOKEN: (token: string) => `user:token:${token}`,
  SMS_CODE: (phone: string) => `sms:code:${phone}`,
  DIVINATION_DAILY: (userId: string, date: string) => `divination:daily:${userId}:${date}`,
} as const

// ========== VIP 配置 ==========
export const VipConfig = {
  MONTHLY: {
    level: 1,
    name: '月度会员',
    duration: 30, // 天
    price: 2800, // 分
  },
  YEARLY: {
    level: 2,
    name: '年度会员',
    duration: 365,
    price: 18800,
  },
  LIFETIME: {
    level: 3,
    name: '终身会员',
    duration: 0, // 0 表示永久
    price: 88800,
  },
} as const

// ========== 占卜配置 ==========
export const DivinationConfig = {
  DAILY_FREE_LIMIT: 1, // 每日免费次数
  TYPES: {
    bazi: {
      name: '八字排盘',
      isVip: false,
      price: 0,
    },
    qimen: {
      name: '奇门遁甲',
      isVip: true,
      price: 9900,
    },
    bagua: {
      name: '八卦测算',
      isVip: false,
      price: 0,
    },
    meihua: {
      name: '梅花易数',
      isVip: true,
      price: 6600,
    },
  },
} as const

// ========== HTTP 状态码 ==========
export const HttpStatus = {
  OK: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ========== 错误消息 ==========
export const ErrorMessages = {
  INVALID_PARAMS: '参数错误',
  UNAUTHORIZED: '未登录或登录已过期',
  FORBIDDEN: '无权限访问',
  NOT_FOUND: '资源不存在',
  SERVER_ERROR: '服务器错误',
  SMS_CODE_ERROR: '验证码错误或已过期',
  DAILY_LIMIT_EXCEEDED: '今日免费次数已用完',
  VIP_REQUIRED: '此功能需要VIP会员',
} as const

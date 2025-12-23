// 通用响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页类型
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 占卜类型
export enum DivinationType {
  BAZI = 'bazi',       // 八字排盘
  QIMEN = 'qimen',     // 奇门遁甲
  BAGUA = 'bagua',     // 八卦测算
  MEIHUA = 'meihua',   // 梅花易数
}

export interface DivinationTypeConfig {
  type: DivinationType
  name: string
  description: string
  icon: string
  isVip: boolean
  price: number
}

// 占卜输入
export interface DivinationInput {
  type: DivinationType
  name: string
  gender: 'male' | 'female'
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHour: number
  birthMinute: number
  isLunar: boolean
}

// 占卜结果
export interface DivinationResult {
  id: string
  userId: string
  type: DivinationType
  inputData: DivinationInput
  resultData: Record<string, unknown>
  isVip: boolean
  createdAt: string
}

// VIP 等级
export enum VipLevel {
  NORMAL = 0,
  MONTHLY = 1,
  YEARLY = 2,
  LIFETIME = 3,
}

export interface VipConfig {
  level: VipLevel
  name: string
  price: number
  duration: number // 天数，0 表示永久
  benefits: string[]
}

// 订单状态
export enum OrderStatus {
  PENDING = 'pending',     // 待支付
  PAID = 'paid',           // 已支付
  COMPLETED = 'completed', // 已完成
  REFUNDED = 'refunded',   // 已退款
  EXPIRED = 'expired',     // 已过期
}

export interface Order {
  id: string
  orderNo: string
  userId: string
  serviceType: DivinationType | 'vip'
  serviceId: string
  amount: number
  status: OrderStatus
  createdAt: string
  paidAt?: string
}

// 支付渠道
export enum PaymentChannel {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

// 文章类型
export interface Article {
  id: string
  title: string
  summary: string
  content: string
  cover: string
  category: string
  tags: string[]
  views: number
  createdAt: string
}

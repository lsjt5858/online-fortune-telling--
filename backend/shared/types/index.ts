// ========== 通用类型 ==========
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

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

// ========== 用户类型 ==========
export interface UserInfo {
  id: string
  phone: string
  openid?: string
  nickname: string
  avatar: string
  vipLevel: number
  vipExpireAt: Date | null
  points: number
  createdAt: Date
}

// ========== 占卜类型 ==========
export enum DivinationType {
  BAZI = 'bazi',
  QIMEN = 'qimen',
  BAGUA = 'bagua',
  MEIHUA = 'meihua',
}

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

export interface DivinationResult extends BaseEntity {
  userId: string
  type: DivinationType
  inputData: DivinationInput
  resultData: Record<string, unknown>
  isVip: boolean
}

// ========== 订单类型 ==========
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
}

export interface Order extends BaseEntity {
  orderNo: string
  userId: string
  serviceType: string
  serviceId: string
  amount: number
  status: OrderStatus
  paidAt?: Date
  expiredAt: Date
}

// ========== 支付类型 ==========
export enum PaymentChannel {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

export interface Payment extends BaseEntity {
  paymentId: string
  orderId: string
  channel: PaymentChannel
  amount: number
  status: string
  paidAt?: Date
}

// ========== Token 类型 ==========
export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

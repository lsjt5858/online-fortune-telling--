import { request } from './request'
import type {
  ApiResponse,
  UserInfo,
  DivinationTypeConfig,
  DivinationInput,
  DivinationResult,
  PaginationResponse,
  VipConfig,
  Order,
  PaymentChannel,
  Article,
  PaginationParams,
} from '@/types'

// ========== 用户相关 ==========
export const authApi = {
  // 发送验证码
  sendCode: (phone: string) =>
    request.post<{ expireIn: number }>('/auth/sms/send', { phone }),

  // 手机号登录/注册
  loginWithPhone: (phone: string, code: string) =>
    request.post<{ token: string; userInfo: UserInfo }>('/auth/login/phone', { phone, code }),

  // 微信登录
  loginWithWechat: (code: string) =>
    request.post<{ token: string; userInfo: UserInfo }>('/auth/login/wechat', { code }),

  // 刷新令牌
  refreshToken: (refreshToken: string) =>
    request.post<{ token: string }>('/auth/refresh', { refreshToken }),

  // 登出
  logout: () => request.post('/auth/logout'),
}

export const userApi = {
  // 获取用户信息
  getProfile: () => request.get<UserInfo>('/user/profile'),

  // 更新用户信息
  updateProfile: (data: Partial<UserInfo>) =>
    request.put<UserInfo>('/user/profile', data),

  // 获取用户积分
  getPoints: () => request.get<{ balance: number; list: unknown[] }>('/user/points'),
}

// ========== 占卜相关 ==========
export const divinationApi = {
  // 获取占卜类型列表
  getTypes: () =>
    request.get<DivinationTypeConfig[]>('/divination/types'),

  // 执行占卜计算
  calculate: (data: DivinationInput) =>
    request.post<DivinationResult>('/divination/calculate', data),

  // 获取占卜结果详情
  getResult: (id: string) =>
    request.get<DivinationResult>(`/divination/result/${id}`),

  // 获取历史记录
  getHistory: (params: PaginationParams) =>
    request.get<PaginationResponse<DivinationResult>>('/divination/history', { params }),

  // 获取每日免费次数
  getDailyFreeCount: () =>
    request.get<{ count: number; limit: number }>('/divination/daily/free'),
}

// ========== VIP 相关 ==========
export const vipApi = {
  // 获取 VIP 配置
  getConfig: () =>
    request.get<VipConfig[]>('/vip/config'),

  // 购买 VIP
  purchase: (level: number) =>
    request.post<{ orderId: string }>('/vip/purchase', { level }),

  // 获取 VIP 状态
  getStatus: () =>
    request.get<{ isVip: boolean; level: number; expireAt: string | null }>('/vip/status'),
}

// ========== 订单相关 ==========
export const orderApi = {
  // 创建订单
  create: (serviceType: string, serviceId: string) =>
    request.post<Order>('/orders/create', { serviceType, serviceId }),

  // 获取订单详情
  getDetail: (orderId: string) =>
    request.get<Order>(`/orders/${orderId}`),

  // 获取订单列表
  getList: (params: PaginationParams) =>
    request.get<PaginationResponse<Order>>('/orders', { params }),

  // 取消订单
  cancel: (orderId: string) =>
    request.post<Order>(`/orders/${orderId}/cancel`),
}

// ========== 支付相关 ==========
export const paymentApi = {
  // 创建支付
  create: (orderId: string, channel: PaymentChannel) =>
    request.post<{ paymentId: string; payInfo: unknown }>('/payment/create', { orderId, channel }),

  // 查询支付状态
  getStatus: (paymentId: string) =>
    request.get<{ status: string; paidAt: string | null }>(`/payment/status/${paymentId}`),
}

// ========== 内容相关 ==========
export const contentApi = {
  // 获取文章列表
  getArticles: (params: PaginationParams & { category?: string }) =>
    request.get<PaginationResponse<Article>>('/content/articles', { params }),

  // 获取文章详情
  getArticle: (articleId: string) =>
    request.get<Article>(`/content/articles/${articleId}`),

  // 获取分类列表
  getCategories: () =>
    request.get<{ id: string; name: string; count: number }[]>('/content/categories'),
}

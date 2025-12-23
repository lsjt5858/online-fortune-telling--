import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { useUserStore } from '@/stores/user'

// 基础配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 创建实例
const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { data } = response

    // 业务状态码判断
    if (data.code !== 0) {
      const error = new Error(data.message || '请求失败')
      return Promise.reject(error)
    }

    return data.data
  },
  (error: AxiosError) => {
    // 网络错误处理
    if (error.response) {
      const { status } = error.response

      switch (status) {
        case 401:
          // 未登录或 token 过期
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
          break
        case 403:
          error.message = '没有权限访问'
          break
        case 404:
          error.message = '请求的资源不存在'
          break
        case 500:
          error.message = '服务器错误'
          break
        default:
          error.message = '网络错误，请稍后重试'
      }
    } else if (error.request) {
      error.message = '网络连接失败，请检查网络'
    }

    return Promise.reject(error)
  },
)

// 通用请求方法
export const request = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instance.get(url, config)
  },

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return instance.post(url, data, config)
  },

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return instance.put(url, data, config)
  },

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instance.delete(url, config)
  },
}

export default instance

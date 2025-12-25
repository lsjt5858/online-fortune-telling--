import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/modules'

// 登录弹窗状态
const showLoginModal = ref(false)
const loginRedirectPath = ref<string | null>(null)
const loginCallback = ref<(() => void) | null>(null)

export function useAuth() {
  const router = useRouter()
  const userStore = useUserStore()

  const isLoggedIn = computed(() => userStore.isLoggedIn)

  // 监听微信登录成功消息（弹窗场景）
  const handleWechatMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    if (event.data?.type === 'wechat_login_success') {
      // 刷新用户状态
      userStore.initFromStorage()
      onLoginSuccess()
    }
  }

  onMounted(() => {
    window.addEventListener('message', handleWechatMessage)
  })

  onUnmounted(() => {
    window.removeEventListener('message', handleWechatMessage)
  })

  /**
   * 检查登录状态，未登录则显示登录弹窗
   * @param callback 登录成功后的回调
   * @returns 是否已登录
   */
  const requireAuth = (callback?: () => void): boolean => {
    if (userStore.isLoggedIn) {
      callback?.()
      return true
    }

    loginCallback.value = callback || null
    showLoginModal.value = true
    return false
  }

  /**
   * 需要登录才能访问的路由跳转
   */
  const requireAuthForRoute = (path: string): boolean => {
    if (userStore.isLoggedIn) {
      router.push(path)
      return true
    }

    loginRedirectPath.value = path
    showLoginModal.value = true
    return false
  }

  /**
   * 关闭登录弹窗
   */
  const closeLoginModal = () => {
    showLoginModal.value = false
    loginRedirectPath.value = null
    loginCallback.value = null
  }

  /**
   * 登录成功后的处理
   */
  const onLoginSuccess = () => {
    showLoginModal.value = false

    if (loginRedirectPath.value) {
      router.push(loginRedirectPath.value)
      loginRedirectPath.value = null
    }

    if (loginCallback.value) {
      loginCallback.value()
      loginCallback.value = null
    }
  }

  /**
   * 微信登录
   */
  const loginWithWechat = async () => {
    try {
      // 检测是否在微信环境
      const isWechat = /MicroMessenger/i.test(navigator.userAgent)

      if (isWechat) {
        // 微信内置浏览器，使用公众号授权
        const redirectUri = encodeURIComponent(window.location.origin + '/auth/wechat/callback')
        const appId = import.meta.env.VITE_WECHAT_APP_ID
        const scope = 'snsapi_userinfo'
        const state = Math.random().toString(36).substring(2)

        // 保存state用于验证
        sessionStorage.setItem('wechat_auth_state', state)

        // 跳转到微信授权页面
        window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
      } else {
        // 非微信环境，使用扫码登录
        // 打开微信扫码登录窗口
        const appId = import.meta.env.VITE_WECHAT_OPEN_APP_ID
        const redirectUri = encodeURIComponent(window.location.origin + '/auth/wechat/callback')
        const state = Math.random().toString(36).substring(2)

        sessionStorage.setItem('wechat_auth_state', state)

        // 可以使用弹窗或新窗口
        const width = 600
        const height = 500
        const left = (window.screen.width - width) / 2
        const top = (window.screen.height - height) / 2

        window.open(
          `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`,
          'wechat_login',
          `width=${width},height=${height},left=${left},top=${top}`
        )
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      throw error
    }
  }

  /**
   * 处理微信回调
   */
  const handleWechatCallback = async (code: string, state: string) => {
    const savedState = sessionStorage.getItem('wechat_auth_state')
    if (state !== savedState) {
      throw new Error('无效的授权状态')
    }

    sessionStorage.removeItem('wechat_auth_state')

    const res = await authApi.loginWithWechat(code)
    userStore.setToken(res.token)
    userStore.setUserInfo(res.userInfo)

    // 保存 refreshToken
    localStorage.setItem('refreshToken', res.refreshToken)

    return res
  }

  return {
    isLoggedIn,
    showLoginModal,
    requireAuth,
    requireAuthForRoute,
    closeLoginModal,
    onLoginSuccess,
    loginWithWechat,
    handleWechatCallback,
  }
}

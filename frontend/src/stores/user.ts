import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: string
  phone?: string
  openid?: string
  nickname: string
  avatar: string
  vipLevel: number
  vipExpireAt: string | null
  points: number
  createdAt: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    const isLoggedIn = computed(() => !!token.value)
    const isVip = computed(() => {
      if (!userInfo.value) return false
      if (userInfo.value.vipLevel === 0) return false
      if (!userInfo.value.vipExpireAt) return false
      return new Date(userInfo.value.vipExpireAt) > new Date()
    })

    function setToken(newToken: string) {
      token.value = newToken
      localStorage.setItem('token', newToken)
    }

    function setUserInfo(info: UserInfo) {
      userInfo.value = info
      localStorage.setItem('userInfo', JSON.stringify(info))
    }

    function logout() {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }

    function initFromStorage() {
      const storedToken = localStorage.getItem('token')
      const storedUserInfo = localStorage.getItem('userInfo')

      if (storedToken) {
        token.value = storedToken
      }

      if (storedUserInfo) {
        try {
          userInfo.value = JSON.parse(storedUserInfo)
        } catch {
          localStorage.removeItem('userInfo')
        }
      }
    }

    return {
      token,
      userInfo,
      isLoggedIn,
      isVip,
      setToken,
      setUserInfo,
      logout,
      initFromStorage,
    }
  },
  {
    persist: true,
  },
)

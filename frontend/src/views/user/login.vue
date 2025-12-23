<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/api/modules'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const isSending = ref(false)
const countdown = ref(0)
const isLoading = ref(false)

const sendCode = async () => {
  if (!phone.value) {
    return
  }

  isSending.value = true
  try {
    await authApi.sendCode(phone.value)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } finally {
    isSending.value = false
  }
}

const handleLogin = async () => {
  if (!phone.value || !code.value) {
    return
  }

  isLoading.value = true
  try {
    const res = await authApi.loginWithPhone(phone.value, code.value)
    userStore.setToken(res.token)
    userStore.setUserInfo(res.userInfo)

    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo-section">
        <h1 class="logo text-calligraphy text-gradient">神机妙算</h1>
        <p class="slogan">洞察天机 · 预知未来</p>
      </div>

      <div class="form-card">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <input
            v-model="phone"
            type="tel"
            class="form-input"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </div>

        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="code-input">
            <input
              v-model="code"
              type="text"
              class="form-input"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <button
              class="code-btn"
              :disabled="isSending || countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>
        </div>

        <button
          class="submit-btn"
          :disabled="isLoading || !phone || !code"
          @click="handleLogin"
        >
          {{ isLoading ? '登录中...' : '登录 / 注册' }}
        </button>

        <p class="agreement">
          登录即表示同意
          <a href="#">《用户协议》</a>
          和
          <a href="#">《隐私政策》</a>
        </p>
      </div>

      <div class="other-methods">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <button class="wechat-btn">
          <div class="i-mdi-wechat" />
          微信一键登录
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0a0a 0%, #2c1810 30%, #f5f5f5 30%);
  padding: 20px;
}

.login-container {
  max-width: 400px;
  margin: 0 auto;
}

.logo-section {
  padding: 40px 0;
  text-align: center;
}

.logo {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.slogan {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.form-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
}

.code-input {
  display: flex;
  gap: 12px;
}

.code-input .form-input {
  flex: 1;
}

.code-btn {
  padding: 0 16px;
  border: 1px solid var(--primary-color);
  background: rgba(200, 55, 55, 0.05);
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
}

.code-btn:disabled {
  opacity: 0.5;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #c83737, #d4a543);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.agreement {
  margin-top: 16px;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.agreement a {
  color: var(--primary-color);
}

.other-methods {
  margin-top: 24px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e5e5;
}

.divider span {
  padding: 0 16px;
  font-size: 12px;
  color: #999;
}

.wechat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 500;
}

.wechat-btn > div {
  font-size: 20px;
}
</style>

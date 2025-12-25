<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { handleWechatCallback } = useAuth()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMsg = ref('')

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code) {
    status.value = 'error'
    errorMsg.value = '授权失败，请重试'
    return
  }

  try {
    await handleWechatCallback(code, state)
    status.value = 'success'

    // 如果是弹窗打开的，通知父窗口并关闭
    if (window.opener) {
      window.opener.postMessage({ type: 'wechat_login_success' }, window.location.origin)
      window.close()
    } else {
      // 否则跳转到首页
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
  } catch (err: any) {
    status.value = 'error'
    errorMsg.value = err.message || '登录失败，请重试'
  }
})
</script>

<template>
  <div class="callback-page">
    <div class="callback-container">
      <div v-if="status === 'loading'" class="status-loading">
        <div class="spinner" />
        <p>正在登录中...</p>
      </div>

      <div v-else-if="status === 'success'" class="status-success">
        <div class="i-mdi-check-circle success-icon" />
        <p>登录成功</p>
        <p class="hint">正在跳转...</p>
      </div>

      <div v-else class="status-error">
        <div class="i-mdi-close-circle error-icon" />
        <p>{{ errorMsg }}</p>
        <button class="retry-btn" @click="router.push('/login')">
          返回登录
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #1a0a0a 0%, #2c1810 100%);
}

.callback-container {
  text-align: center;
  color: #fff;
}

.status-loading,
.status-success,
.status-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-icon {
  font-size: 64px;
  color: #07c160;
}

.error-icon {
  font-size: 64px;
  color: #e53935;
}

.hint {
  font-size: 14px;
  opacity: 0.7;
}

.retry-btn {
  margin-top: 16px;
  padding: 12px 32px;
  background: linear-gradient(135deg, #c83737, #d4a543);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
</style>

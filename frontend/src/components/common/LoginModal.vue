<script setup lang="ts">
import { ref, watch } from 'vue'
import { authApi } from '@/api/modules'
import { useUserStore } from '@/stores/user'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const userStore = useUserStore()
const { loginWithWechat } = useAuth()

const phone = ref('')
const code = ref('')
const isSending = ref(false)
const countdown = ref(0)
const isLoading = ref(false)
const isWechatLoading = ref(false)
const errorMsg = ref('')

// 重置表单
watch(() => props.visible, (val) => {
  if (!val) {
    phone.value = ''
    code.value = ''
    errorMsg.value = ''
    countdown.value = 0
  }
})

const close = () => {
  emit('update:visible', false)
}

const sendCode = async () => {
  if (!phone.value || phone.value.length !== 11) {
    errorMsg.value = '请输入正确的手机号'
    return
  }

  isSending.value = true
  errorMsg.value = ''

  try {
    await authApi.sendCode(phone.value)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (err: any) {
    errorMsg.value = err.message || '发送失败，请稍后重试'
  } finally {
    isSending.value = false
  }
}

const handlePhoneLogin = async () => {
  if (!phone.value || !code.value) {
    errorMsg.value = '请填写完整信息'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    const res = await authApi.loginWithPhone(phone.value, code.value)
    userStore.setToken(res.token)
    userStore.setUserInfo(res.userInfo)
    emit('success')
    close()
  } catch (err: any) {
    errorMsg.value = err.message || '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const handleWechatLogin = async () => {
  isWechatLoading.value = true
  errorMsg.value = ''

  try {
    await loginWithWechat()
  } catch (err: any) {
    errorMsg.value = err.message || '微信登录失败'
    isWechatLoading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="login-modal-overlay" @click.self="close">
        <div class="login-modal">
          <button class="close-btn" @click="close">
            <div class="i-mdi-close" />
          </button>

          <div class="modal-header">
            <h2 class="modal-title text-calligraphy text-gradient">登录神机妙算</h2>
            <p class="modal-subtitle">登录后即可使用测算功能</p>
          </div>

          <div class="modal-body">
            <!-- 微信一键登录 -->
            <button
              class="wechat-login-btn"
              :disabled="isWechatLoading"
              @click="handleWechatLogin"
            >
              <div class="i-mdi-wechat" />
              <span>{{ isWechatLoading ? '登录中...' : '微信一键登录' }}</span>
            </button>

            <div class="divider">
              <span>或使用手机号登录</span>
            </div>

            <!-- 手机号登录 -->
            <div class="form-group">
              <input
                v-model="phone"
                type="tel"
                class="form-input"
                placeholder="请输入手机号"
                maxlength="11"
              />
            </div>

            <div class="form-group">
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

            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

            <button
              class="submit-btn"
              :disabled="isLoading || !phone || !code"
              @click="handlePhoneLogin"
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
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.login-modal {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  color: #666;
}

.modal-header {
  padding: 32px 24px 16px;
  text-align: center;
  background: linear-gradient(180deg, #1a0a0a 0%, #2c1810 100%);
}

.modal-title {
  font-size: 24px;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.modal-body {
  padding: 24px;
}

.wechat-login-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.wechat-login-btn:hover {
  opacity: 0.9;
}

.wechat-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wechat-login-btn > div {
  font-size: 22px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e5e5;
}

.divider span {
  padding: 0 12px;
  font-size: 12px;
  color: #999;
}

.form-group {
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
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
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
}

.code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-msg {
  color: #e53935;
  font-size: 13px;
  margin-bottom: 12px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #c83737, #d4a543);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-btn:hover {
  opacity: 0.9;
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

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .login-modal,
.modal-leave-active .login-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .login-modal,
.modal-leave-to .login-modal {
  transform: scale(0.9);
}
</style>

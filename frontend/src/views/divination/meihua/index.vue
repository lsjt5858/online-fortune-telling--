<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  name: '',
  question: '',
  numbers: [] as number[],
})

const isLoading = ref(false)

const addNumber = () => {
  if (form.value.numbers.length < 3) {
    form.value.numbers.push(Math.floor(Math.random() * 999) + 1)
  }
}

const clearNumbers = () => {
  form.value.numbers = []
}

const handleSubmit = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push({ name: 'result', params: { id: '123' } })
  } finally {
    isLoading.value = false
  }
}

const goBack = () => router.back()
</script>

<template>
  <div class="meihua-page">
    <header class="header">
      <button class="back-btn" @click="goBack"><div class="i-mdi-arrow-left" /></button>
      <h1 class="header-title text-calligraphy">梅花易数</h1>
      <div class="header-spacer" />
    </header>

    <div class="container">
      <div class="vip-banner">
        <div class="vip-icon i-mdi-crown" />
        <div class="vip-text">
          <p class="vip-title">VIP 专享服务</p>
          <p class="vip-desc">梅花易数为高级测算服务，仅限 VIP 会员使用</p>
        </div>
      </div>

      <div class="meihua-intro">
        <div class="intro-icon i-mdi-flower-tulip" />
        <h3 class="intro-title">梅花易数</h3>
        <p class="intro-desc">宋代邵雍所传，物物可为数，数数可起卦</p>
      </div>

      <div class="form-card">
        <div class="form-group">
          <label class="form-label">姓名</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="请输入姓名" />
        </div>

        <div class="form-group">
          <label class="form-label">所占之事</label>
          <textarea v-model="form.question" class="form-textarea" placeholder="请描述您想占卜的事情..." rows="3" />
        </div>

        <div class="form-group">
          <label class="form-label">起卦数字</label>
          <p class="form-hint">心中默念所占之事，报出三个数字（1-999）</p>
          <div class="numbers-display">
            <div v-for="(num, index) in form.numbers" :key="index" class="number-tag">
              {{ num }}
            </div>
            <div v-if="form.numbers.length === 0" class="number-placeholder">
              点击下方按钮随机生成
            </div>
          </div>
          <div class="number-actions">
            <button class="number-btn" :disabled="form.numbers.length >= 3" @click="addNumber">
              <div class="i-mdi-plus" />
              添加数字
            </button>
            <button v-if="form.numbers.length > 0" class="number-btn number-btn-clear" @click="clearNumbers">
              <div class="i-mdi-refresh" />
              重新生成
            </button>
          </div>
        </div>

        <button class="submit-btn" :disabled="isLoading || form.numbers.length !== 3" @click="handleSubmit">
          {{ isLoading ? '起卦中...' : '开始测算' }}
        </button>

        <button class="vip-btn" @click="router.push('/vip')">
          开通 VIP 会员
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meihua-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #c83737, #d4a543);
  color: #fff;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #fff;
}

.back-btn > div {
  font-size: 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-spacer {
  width: 36px;
}

.container {
  padding: 16px;
}

.vip-banner {
  background: linear-gradient(135deg, #d4a543, #f0c060);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.vip-icon {
  width: 40px;
  height: 40px;
  font-size: 24px;
  color: #fff;
}

.vip-text {
  flex: 1;
}

.vip-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.vip-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.meihua-intro {
  text-align: center;
  padding: 24px 16px;
}

.intro-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  font-size: 36px;
  color: var(--primary-color);
}

.intro-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.intro-desc {
  font-size: 13px;
  color: #666;
}

.form-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
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

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.numbers-display {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.number-tag {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 55, 55, 0.1);
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
}

.number-placeholder {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  border-radius: 4px;
  font-size: 13px;
}

.number-actions {
  display: flex;
  gap: 8px;
}

.number-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px;
  border: 1px solid var(--primary-color);
  background: rgba(200, 55, 55, 0.05);
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.number-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-btn-clear {
  border-color: #999;
  background: #f5f5f5;
  color: #666;
}

.submit-btn,
.vip-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn {
  background: linear-gradient(135deg, #c83737, #d4a543);
  color: #fff;
  margin-bottom: 12px;
}

.vip-btn {
  background: rgba(212, 165, 67, 0.1);
  color: #d4a543;
}
</style>

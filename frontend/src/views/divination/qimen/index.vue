<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  name: '',
  gender: 'male' as 'male' | 'female',
  year: 1990,
  month: 1,
  day: 1,
  hour: 0,
  question: '',
})

const isLoading = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  try {
    // TODO: 调用 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push({ name: 'result', params: { id: '123' } })
  } finally {
    isLoading.value = false
  }
}

const goBack = () => router.back()
</script>

<template>
  <div class="qimen-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        <div class="i-mdi-arrow-left" />
      </button>
      <h1 class="header-title text-calligraphy">奇门遁甲</h1>
      <div class="header-spacer" />
    </header>

    <div class="container">
      <div class="vip-banner">
        <div class="vip-icon i-mdi-crown" />
        <div class="vip-text">
          <p class="vip-title">VIP 专享服务</p>
          <p class="vip-desc">奇门遁甲为高级测算服务，仅限 VIP 会员使用</p>
        </div>
      </div>

      <div class="form-card">
        <div class="form-group">
          <label class="form-label">姓名</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="请输入姓名" />
        </div>

        <div class="form-group">
          <label class="form-label">性别</label>
          <div class="gender-selector">
            <button :class="['gender-btn', { active: form.gender === 'male' }]" @click="form.gender = 'male'">
              <div class="i-mdi-gender-male" /><span>男</span>
            </button>
            <button :class="['gender-btn', { active: form.gender === 'female' }]" @click="form.gender = 'female'">
              <div class="i-mdi-gender-female" /><span>女</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">所占之事</label>
          <textarea v-model="form.question" class="form-textarea" placeholder="请描述您想占卜的事情..." rows="3" />
        </div>

        <button class="submit-btn" :disabled="isLoading" @click="handleSubmit">
          {{ isLoading ? '计算中...' : 'VIP 专享测算' }}
        </button>

        <button class="vip-btn" @click="router.push('/vip')">
          开通 VIP 会员
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qimen-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: linear-gradient(135deg, #d4a543, #f0c060);
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

.gender-selector {
  display: flex;
  gap: 12px;
}

.gender-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #fff;
}

.gender-btn.active {
  border-color: #d4a543;
  background: rgba(212, 165, 67, 0.05);
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
  background: linear-gradient(135deg, #d4a543, #f0c060);
  color: #fff;
  margin-bottom: 12px;
}

.vip-btn {
  background: rgba(212, 165, 67, 0.1);
  color: #d4a543;
}
</style>

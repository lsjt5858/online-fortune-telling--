<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  name: '',
  gender: 'male' as 'male' | 'female',
  birthYear: 1990,
  birthMonth: 1,
  birthDay: 1,
  birthHour: 0,
  birthMinute: 0,
  isLunar: false,
})

const isLoading = ref(false)

// 生成年份选项
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = Array.from({ length: 31 }, (_, i) => i + 1)
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)

const handleSubmit = async () => {
  // TODO: 表单验证
  isLoading.value = true

  try {
    // TODO: 调用 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push({ name: 'result', params: { id: '123' } })
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="bazi-page">
    <!-- 头部 -->
    <header class="header">
      <button class="back-btn" @click="goBack">
        <div class="i-mdi-arrow-left" />
      </button>
      <h1 class="header-title text-calligraphy">八字排盘</h1>
      <div class="header-spacer" />
    </header>

    <!-- 表单 -->
    <div class="container">
      <div class="form-card">
        <div class="form-group">
          <label class="form-label">姓名</label>
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="请输入姓名"
          />
        </div>

        <div class="form-group">
          <label class="form-label">性别</label>
          <div class="gender-selector">
            <button
              :class="['gender-btn', { active: form.gender === 'male' }]"
              @click="form.gender = 'male'"
            >
              <div class="i-mdi-gender-male" />
              <span>男</span>
            </button>
            <button
              :class="['gender-btn', { active: form.gender === 'female' }]"
              @click="form.gender = 'female'"
            >
              <div class="i-mdi-gender-female" />
              <span>女</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">出生日期</label>
          <div class="date-row">
            <select v-model="form.birthYear" class="form-select">
              <option value="">年</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <select v-model="form.birthMonth" class="form-select">
              <option value="">月</option>
              <option v-for="month in months" :key="month" :value="month">
                {{ month }}
              </option>
            </select>
            <select v-model="form.birthDay" class="form-select">
              <option value="">日</option>
              <option v-for="day in days" :key="day" :value="day">
                {{ day }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">出生时辰</label>
          <div class="date-row">
            <select v-model="form.birthHour" class="form-select">
              <option value="">时</option>
              <option v-for="hour in hours" :key="hour" :value="hour">
                {{ String(hour).padStart(2, '0') }}
              </option>
            </select>
            <select v-model="form.birthMinute" class="form-select">
              <option value="">分</option>
              <option v-for="minute in minutes" :key="minute" :value="minute">
                {{ String(minute).padStart(2, '0') }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-switch">
            <input v-model="form.isLunar" type="checkbox" />
            <span>农历</span>
          </label>
        </div>

        <button
          class="submit-btn"
          :disabled="isLoading"
          @click="handleSubmit"
        >
          {{ isLoading ? '计算中...' : '开始测算' }}
        </button>

        <p class="form-tip">每日首次测算免费，VIP 会员无限制</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bazi-page {
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
  color: var(--ink-color);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
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
  transition: all 0.2s;
}

.gender-btn.active {
  border-color: var(--primary-color);
  background: rgba(200, 55, 55, 0.05);
  color: var(--primary-color);
}

.gender-btn > div {
  font-size: 20px;
}

.date-row {
  display: flex;
  gap: 8px;
}

.form-select {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.form-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-switch input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
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
  transition: opacity 0.2s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-tip {
  margin-top: 16px;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>

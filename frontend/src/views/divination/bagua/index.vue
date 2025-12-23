<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = ref({
  name: '',
  question: '',
})

const isLoading = ref(false)

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
  <div class="bagua-page">
    <header class="header">
      <button class="back-btn" @click="goBack"><div class="i-mdi-arrow-left" /></button>
      <h1 class="header-title text-calligraphy">八卦测算</h1>
      <div class="header-spacer" />
    </header>

    <div class="container">
      <div class="bagua-intro">
        <div class="intro-icon i-mdi-hexagon-multiple" />
        <h3 class="intro-title">八卦起卦</h3>
        <p class="intro-desc">诚心默念心中所想之事，点击下方按钮起卦</p>
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

        <button class="submit-btn" :disabled="isLoading" @click="handleSubmit">
          {{ isLoading ? '起卦中...' : '诚心起卦' }}
        </button>

        <p class="form-tip">心诚则灵，请心存诚念</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bagua-page {
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

.bagua-intro {
  text-align: center;
  padding: 32px 16px;
}

.intro-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  font-size: 48px;
  color: var(--primary-color);
}

.intro-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.intro-desc {
  font-size: 14px;
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

.form-tip {
  margin-top: 16px;
  font-size: 12px;
  color: #999;
  text-align: center;
}
</style>

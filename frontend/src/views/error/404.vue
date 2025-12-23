<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found-page">
    <div class="container">
      <div class="error-content">
        <h1 class="error-code text-calligraphy text-gradient">404</h1>
        <h2 class="error-title">页面不存在</h2>
        <p class="error-desc">抱歉，您访问的页面已消失在茫茫人海中</p>
        <button class="home-btn" @click="goHome">
          返回首页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.error-content {
  text-align: center;
  padding: 40px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ink-color);
}

.error-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 32px;
}

.home-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #c83737, #d4a543);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLoading = ref(true)
const records = ref<any[]>([])
const page = ref(1)
const hasMore = ref(true)

onMounted(async () => {
  // TODO: 获取历史记录
  isLoading.value = false
})

const loadMore = () => {
  // TODO: 加载更多
}

const viewDetail = (id: string) => {
  router.push({ name: 'result', params: { id } })
}

const goBack = () => router.back()
</script>

<template>
  <div class="history-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        <div class="i-mdi-arrow-left" />
      </button>
      <h1 class="header-title text-calligraphy">测算记录</h1>
      <div class="header-spacer" />
    </header>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner" />
    </div>

    <div v-else-if="records.length === 0" class="empty-container">
      <div class="empty-icon i-mdi-file-document-outline" />
      <p class="empty-text">暂无测算记录</p>
      <button class="empty-btn" @click="router.push('/divination')">
        开始测算
      </button>
    </div>

    <div v-else class="container">
      <div class="record-list">
        <div
          v-for="record in records"
          :key="record.id"
          class="record-item"
          @click="viewDetail(record.id)"
        >
          <div class="record-icon" :class="`i-mdi-${record.typeIcon}`" />
          <div class="record-content">
            <h3 class="record-title">{{ record.typeName }}</h3>
            <p class="record-time">{{ record.createdAt }}</p>
          </div>
          <div class="record-arrow i-mdi-chevron-right" />
        </div>
      </div>

      <button
        v-if="hasMore"
        class="load-more-btn"
        @click="loadMore"
      >
        加载更多
      </button>
    </div>
  </div>
</template>

<style scoped>
.history-page {
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

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(200, 55, 55, 0.2);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.empty-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #c83737, #d4a543);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
}

.container {
  padding: 16px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
}

.record-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 55, 55, 0.1);
  border-radius: 8px;
  font-size: 22px;
  color: var(--primary-color);
}

.record-content {
  flex: 1;
}

.record-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-arrow {
  font-size: 18px;
  color: #999;
}

.load-more-btn {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}
</style>

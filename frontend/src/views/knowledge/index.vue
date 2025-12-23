<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = ref([
  { id: '1', name: '八字命理', icon: 'i-mdi-calendar-star', count: 24 },
  { id: '2', name: '奇门遁甲', icon: 'i-mdi-compass', count: 18 },
  { id: '3', name: '易经八卦', icon: 'i-mdi-hexagon-multiple', count: 32 },
  { id: '4', name: '梅花易数', icon: 'i-mdi-flower-tulip', count: 15 },
])

const articles = ref<any[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  // TODO: 获取文章列表
  isLoading.value = false
})

const viewArticle = (id: string) => {
  // TODO: 跳转到文章详情
}

const goBack = () => router.back()
</script>

<template>
  <div class="knowledge-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        <div class="i-mdi-arrow-left" />
      </button>
      <h1 class="header-title text-calligraphy">知识库</h1>
      <div class="header-spacer" />
    </header>

    <!-- 分类 -->
    <div class="categories">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="category-item"
      >
        <div class="category-icon" :class="cat.icon" />
        <span class="category-name">{{ cat.name }}</span>
        <span class="category-count">{{ cat.count }}篇</span>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="container">
      <h3 class="section-title">热门文章</h3>

      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner" />
      </div>

      <div v-else-if="articles.length === 0" class="empty-container">
        <div class="empty-icon i-mdi-file-document-outline" />
        <p class="empty-text">暂无文章</p>
      </div>

      <div v-else class="article-list">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-item"
          @click="viewArticle(article.id)"
        >
          <div class="article-cover">
            <img :src="article.cover" :alt="article.title" />
          </div>
          <div class="article-content">
            <h4 class="article-title">{{ article.title }}</h4>
            <p class="article-summary">{{ article.summary }}</p>
            <div class="article-meta">
              <span class="meta-category">{{ article.category }}</span>
              <span class="meta-views">{{ article.views }}阅读</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-page {
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

.categories {
  display: flex;
  overflow-x: auto;
  padding: 16px;
  gap: 12px;
  background: #fff;
}

.category-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  min-width: 80px;
}

.category-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 55, 55, 0.1);
  border-radius: 50%;
  font-size: 18px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.category-name {
  font-size: 13px;
  margin-bottom: 2px;
}

.category-count {
  font-size: 11px;
  color: #999;
}

.container {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid var(--primary-color);
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
  padding: 40px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  font-size: 36px;
  color: #ccc;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.article-cover {
  width: 100px;
  height: 80px;
  flex-shrink: 0;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
}

.article-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-summary {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
}
</style>

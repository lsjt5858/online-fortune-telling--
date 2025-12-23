<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const result = ref<any>(null)

onMounted(async () => {
  const { id } = route.params
  // TODO: 根据 id 获取结果
  isLoading.value = false
})

const handleShare = () => {
  // TODO: 实现分享
}

const handleSave = () => {
  // TODO: 保存到历史记录
}
</script>

<template>
  <div class="result-page">
    <header class="header">
      <button class="back-btn" @click="router.back()">
        <div class="i-mdi-arrow-left" />
      </button>
      <h1 class="header-title text-calligraphy">测算结果</h1>
      <button class="share-btn" @click="handleShare">
        <div class="i-mdi-share-variant" />
      </button>
    </header>

    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner" />
      <p class="loading-text">正在解读天机...</p>
    </div>

    <div v-else class="container">
      <div class="result-card">
        <div class="result-header">
          <div class="result-icon i-mdi-scroll" />
          <h2 class="result-title">八字排盘结果</h2>
          <p class="result-subtitle">命运解析 · 趋势预测</p>
        </div>

        <div class="result-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">姓名</span>
              <span class="info-value">张三</span>
            </div>
            <div class="info-item">
              <span class="info-label">性别</span>
              <span class="info-value">男</span>
            </div>
            <div class="info-item">
              <span class="info-label">出生日期</span>
              <span class="info-value">1990年1月1日</span>
            </div>
          </div>
        </div>

        <div class="result-section">
          <h3 class="section-title">八字排盘</h3>
          <div class="bazi-chart">
            <div class="bazi-pillar">
              <div class="pillar-label">年柱</div>
              <div class="pillar-ganzhi">己巳</div>
            </div>
            <div class="bazi-pillar">
              <div class="pillar-label">月柱</div>
              <div class="pillar-ganzhi">甲子</div>
            </div>
            <div class="bazi-pillar">
              <div class="pillar-label">日柱</div>
              <div class="pillar-ganzhi">丙寅</div>
            </div>
            <div class="bazi-pillar">
              <div class="pillar-label">时柱</div>
              <div class="pillar-ganzhi">辛卯</div>
            </div>
          </div>
        </div>

        <div class="result-section">
          <h3 class="section-title">命运解析</h3>
          <div class="analysis-content">
            <p>此命格五行齐全，日主丙火生于子月，得年干己土、时干辛金相生，格局清纯...</p>
          </div>
        </div>

        <div class="vip-section">
          <div class="vip-lock">
            <div class="lock-icon i-mdi-lock" />
            <p class="vip-text">完整解析仅限 VIP 会员</p>
          </div>
          <button class="vip-btn" @click="router.push('/vip')">
            开通 VIP 查看完整解析
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <button class="action-btn" @click="handleSave">
          <div class="i-mdi-content-save" />
          保存记录
        </button>
        <button class="action-btn" @click="router.push('/divination')">
          <div class="i-mdi-refresh" />
          重新测算
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-page {
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

.back-btn,
.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #fff;
}

.back-btn > div,
.share-btn > div {
  font-size: 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(200, 55, 55, 0.2);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 16px;
  font-size: 14px;
  color: #999;
}

.container {
  padding: 16px;
}

.result-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.result-header {
  padding: 24px 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(200, 55, 55, 0.05), rgba(212, 165, 67, 0.05));
}

.result-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  font-size: 36px;
  color: var(--primary-color);
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.result-subtitle {
  font-size: 13px;
  color: #666;
}

.result-section {
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid var(--primary-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
}

.info-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
}

.bazi-chart {
  display: flex;
  gap: 8px;
}

.bazi-pillar {
  flex: 1;
  text-align: center;
  padding: 16px 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

.pillar-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.pillar-ganzhi {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

.analysis-content {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.vip-section {
  padding: 24px 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(212, 165, 67, 0.05), rgba(240, 192, 96, 0.05));
}

.vip-lock {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.lock-icon {
  width: 40px;
  height: 40px;
  font-size: 28px;
  color: #d4a543;
  margin-bottom: 8px;
}

.vip-text {
  font-size: 14px;
  color: #666;
}

.vip-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #d4a543, #f0c060);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.action-btn > div {
  font-size: 18px;
}
</style>

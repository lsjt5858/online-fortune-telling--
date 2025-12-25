<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DivinationType } from '@/types'
import { useAuth } from '@/composables/useAuth'
import LoginModal from '@/components/common/LoginModal.vue'

const router = useRouter()
const { showLoginModal, requireAuth, onLoginSuccess } = useAuth()

const divinationTypes = [
  {
    type: DivinationType.BAZI,
    name: '八字排盘',
    description: '基于生辰八字，解析命运走势',
    icon: 'i-mdi-calendar-star',
    isVip: false,
    price: 0,
  },
  {
    type: DivinationType.QIMEN,
    name: '奇门遁甲',
    description: '中国古代最高预测学',
    icon: 'i-mdi-compass',
    isVip: true,
    price: 9900,
  },
  {
    type: DivinationType.BAGUA,
    name: '八卦测算',
    description: '易经八卦，洞察天地玄机',
    icon: 'i-mdi-hexagon',
    isVip: false,
    price: 0,
  },
  {
    type: DivinationType.MEIHUA,
    name: '梅花易数',
    description: '宋代邵雍所传，占卜灵验',
    icon: 'i-mdi-flower',
    isVip: true,
    price: 6600,
  },
]

// 选择测算类型时，先检查登录状态
const handleSelect = (type: DivinationType) => {
  requireAuth(() => {
    router.push({ name: `divination-${type}` })
  })
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="divination-page">
    <!-- 头部 -->
    <header class="header">
      <button class="back-btn" @click="goBack">
        <div class="i-mdi-arrow-left" />
      </button>
      <h1 class="header-title text-calligraphy">选择占卜方式</h1>
      <div class="header-spacer" />
    </header>

    <!-- 占卜类型列表 -->
    <div class="container">
      <div class="divination-list">
        <div
          v-for="item in divinationTypes"
          :key="item.type"
          class="divination-item"
          @click="handleSelect(item.type)"
        >
          <div class="item-icon" :class="item.icon" />
          <div class="item-content">
            <div class="item-header">
              <h3 class="item-name">{{ item.name }}</h3>
              <span v-if="item.isVip" class="item-vip">VIP</span>
              <span v-else class="item-free">免费</span>
            </div>
            <p class="item-desc">{{ item.description }}</p>
          </div>
          <div class="i-mdi-chevron-right item-arrow" />
        </div>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <LoginModal
      v-model:visible="showLoginModal"
      @success="onLoginSuccess"
    />
  </div>
</template>

<style scoped>
.divination-page {
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

.divination-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.divination-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.divination-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 12px rgba(200, 55, 55, 0.1);
}

.item-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 55, 55, 0.1);
  border-radius: 8px;
  font-size: 24px;
  color: var(--primary-color);
}

.item-content {
  flex: 1;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-color);
}

.item-vip {
  background: linear-gradient(135deg, #d4a543, #f0c060);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.item-free {
  background: rgba(200, 55, 55, 0.1);
  color: var(--primary-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.item-desc {
  font-size: 13px;
  color: #666;
}

.item-arrow {
  font-size: 20px;
  color: #999;
}
</style>

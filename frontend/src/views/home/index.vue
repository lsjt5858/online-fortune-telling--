<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { divinationApi } from '@/api/modules'
import { DivinationType } from '@/types'

const router = useRouter()

const divinationTypes = ref([
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
])

const handleSelect = (type: DivinationType) => {
  router.push({ name: `divination-${type}` })
}
</script>

<template>
  <div class="home-page">
    <!-- 头部导航 -->
    <header class="header">
      <div class="container">
        <h1 class="logo text-calligraphy text-gradient">神机妙算</h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/divination" class="nav-link">开始测算</router-link>
          <router-link to="/knowledge" class="nav-link">知识库</router-link>
          <router-link to="/user" class="nav-link">个人中心</router-link>
        </nav>
      </div>
    </header>

    <!-- Banner -->
    <section class="banner">
      <div class="container">
        <h2 class="banner-title text-calligraphy">洞察天机，预知未来</h2>
        <p class="banner-subtitle">专业在线算命平台，传承千年智慧</p>
        <button class="btn btn-primary mt-4" @click="router.push('/divination')">
          立即测算
        </button>
      </div>
    </section>

    <!-- 占卜方式选择 -->
    <section class="section">
      <div class="container">
        <h3 class="section-title text-calligraphy text-center">选择占卜方式</h3>
        <div class="grid grid-cols-2 grid-cols-md-4 gap-4">
          <div
            v-for="item in divinationTypes"
            :key="item.type"
            class="divination-card"
            @click="handleSelect(item.type)"
          >
            <div class="card-icon" :class="item.icon" />
            <h4 class="card-title">{{ item.name }}</h4>
            <p class="card-desc">{{ item.description }}</p>
            <div v-if="item.isVip" class="card-vip">
              <span class="vip-badge">VIP</span>
              <span class="price">¥{{ (item.price / 100).toFixed(2) }}</span>
            </div>
            <div v-else class="card-free">
              <span class="free-badge">免费</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <div class="nav-icon i-mdi-home" />
        <span>首页</span>
      </router-link>
      <router-link to="/divination" class="nav-item">
        <div class="nav-icon i-mdi-compass" />
        <span>测算</span>
      </router-link>
      <router-link to="/history" class="nav-item">
        <div class="nav-icon i-mdi-history" />
        <span>记录</span>
      </router-link>
      <router-link to="/user" class="nav-item">
        <div class="nav-icon i-mdi-account" />
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0a0a 0%, #2c1810 50%, #f5f5f5 50%);
  padding-bottom: 60px;
}

.header {
  padding: 16px 0;
  background: rgba(26, 10, 10, 0.95);
}

.header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #fff;
  font-size: 14px;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  opacity: 1;
}

.banner {
  padding: 60px 0;
  text-align: center;
  color: #fff;
}

.banner-title {
  font-size: 36px;
  margin-bottom: 8px;
}

.banner-subtitle {
  font-size: 16px;
  opacity: 0.8;
}

.section {
  padding: 40px 0;
  background: #f5f5f5;
}

.section-title {
  font-size: 24px;
  margin-bottom: 24px;
  color: var(--ink-color);
}

.divination-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.divination-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(200, 55, 55, 0.15);
}

.card-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  font-size: 32px;
  color: var(--primary-color);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ink-color);
}

.card-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.card-vip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.vip-badge {
  background: linear-gradient(135deg, #d4a543, #f0c060);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.price {
  color: var(--primary-color);
  font-weight: 600;
}

.card-free {
  display: flex;
  justify-content: center;
}

.free-badge {
  background: rgba(200, 55, 55, 0.1);
  color: var(--primary-color);
  padding: 2px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-top: 1px solid #e5e5e5;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  font-size: 12px;
  color: #666;
  text-decoration: none;
}

.nav-item.router-link-active {
  color: var(--primary-color);
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 2px;
}

@media (max-width: 768px) {
  .header .nav {
    display: none;
  }

  .banner-title {
    font-size: 28px;
  }

  .section-title {
    font-size: 20px;
  }
}
</style>

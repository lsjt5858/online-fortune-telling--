<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const menuItems = [
  { icon: 'i-mdi-history', label: '测算记录', path: '/history' },
  { icon: 'i-mdi-crown', label: 'VIP会员', path: '/vip' },
  { icon: 'i-mdi-wallet-giftcard', label: '我的积分', path: '/points' },
  { icon: 'i-mdi-cog', label: '设置', path: '/settings' },
  { icon: 'i-mdi-help-circle', label: '帮助中心', path: '/help' },
]

const handleMenuClick = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="user-page">
    <!-- 头部用户信息 -->
    <div class="user-header">
      <div class="header-bg" />
      <div class="user-info">
        <div class="avatar">
          <div class="avatar-placeholder i-mdi-account" />
        </div>
        <div class="user-detail">
          <h2 class="user-name">{{ userStore.userInfo?.nickname || '游客' }}</h2>
          <p class="user-phone">{{ userStore.userInfo?.phone || '未登录' }}</p>
        </div>
        <div v-if="userStore.isVip" class="vip-badge">VIP</div>
      </div>
    </div>

    <!-- VIP 入口 -->
    <div class="vip-card">
      <div class="vip-info">
        <div class="vip-icon i-mdi-crown" />
        <div class="vip-text">
          <p class="vip-title">{{ userStore.isVip ? '尊贵VIP会员' : '开通VIP会员' }}</p>
          <p class="vip-desc">{{ userStore.isVip ? '享受无限测算特权' : '解锁全部高级测算功能' }}</p>
        </div>
      </div>
      <button class="vip-btn" @click="router.push('/vip')">
        {{ userStore.isVip ? '续费' : '立即开通' }}
      </button>
    </div>

    <!-- 积分卡片 -->
    <div class="points-card">
      <div class="points-item">
        <span class="points-value">{{ userStore.userInfo?.points || 0 }}</span>
        <span class="points-label">我的积分</span>
      </div>
      <div class="points-divider" />
      <div class="points-item">
        <span class="points-value">--</span>
        <span class="points-label">今日剩余</span>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div
        v-for="item in menuItems"
        :key="item.path"
        class="menu-item"
        @click="handleMenuClick(item.path)"
      >
        <div class="menu-icon" :class="item.icon" />
        <span class="menu-label">{{ item.label }}</span>
        <div class="menu-arrow i-mdi-chevron-right" />
      </div>
    </div>

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
.user-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.user-header {
  position: relative;
  margin-bottom: 16px;
}

.header-bg {
  height: 120px;
  background: linear-gradient(135deg, #c83737, #d4a543);
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 16px;
  margin-top: -40px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  font-size: 36px;
  color: #999;
}

.user-detail {
  flex: 1;
  margin-left: 16px;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-phone {
  font-size: 14px;
  color: #666;
}

.vip-badge {
  padding: 4px 12px;
  background: linear-gradient(135deg, #d4a543, #f0c060);
  color: #fff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.vip-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 16px 16px;
  padding: 16px;
  background: linear-gradient(135deg, #d4a543, #f0c060);
  border-radius: 8px;
}

.vip-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vip-icon {
  width: 36px;
  height: 36px;
  font-size: 24px;
  color: #fff;
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

.vip-btn {
  padding: 8px 16px;
  background: #fff;
  color: #d4a543;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.points-card {
  display: flex;
  margin: 0 16px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.points-item {
  flex: 1;
  text-align: center;
}

.points-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.points-label {
  font-size: 13px;
  color: #666;
}

.points-divider {
  width: 1px;
  background: #e5e5e5;
}

.menu-section {
  margin: 0 16px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 24px;
  height: 24px;
  font-size: 20px;
  color: var(--primary-color);
}

.menu-label {
  flex: 1;
  margin-left: 12px;
  font-size: 15px;
}

.menu-arrow {
  font-size: 18px;
  color: #999;
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
</style>

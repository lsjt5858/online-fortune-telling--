<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const plans = [
  {
    level: 1,
    name: '月度会员',
    duration: '30天',
    price: 2800,
    originalPrice: 3800,
    benefits: ['无限次测算', '解锁高级功能', '专属客服'],
    popular: false,
  },
  {
    level: 2,
    name: '年度会员',
    duration: '365天',
    price: 18800,
    originalPrice: 45600,
    benefits: ['无限次测算', '解锁高级功能', '专属客服', '优先响应', '深度解析'],
    popular: true,
  },
  {
    level: 3,
    name: '终身会员',
    duration: '永久',
    price: 88800,
    originalPrice: 999999,
    benefits: ['无限次测算', '解锁所有功能', '专属客服', '优先响应', '深度解析', '新功能优先体验'],
    popular: false,
  },
]

const selectedPlan = ref(2)

const selectPlan = (level: number) => {
  selectedPlan.value = level
}

const handlePurchase = () => {
  // TODO: 调用支付
}

const goBack = () => router.back()
</script>

<template>
  <div class="vip-page">
    <header class="header">
      <button class="back-btn" @click="goBack">
        <div class="i-mdi-arrow-left" />
      </button>
      <h1 class="header-title text-calligraphy">VIP会员</h1>
      <div class="header-spacer" />
    </header>

    <div class="vip-banner">
      <div class="banner-icon i-mdi-crown" />
      <h2 class="banner-title">开通VIP会员</h2>
      <p class="banner-desc">解锁全部高级测算功能，享受尊贵体验</p>
    </div>

    <div class="container">
      <div class="plans">
        <div
          v-for="plan in plans"
          :key="plan.level"
          :class="['plan-card', { active: selectedPlan === plan.level, popular: plan.popular }]"
          @click="selectPlan(plan.level)"
        >
          <div v-if="plan.popular" class="plan-badge">推荐</div>
          <div class="plan-header">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <span class="plan-duration">{{ plan.duration }}</span>
          </div>
          <div class="plan-price">
            <span class="price-current">¥{{ (plan.price / 100).toFixed(2) }}</span>
            <span v-if="plan.originalPrice" class="price-original">
              ¥{{ (plan.originalPrice / 100).toFixed(2) }}
            </span>
          </div>
          <ul class="plan-benefits">
            <li v-for="benefit in plan.benefits" :key="benefit" class="benefit-item">
              <div class="benefit-icon i-mdi-check-circle" />
              <span>{{ benefit }}</span>
            </li>
          </ul>
        </div>
      </div>

      <button class="submit-btn" @click="handlePurchase">
        立即开通 ¥{{ (plans.find(p => p.level === selectedPlan)?.price || 0 / 100).toFixed(2) }}
      </button>

      <div class="agreement">
        开通即表示同意
        <a href="#">《VIP会员协议》</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vip-page {
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

.vip-banner {
  padding: 32px 20px;
  text-align: center;
  background: linear-gradient(135deg, #d4a543, #f0c060);
  color: #fff;
}

.banner-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  font-size: 40px;
}

.banner-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.banner-desc {
  font-size: 14px;
  opacity: 0.9;
}

.container {
  padding: 20px 16px;
}

.plans {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.plan-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.plan-card.active {
  border-color: #d4a543;
}

.plan-card.popular {
  border-color: #d4a543;
}

.plan-badge {
  position: absolute;
  top: -1px;
  right: 16px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #c83737, #d4a543);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 0 0 8px 8px;
}

.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
}

.plan-duration {
  font-size: 13px;
  color: #999;
}

.plan-price {
  margin-bottom: 16px;
}

.price-current {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-color);
}

.price-original {
  margin-left: 8px;
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.plan-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.benefit-item:last-child {
  margin-bottom: 0;
}

.benefit-icon {
  font-size: 16px;
  color: #07c160;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #d4a543, #f0c060);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.agreement {
  margin-top: 16px;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.agreement a {
  color: var(--primary-color);
}
</style>

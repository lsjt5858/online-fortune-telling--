import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/divination',
    name: 'divination',
    component: () => import('@/views/divination/index.vue'),
    meta: { title: '选择占卜方式' },
  },
  {
    path: '/divination/bazi',
    name: 'divination-bazi',
    component: () => import('@/views/divination/bazi/index.vue'),
    meta: { title: '八字排盘', requiresAuth: true },
  },
  {
    path: '/divination/qimen',
    name: 'divination-qimen',
    component: () => import('@/views/divination/qimen/index.vue'),
    meta: { title: '奇门遁甲', requiresAuth: true },
  },
  {
    path: '/divination/bagua',
    name: 'divination-bagua',
    component: () => import('@/views/divination/bagua/index.vue'),
    meta: { title: '八卦测算', requiresAuth: true },
  },
  {
    path: '/divination/meihua',
    name: 'divination-meihua',
    component: () => import('@/views/divination/meihua/index.vue'),
    meta: { title: '梅花易数', requiresAuth: true },
  },
  {
    path: '/result/:id',
    name: 'result',
    component: () => import('@/views/result/index.vue'),
    meta: { title: '测算结果' },
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/user/index.vue'),
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/knowledge',
    name: 'knowledge',
    component: () => import('@/views/knowledge/index.vue'),
    meta: { title: '知识库' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/user/login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/auth/wechat/callback',
    name: 'wechat-callback',
    component: () => import('@/views/auth/WechatCallback.vue'),
    meta: { title: '微信登录' },
  },
  {
    path: '/vip',
    name: 'vip',
    component: () => import('@/views/user/vip.vue'),
    meta: { title: 'VIP会员' },
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('@/views/result/history.vue'),
    meta: { title: '历史记录', requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 神机妙算` : '神机妙算'

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

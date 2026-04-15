import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue'), name: 'home' },
  { path: '/fate', component: () => import('../views/FateView.vue'), name: 'fate' },
  {
    path: '/game',
    component: () => import('../views/GameView.vue'),
    name: 'game',
    children: [
      { path: '', redirect: '/game/explore' },
      // 探索 + 方向移动
      { path: 'explore', component: () => import('../views/ExploreView.vue'), name: 'explore' },
      // 地图
      { path: 'map', component: () => import('../views/MapView.vue'), name: 'map' },
      // 战斗（由探索触发，指向 CombatView）
      { path: 'combat', component: () => import('../views/CombatView.vue'), name: 'combat' },
      // 背包
      { path: 'inventory', component: () => import('../views/InventoryView.vue'), name: 'inventory' },
      // 武功/心法
      { path: 'martial', component: () => import('../views/MartialView.vue'), name: 'martial' },
      // 任务（单独页面）
      { path: 'quests', component: () => import('../views/QuestView.vue'), name: 'quests' },
      // 角色属性
      { path: 'character', component: () => import('../views/CharacterView.vue'), name: 'character' },
    ]
  },
  // 建筑全屏页面（不在 game 子路由下，直接访问）
  { path: '/game/notice', component: () => import('../views/NoticeView.vue'), name: 'notice' },
  { path: '/game/blacksmith', component: () => import('../views/BlacksmithView.vue'), name: 'blacksmith' },
  { path: '/game/pharmacy', component: () => import('../views/PharmacyView.vue'), name: 'pharmacy' },
  { path: '/game/tavern', component: () => import('../views/TavernView.vue'), name: 'tavern' },
  { path: '/game/martialHall', component: () => import('../views/MartialHallView.vue'), name: 'martialHall' },
  { path: '/ending', component: () => import('../views/EndingView.vue'), name: 'ending' },
  { path: '/admin-login', component: () => import('../views/AdminLoginView.vue'), name: 'admin-login' },
  { path: '/admin', component: () => import('../views/AdminView.vue'), name: 'admin' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

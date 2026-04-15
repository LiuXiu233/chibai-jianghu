<template>
  <div class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.name"
      :class="['nav-item', isActive(item.route) ? 'active' : '']"
      @click="navigate(item.route)"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { name: 'explore', label: '探索', icon: '🧭', route: '/game/explore' },
  { name: 'map', label: '地图', icon: '🗺', route: '/game/map' },
  { name: 'martial', label: '武功', icon: '📖', route: '/game/martial' },
  { name: 'inventory', label: '背包', icon: '🎒', route: '/game/inventory' },
  { name: 'character', label: '角色', icon: '👤', route: '/game/character' },
]

function isActive (r) {
  return route.path === r || route.path.startsWith(r + '/')
}

function navigate (r) {
  router.push(r)
}
</script>

<style scoped>
.bottom-nav {
  display: flex;
  flex-shrink: 0;
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom);
  gap: 0;
  /* 确保底部固定 */
  position: relative;
  z-index: 10;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 0;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  background: transparent;
  border: none;
  border-top: 2px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  color: var(--gray);
  -webkit-tap-highlight-color: transparent;
}

.nav-item.active {
  color: var(--red);
  border-top-color: var(--red);
  background: rgba(194, 40, 40, 0.06);
}

.nav-icon {
  font-size: 22px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
</style>

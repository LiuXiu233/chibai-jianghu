<template>
  <div class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.name"
      :class="['nav-item', currentRoute === item.route ? 'active' : '']"
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
  { name: 'combat', label: '战斗', icon: '⚔', route: '/game/combat' },
  { name: 'martial', label: '武功', icon: '📖', route: '/game/martial' },
  { name: 'inventory', label: '背包', icon: '🎒', route: '/game/inventory' },
  { name: 'character', label: '角色', icon: '👤', route: '/game/character' },
]

const currentRoute = computed(() => route.path)
function navigate (r) {
  router.push(r)
}
</script>

<style scoped>
.bottom-nav {
  display: flex;
  background: #0a0a0a;
  border-top: 1px solid var(--border);
  padding: 6px 0;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  overflow-x: auto;
  scrollbar-width: none;
  gap: 0;
}
.bottom-nav::-webkit-scrollbar { display: none; }

.nav-item {
  flex: 1;
  min-width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 2px;
  background: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  color: var(--gray);
}

.nav-item.active {
  color: var(--red);
}

.nav-item.active .nav-icon {
  text-shadow: 0 0 8px rgba(194,40,40,0.6);
}

.nav-icon {
  font-size: 20px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  white-space: nowrap;
}
</style>

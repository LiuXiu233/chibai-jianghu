<template>
  <div class="location-view">
    <!-- 文字日志 -->
    <div class="log-container" ref="logEl">
      <div
        v-for="entry in state.eventLog.slice(-80)" :key="entry.id"
        :class="['log-line', entry.type]"
      >{{ entry.text }}</div>
    </div>

    <!-- 地点信息面板 -->
    <div class="location-panel" v-if="location">
      <div class="loc-header">
        <span class="loc-region text-red">{{ region?.name }}</span>
        <span class="loc-name">{{ location.name }}</span>
      </div>
      <div class="loc-desc">{{ location.desc }}</div>

      <!-- 建筑入口 -->
      <div class="buildings" v-if="location.buildings?.length">
        <div class="buildings-title">可用建筑</div>
        <div class="buildings-grid">
          <button
            v-for="b in location.buildings"
            :key="b"
            class="building-btn"
            @click="enterBuilding(b)"
          >
            {{ buildingNames[b] }}
          </button>
        </div>
      </div>

      <!-- 跨区域移动 -->
      <div class="travel" v-if="neighbors.length">
        <div class="travel-title">前往</div>
        <div class="travel-btns">
          <button
            v-for="n in neighbors"
            :key="n.id"
            class="travel-btn"
            @click="game.travelToRegion(n.id)"
          >
            {{ n.name }}
          </button>
        </div>
      </div>

      <!-- 随机遇敌 -->
      <button class="btn btn-red" @click="triggerRandomEncounter">探索附近</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useGame } from '../composables/useGame'
import { REGIONS, getNeighborRegions } from '../data/regions.js'
import { ENEMY_TEMPLATES } from '../data/enemies.js'

const game = useGame()
const state = game.state
const logEl = ref(null)

const region = computed(() => game.computed.currentRegion.value)
const location = computed(() => game.computed.currentLocation.value)
const neighbors = computed(() => {
  if (!state.player) return []
  return getNeighborRegions(state.player.regionId).map(id => REGIONS.find(r => r.id === id)).filter(Boolean)
})

const buildingNames = {
  notice: '📋 告示栏',
  blacksmith: '🔨 铁匠铺',
  pharmacy: '💊 药铺',
  tavern: '🍶 酒馆',
  martialHall: '⚔ 武馆',
}

function enterBuilding (type) {
  game.enterBuilding(type)
}

function triggerRandomEncounter () {
  const diff = region.value?.difficulty || 1
  const pool = ENEMY_TEMPLATES.filter(e => {
    const rv = { wu: 1, huang: 2, xuan: 3, di: 4, tian: 5 }[e.rank] || 1
    return rv <= diff + 1
  })
  if (!pool.length) return
  const enemy = pool[Math.floor(Math.random() * pool.length)]
  game.startCombat(enemy)
}

// 自动滚动到底部
watch(() => state.eventLog.length, async () => {
  await nextTick()
  if (logEl.value) {
    logEl.value.scrollTop = logEl.value.scrollHeight
  }
})
</script>

<style scoped>
.location-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
}

.location-panel {
  flex-shrink: 0;
  padding: 12px;
  background: #0a0a0a;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 45%;
  overflow-y: auto;
}

.loc-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.loc-region {
  font-size: 12px;
  font-weight: 600;
}

.loc-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--white);
}

.loc-desc {
  font-size: 13px;
  color: var(--gray);
  line-height: 1.5;
}

.buildings-title, .travel-title {
  font-size: 12px;
  color: var(--gray);
  margin-bottom: 6px;
}

.buildings-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.building-btn {
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--white);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.building-btn:hover {
  border-color: var(--red);
  background: rgba(194,40,40,0.1);
}

.travel-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.travel-btn {
  padding: 5px 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--gray);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.travel-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
}
</style>

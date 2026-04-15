<template>
  <div class="explore-view">
    <!-- 当前地点信息 -->
    <div class="location-header">
      <div class="loc-region text-red">{{ region?.name }}</div>
      <div class="loc-name">{{ location?.name }}</div>
      <div class="loc-type text-gray">{{ typeLabel[location?.type] || location?.type }}</div>
    </div>

    <!-- 文字日志 -->
    <div class="log-container" ref="logEl">
      <div
        v-for="entry in recentLogs"
        :key="entry.id"
        :class="['log-line', entry.type]"
      >{{ entry.text }}</div>
    </div>

    <!-- 方向移动 -->
    <div class="dpad-area">
      <button class="dir-btn" @click="move('north')" :disabled="!canMove('north')">↑ 北</button>
      <div class="dpad-row">
        <button class="dir-btn" @click="move('west')" :disabled="!canMove('west')">← 西</button>
        <div class="dir-center">
          <div class="cur-loc">{{ location?.name?.slice(0,2) }}</div>
        </div>
        <button class="dir-btn" @click="move('east')" :disabled="!canMove('east')">东 →</button>
      </div>
      <button class="dir-btn" @click="move('south')" :disabled="!canMove('south')">↓ 南</button>
    </div>

    <!-- 地点操作 -->
    <div class="loc-actions">
      <!-- 探索触发战斗 -->
      <button class="btn btn-red btn-block" @click="explore">
        🔍 探索附近（可能遭遇敌人）
      </button>
      <!-- 建筑入口 -->
      <div class="buildings" v-if="location?.buildings?.length">
        <div class="buildings-grid">
          <button
            v-for="b in location.buildings"
            :key="b"
            class="building-btn"
            @click="goToBuilding(b)"
          >
            {{ buildingIcons[b] }} {{ buildingNames[b] }}
          </button>
        </div>
      </div>
      <!-- 区域传送（传送门地点） -->
      <div class="travel-section" v-if="location?.travelTo?.length">
        <div class="travel-title text-gray">—— 跨区域 ——</div>
        <div class="travel-btns">
          <button
            v-for="rid in location.travelTo"
            :key="rid"
            class="travel-btn"
            @click="travel(rid)"
          >
            → {{ getRegionName(rid) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { REGIONS } from '../data/regions.js'

const router = useRouter()
const game = useGame()
const state = game.state
const logEl = ref(null)

const region = computed(() => game.computed.currentRegion.value)
const location = computed(() => game.computed.currentLocation.value)
const recentLogs = computed(() => (state.eventLog || []).slice(-30))

const typeLabel = {
  town: '城镇', city: '都市', village: '村落', mountain: '名山',
  dungeon: '秘境', wilderness: '荒野', temple: '寺庙', sect: '门派',
  pass: '关隘', valley: '幽谷', island: '孤岛', oasis: '绿洲',
  fort: '堡垒', secret: '秘境', sea: '海域', reef: '礁石',
  pirate: '贼窝', port: '港口', bay: '海湾', volcano: '火山',
  brothel: '销金窟', mansion: '楼阁',
}

const buildingNames = {
  notice: '告示栏', blacksmith: '铁匠铺', pharmacy: '药铺',
  tavern: '酒馆', martialHall: '武馆',
}
const buildingIcons = {
  notice: '📋', blacksmith: '🔨', pharmacy: '💊',
  tavern: '🍶', martialHall: '⚔',
}

function canMove (direction) {
  const loc = location.value
  if (!loc) return false
  const conn = loc.connections?.[direction]
  return !!conn
}

function move (direction) {
  game.move(direction)
}

function explore () {
  if ((state.player.daily_actions_used || 0) >= state.player.max_daily_actions) {
    game.addLog('今日行动次数已用尽。', 'system')
    return
  }
  const diff = region.value?.difficulty || 1
  const pool = ENEMY_TEMPLATES.filter(e => {
    const rv = { wu: 1, huang: 2, xuan: 3, di: 4, tian: 5 }[e.rank] || 1
    return rv <= diff + 1
  })
  if (!pool.length) return
  const enemy = pool[Math.floor(Math.random() * pool.length)]
  const ok = game.startCombat(enemy)
  if (ok !== false) {
    router.push('/game/combat')
  }
}

function goToBuilding (type) {
  state.building = { type, data: null }
  state.phase = 'building'
  if (type === 'notice') router.push('/game/notice')
  else if (type === 'blacksmith') router.push('/game/blacksmith')
  else if (type === 'pharmacy') router.push('/game/pharmacy')
  else if (type === 'tavern') router.push('/game/tavern')
  else if (type === 'martialHall') router.push('/game/martialHall')
}

function travel (regionId) {
  const name = getRegionName(regionId)
  if (confirm(`确定前往【${name}】吗？需要消耗8回合。`)) {
    game.travelToRegion(regionId)
  }
}

function getRegionName (id) {
  return REGIONS.find(r => r.id === id)?.name || id
}

import { ENEMY_TEMPLATES } from '../data/enemies.js'

watch(() => state.eventLog.length, async () => {
  await nextTick()
  if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
})
</script>

<style scoped>
.explore-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.location-header {
  flex-shrink: 0;
  padding: 8px 12px;
  text-align: center;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card);
}

.loc-region { font-size: 11px; font-weight: 600; }
.loc-name { font-size: 18px; font-weight: 900; color: #1A1A1A; }
.loc-type { font-size: 11px; }

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  background: var(--white);
}

.log-line { font-size: 13px; line-height: 1.8; color: #333; }
.log-line.event { color: #555; }
.log-line.combat { color: var(--red); font-weight: 600; }
.log-line.system { color: var(--gold); }

.dpad-area {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 12px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
}

.dpad-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dir-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: #1A1A1A;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 3px;
  transition: all 0.15s;
  min-width: 60px;
  text-align: center;
}
.dir-btn:hover:not(:disabled) { border-color: var(--red); background: rgba(194,40,40,0.15); }
.dir-btn:active:not(:disabled) { background: var(--red); color: white; }
.dir-btn:disabled { opacity: 0.25; cursor: not-allowed; }

.dir-center {
  width: 44px;
  height: 44px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cur-loc { font-size: 11px; color: var(--gray); }

.loc-actions {
  flex-shrink: 0;
  padding: 8px 12px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-block {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border-radius: 3px;
}

.buildings-grid {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.building-btn {
  flex: 1;
  min-width: 60px;
  padding: 7px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  color: #1A1A1A;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.building-btn:hover { border-color: var(--red); background: rgba(194,40,40,0.1); }

.travel-section { display: flex; flex-direction: column; gap: 4px; }
.travel-title { font-size: 11px; text-align: center; }
.travel-btns { display: flex; gap: 6px; flex-wrap: wrap; }

.travel-btn {
  flex: 1;
  padding: 6px 10px;
  background: rgba(194,40,40,0.1);
  border: 1px solid var(--red-dark);
  border-radius: 3px;
  color: var(--red);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.travel-btn:hover { background: rgba(194,40,40,0.2); }
</style>

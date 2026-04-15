<template>
  <div class="map-view">
    <!-- 区域切换 -->
    <div class="region-tabs">
      <button
        v-for="r in allRegions"
        :key="r.id"
        :class="['r-tab', isCurrentRegion(r.id) ? 'active' : '']"
        @click="switchRegion(r.id)"
      >{{ r.name }}</button>
    </div>

    <!-- 当前地点 -->
    <div class="cur-loc-card">
      <div class="clc-top">
        <span class="clc-badge">当前</span>
        <span class="clc-name">{{ currentLoc?.name }}</span>
      </div>
      <div class="clc-info text-gray">
        {{ currentRegion?.name }} · {{ typeLabel[currentLoc?.type] || currentLoc?.type }}
      </div>
      <button class="btn btn-red btn-sm" @click="goExplore">进入探索</button>
    </div>

    <!-- 方位导航图 -->
    <div class="compass-area">
      <div class="compass">
        <!-- 北 -->
        <div v-if="northLoc" class="dir-node dir-north" @click="doMove('north')">
          <span class="dir-label">北</span>
          <span class="dir-name">{{ northLoc.name }}</span>
        </div>
        <div v-else class="dir-node dir-north dir-empty">—</div>

        <!-- 东西 + 中间 -->
        <div class="middle-row">
          <div v-if="westLoc" class="dir-node dir-west" @click="doMove('west')">
            <span class="dir-label">西</span>
            <span class="dir-name">{{ westLoc.name }}</span>
          </div>
          <div v-else class="dir-node dir-west dir-empty">—</div>

          <!-- 中心：当前地点 -->
          <div class="cur-node">
            <div class="cur-icon">📍</div>
            <div class="cur-name">{{ currentLoc?.name?.slice(0,2) }}</div>
          </div>

          <div v-if="eastLoc" class="dir-node dir-east" @click="doMove('east')">
            <span class="dir-label">东</span>
            <span class="dir-name">{{ eastLoc.name }}</span>
          </div>
          <div v-else class="dir-node dir-east dir-empty">—</div>
        </div>

        <!-- 南 -->
        <div v-if="southLoc" class="dir-node dir-south" @click="doMove('south')">
          <span class="dir-label">南</span>
          <span class="dir-name">{{ southLoc.name }}</span>
        </div>
        <div v-else class="dir-node dir-south dir-empty">—</div>
      </div>
    </div>

    <!-- 传送门 -->
    <div class="portal-section" v-if="currentLoc?.travelTo?.length">
      <div class="portal-title text-gray">—— 跨区域 ——</div>
      <div class="portal-list">
        <button
          v-for="rid in currentLoc.travelTo"
          :key="rid"
          class="portal-btn"
          @click="doPortal(rid)"
        >
          → {{ getRegionName(rid) }}
        </button>
      </div>
    </div>

    <!-- 本区域所有地点 -->
    <div class="region-locs">
      <div class="section-label text-gray">—— {{ currentRegion?.name }} 全部地点 ——</div>
      <div class="loc-grid">
        <div
          v-for="loc in allRegionLocs"
          :key="loc.id"
          :class="['loc-chip', loc.id === currentLoc?.id ? 'loc-current' : '']"
        >
          {{ loc.name }}
          <span v-if="loc.travelTo?.length" class="portal-dot">🔴</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { REGIONS } from '../data/regions.js'

const router = useRouter()
const game = useGame()
const state = game.state

const allRegions = REGIONS
const currentRegion = computed(() => REGIONS.find(r => r.id === state.player?.regionId))
const currentLoc = computed(() => game.computed.currentLocation.value)

const typeLabel = {
  town: '城镇', city: '都市', village: '村落', mountain: '名山',
  dungeon: '秘境', wilderness: '荒野', temple: '寺庙', sect: '门派',
  pass: '关隘', valley: '幽谷', island: '孤岛', oasis: '绿洲',
  fort: '堡垒', secret: '秘境', sea: '海域', reef: '礁石',
  pirate: '贼窝', port: '港口', bay: '海湾', volcano: '火山',
  brothel: '销金窟', mansion: '楼阁',
}

function isCurrentRegion (id) { return state.player?.regionId === id }

const northLoc = computed(() => {
  const id = currentLoc.value?.connections?.north
  return id ? currentRegion.value?.locations?.find(l => l.id === id) : null
})
const southLoc = computed(() => {
  const id = currentLoc.value?.connections?.south
  return id ? currentRegion.value?.locations?.find(l => l.id === id) : null
})
const westLoc = computed(() => {
  const id = currentLoc.value?.connections?.west
  return id ? currentRegion.value?.locations?.find(l => l.id === id) : null
})
const eastLoc = computed(() => {
  const id = currentLoc.value?.connections?.east
  return id ? currentRegion.value?.locations?.find(l => l.id === id) : null
})

const allRegionLocs = computed(() => currentRegion.value?.locations || [])

function switchRegion (id) {
  if (id === state.player?.regionId) return
  if (confirm(`确定前往【${getRegionName(id)}】吗？需要消耗8回合。`)) {
    game.travelToRegion(id)
  }
}

function getRegionName (id) {
  return REGIONS.find(r => r.id === id)?.name || id
}

function goExplore () { router.push('/game/explore') }

function doMove (dir) {
  game.move(dir)
  router.push('/game/explore')
}

function doPortal (regionId) {
  const name = getRegionName(regionId)
  if (confirm(`确定前往【${name}】吗？需要消耗8回合。`)) {
    game.travelToRegion(regionId)
  }
}
</script>

<style scoped>
.map-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

.region-tabs {
  flex-shrink: 0;
  display: flex;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
  gap: 0;
}
.region-tabs::-webkit-scrollbar { display: none; }

.r-tab {
  flex-shrink: 0;
  padding: 8px 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--gray);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.r-tab.active {
  color: var(--red);
  border-bottom-color: var(--red);
}

/* 当前地点卡片 */
.cur-loc-card {
  flex-shrink: 0;
  padding: 14px 16px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.clc-top { display: flex; align-items: center; gap: 6px; }
.clc-badge {
  font-size: 10px;
  color: var(--red);
  background: rgba(194,40,40,0.1);
  border: 1px solid var(--red-dark);
  padding: 1px 5px;
  border-radius: 2px;
}
.clc-name { font-size: 20px; font-weight: 900; color: #1A1A1A; }
.clc-info { font-size: 12px; }

/* 指南针区域 */
.compass-area {
  flex-shrink: 0;
  padding: 16px 12px;
  background: var(--white);
  display: flex;
  justify-content: center;
}

.compass {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 240px;
}

.middle-row {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.dir-node {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 48px;
  justify-content: center;
}
.dir-node:hover:not(.dir-empty) {
  border-color: var(--red);
  background: rgba(194,40,40,0.06);
}
.dir-empty {
  opacity: 0.3;
  cursor: default;
}

.dir-north { border-top: 2px solid #6495ed; }
.dir-south { border-bottom: 2px solid #ffa500; }
.dir-east  { border-right: 2px solid #32cd32; }
.dir-west  { border-left: 2px solid #ffb6c1; }

.dir-label {
  font-size: 10px;
  font-weight: 700;
}
.dir-north .dir-label { color: #6495ed; }
.dir-south .dir-label { color: #ffa500; }
.dir-east  .dir-label { color: #32cd32; }
.dir-west  .dir-label { color: #ff69b4; }

.dir-name { font-size: 11px; color: #1A1A1A; text-align: center; line-height: 1.3; }

/* 中心节点 */
.cur-node {
  width: 52px;
  height: 52px;
  background: var(--red);
  border: 2px solid var(--red-dark);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(194,40,40,0.4);
}
.cur-icon { font-size: 18px; line-height: 1; }
.cur-name { font-size: 10px; color: #fff; font-weight: 700; }

/* 传送门 */
.portal-section {
  flex-shrink: 0;
  padding: 10px 16px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.portal-title { font-size: 11px; letter-spacing: 0.1em; text-align: center; }
.portal-list { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.portal-btn {
  flex: 1;
  min-width: 80px;
  padding: 7px 12px;
  background: rgba(194,40,40,0.08);
  border: 1px solid var(--red-dark);
  border-radius: 4px;
  color: var(--red);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.portal-btn:hover { background: rgba(194,40,40,0.15); }

/* 区域地点列表 */
.region-locs {
  flex: 1;
  overflow-y: auto;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.section-label { font-size: 11px; letter-spacing: 0.1em; }

.loc-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.loc-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  font-size: 12px;
  color: var(--gray);
}
.loc-chip.loc-current {
  background: rgba(194,40,40,0.08);
  border-color: var(--red-dark);
  color: var(--red);
  font-weight: 600;
}
.portal-dot { font-size: 8px; }
</style>

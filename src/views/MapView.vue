<template>
  <div class="map-view">
    <!-- 区域切换 -->
    <div class="region-tabs">
      <button
        v-for="r in allRegions"
        :key="r.id"
        :class="['r-tab', currentRegion?.id === r.id ? 'active' : '']"
        @click="switchRegion(r.id)"
      >{{ r.name }}</button>
    </div>

    <!-- 地图区域 -->
    <div class="map-canvas" ref="mapEl">
      <!-- SVG 连接线 -->
      <svg class="conn-svg" :viewBox="`0 0 ${canvasW} ${canvasH}`">
        <line
          v-for="(line, i) in connectionLines"
          :key="i"
          :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2"
          stroke="#333" stroke-width="1.5" stroke-dasharray="3,3"
        />
      </svg>

      <!-- 地点节点 -->
      <div
        v-for="loc in layoutLocations"
        :key="loc.id"
        :class="['map-node', loc.isCurrent ? 'current' : '', loc.isPortal ? 'portal' : '']"
        :style="{ left: loc.x + 'px', top: loc.y + 'px' }"
        @click="onLocClick(loc)"
      >
        <div class="node-dot" :class="'dot-' + loc.type"></div>
        <div class="node-name">{{ loc.name }}</div>
        <div class="node-type text-gray">{{ shortType[loc.type] }}</div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="map-legend">
      <span class="legend-item"><span class="dot-current"></span> 当前位置</span>
      <span class="legend-item"><span class="dot-portal"></span> 可传送</span>
      <span class="legend-item"><span class="dot-dungeon"></span> 秘境</span>
      <span class="legend-item"><span class="dot-city"></span> 城镇</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { REGIONS } from '../data/regions.js'

const router = useRouter()
const game = useGame()
const state = game.state
const mapEl = ref(null)

const allRegions = REGIONS
const currentRegion = computed(() => REGIONS.find(r => r.id === state.player?.regionId))

// 布局：强制用圆形布局排列地点
const canvasW = 340
const canvasH = 500

const layoutLocations = computed(() => {
  const region = currentRegion.value
  if (!region) return []
  const locs = region.locations
  const n = locs.length
  // 圆形排列，当前位置在顶部
  const cx = canvasW / 2
  const cy = canvasH / 2
  const r = Math.min(canvasW, canvasH) * 0.38

  // 当前地点在顶部
  const curIdx = locs.findIndex(l => l.id === state.player?.locationId)

  return locs.map((loc, i) => {
    let angle
    if (i === curIdx) {
      angle = -Math.PI / 2 // 顶部
    } else {
      // 其余均匀分布，跳过顶部
      const others = n - 1
      const offsetIdx = i < curIdx ? i : i - 1
      angle = (offsetIdx / others) * Math.PI * 2 - Math.PI / 2
    }
    const x = cx + r * Math.cos(angle) - 24
    const y = cy + r * Math.sin(angle) * 0.75 - 18
    return {
      ...loc,
      x: Math.max(4, Math.min(canvasW - 52, x)),
      y: Math.max(4, Math.min(canvasH - 40, y)),
      isCurrent: loc.id === state.player?.locationId,
      isPortal: !!loc.travelTo?.length,
    }
  })
})

// 生成连接线
const connectionLines = computed(() => {
  const region = currentRegion.value
  if (!region) return []
  const lines = []
  const locMap = {}
  layoutLocations.value.forEach(l => { locMap[l.id] = l })

  for (const loc of region.locations) {
    const from = locMap[loc.id]
    if (!from) continue
    const dirs = ['north', 'south', 'east', 'west']
    for (const dir of dirs) {
      const neighborId = loc.connections?.[dir]
      if (!neighborId) continue
      const to = locMap[neighborId]
      if (!to) continue
      // 避免重复画线（只画一次）
      if (loc.id < neighborId) {
        lines.push({ x1: from.x + 24, y1: from.y + 18, x2: to.x + 24, y2: to.y + 18 })
      }
    }
  }
  return lines
})

const shortType = {
  town: '镇', city: '城', village: '村', mountain: '山',
  dungeon: '洞', wilderness: '野', temple: '寺', sect: '派',
  pass: '关', valley: '谷', island: '岛', oasis: '泉',
  fort: '堡', secret: '秘', sea: '海', reef: '礁',
  pirate: '盗', port: '港', bay: '湾', volcano: '火',
  brothel: '楼', mansion: '庄',
}

function switchRegion (id) {
  game.travelToRegion(id)
}

function onLocClick (loc) {
  // 如果点击的是当前位置，直接跳转探索
  if (loc.isCurrent) {
    router.push('/game/explore')
    return
  }
  // 否则提示先移动（地图只做展示）
}
</script>

<style scoped>
.map-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #080808;
}

.region-tabs {
  flex-shrink: 0;
  display: flex;
  background: #0a0a0a;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
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
}
.r-tab.active {
  color: var(--red);
  border-bottom-color: var(--red);
}

.map-canvas {
  flex: 1;
  position: relative;
  overflow: auto;
  padding: 8px;
}

.conn-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.map-node {
  position: absolute;
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  cursor: default;
  user-select: none;
}

.node-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--gray);
  border: 2px solid transparent;
}

.dot-city, .dot-town { background: #4a9eff; }
.dot-dungeon, .dot-secret { background: #9b59b6; }
.dot-temple, .dot-sect { background: var(--gold); }
.dot-portal { background: var(--red); box-shadow: 0 0 6px rgba(194,40,40,0.6); }

.map-node.current .node-dot {
  background: var(--red);
  border-color: var(--white);
  box-shadow: 0 0 8px rgba(194,40,40,0.8);
  width: 14px;
  height: 14px;
}
.map-node.portal .node-dot {
  background: var(--red);
  box-shadow: 0 0 4px rgba(194,40,40,0.5);
}

.node-name {
  font-size: 10px;
  color: var(--white);
  text-align: center;
  white-space: nowrap;
}
.map-node.current .node-name { color: var(--red); font-weight: 700; }

.node-type { font-size: 9px; }

.map-legend {
  flex-shrink: 0;
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  background: #0a0a0a;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--gray);
}

.dot-current, .dot-portal {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot-current { background: var(--red); }
.dot-portal { background: var(--red); box-shadow: 0 0 4px rgba(194,40,40,0.5); }
.dot-dungeon { background: #9b59b6; width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-city { background: #4a9eff; width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
</style>

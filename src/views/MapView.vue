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

    <div class="map-body">
      <!-- 当前地点 -->
      <div class="cur-loc-card" v-if="currentLoc">
        <div class="clc-tag">当前位置</div>
        <div class="clc-name">{{ currentLoc.name }}</div>
        <div class="clc-type text-gray">{{ typeLabel[currentLoc.type] || currentLoc.type }}</div>
        <div class="clc-region text-gray">—— {{ currentRegion?.name }} ——</div>
        <button class="btn btn-red btn-sm" @click="goExplore">前往探索</button>
      </div>

      <!-- 相邻地点列表 -->
      <div class="neighbors-section" v-if="neighbors.length">
        <div class="section-label text-gray">—— 可前往 ——</div>
        <div class="neighbor-list">
          <div
            v-for="n in neighbors"
            :key="n.locId"
            class="neighbor-item"
          >
            <div class="ni-dir">
              <span class="dir-badge" :class="'dir-' + n.dir">{{ dirLabel[n.dir] }}</span>
            </div>
            <div class="ni-info">
              <div class="ni-name">{{ n.name }}</div>
              <div class="ni-type text-gray">{{ typeLabel[n.type] || n.type }}</div>
            </div>
            <button class="btn-move" @click="moveTo(n.locId, n.dir)">
              {{ n.isPortal ? '传送' : '前往' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 本区域其他地点 -->
      <div class="other-section" v-if="otherLocs.length">
        <div class="section-label text-gray">—— 本区域其他地点 ——</div>
        <div class="other-list">
          <div v-for="loc in otherLocs" :key="loc.id" class="other-item">
            <span :class="['rank-dot', 'dot-' + loc.type]"></span>
            <span class="oi-name">{{ loc.name }}</span>
            <span class="oi-type text-gray">{{ shortType[loc.type] }}</span>
            <span v-if="loc.travelTo?.length" class="oi-portal text-red">可传送</span>
          </div>
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

const dirLabel = { north: '北', south: '南', east: '东', west: '西' }
const typeLabel = {
  town: '城镇', city: '都市', village: '村落', mountain: '名山',
  dungeon: '秘境', wilderness: '荒野', temple: '寺庙', sect: '门派',
  pass: '关隘', valley: '幽谷', island: '孤岛', oasis: '绿洲',
  fort: '堡垒', secret: '秘境', sea: '海域', reef: '礁石',
  pirate: '贼窝', port: '港口', bay: '海湾', volcano: '火山',
  brothel: '销金窟', mansion: '楼阁',
}
const shortType = {
  town: '镇', city: '城', village: '村', mountain: '山',
  dungeon: '洞', wilderness: '野', temple: '寺', sect: '派',
  pass: '关', valley: '谷', island: '岛', oasis: '泉',
  fort: '堡', secret: '秘', sea: '海', reef: '礁',
  pirate: '盗', port: '港', bay: '湾', volcano: '火',
  brothel: '楼', mansion: '庄',
}

// 找出相邻地点（直接连接的 + 传送门可前往的）
const neighbors = computed(() => {
  const loc = currentLoc.value
  if (!loc) return []
  const result = []
  const dirs = ['north', 'south', 'east', 'west']

  for (const dir of dirs) {
    const neighborId = loc.connections?.[dir]
    if (!neighborId) continue
    // 找邻居信息
    const region = currentRegion.value
    const neighbor = region?.locations?.find(l => l.id === neighborId)
    if (neighbor) {
      result.push({
        locId: neighbor.id,
        name: neighbor.name,
        type: neighbor.type,
        dir,
        isPortal: !!neighbor.travelTo?.length,
      })
    }
  }

  // 如果当前地点是传送门，加上其他区域入口
  if (loc.travelTo?.length) {
    for (const rid of loc.travelTo) {
      const region = REGIONS.find(r => r.id === rid)
      if (!region) continue
      const entryLoc = region.locations?.find(l => l.id === region.entry)
      if (entryLoc) {
        result.push({
          locId: entryLoc.id,
          name: entryLoc.name + '（' + region.name + '）',
          type: entryLoc.type,
          dir: 'portal',
          isPortal: true,
          regionId: rid,
        })
      }
    }
  }

  return result
})

// 本区域其他非相邻地点
const otherLocs = computed(() => {
  const region = currentRegion.value
  const loc = currentLoc.value
  if (!region || !loc) return []
  const neighborIds = new Set()
  for (const n of neighbors.value) neighborIds.add(n.locId)
  neighborIds.add(loc.id)

  return region.locations
    .filter(l => !neighborIds.has(l.id))
    .slice(0, 10) // 最多显示10个
})

function switchRegion (id) {
  game.travelToRegion(id)
}

function goExplore () {
  router.push('/game/explore')
}

function moveTo (locId, dir) {
  if (dir === 'portal') {
    // 传送门跳转其他区域
    const n = neighbors.value.find(x => x.locId === locId && x.regionId)
    if (n) {
      if (confirm(`确定前往【${n.name.replace(/（.*）/,'')}】吗？需要消耗8回合。`)) {
        game.travelToRegion(n.regionId)
      }
    }
    return
  }
  // 普通移动
  game.move(dir)
  router.push('/game/explore')
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
  background: #0a0a0a;
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

.map-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cur-loc-card {
  background: var(--bg-card);
  border: 1px solid var(--red-dark);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.clc-tag {
  font-size: 11px;
  color: var(--red);
  background: rgba(194,40,40,0.15);
  border: 1px solid var(--red-dark);
  padding: 2px 8px;
  border-radius: 2px;
}

.clc-name {
  font-size: 22px;
  font-weight: 900;
  color: #1A1A1A;
}

.clc-type { font-size: 13px; }
.clc-region { font-size: 12px; }

.btn-sm {
  padding: 7px 20px;
  font-size: 13px;
  border-radius: 3px;
  margin-top: 4px;
}

.neighbors-section, .other-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label { font-size: 11px; letter-spacing: 0.1em; text-align: center; }

.neighbor-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.neighbor-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.ni-dir { flex-shrink: 0; }

.dir-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 700;
}
.dir-north { background: rgba(100,149,237,0.2); color: #6495ed; border: 1px solid rgba(100,149,237,0.4); }
.dir-south { background: rgba(255,140,0,0.2); color: #ffa500; border: 1px solid rgba(255,140,0,0.4); }
.dir-east { background: rgba(50,205,50,0.2); color: #32cd32; border: 1px solid rgba(50,205,50,0.4); }
.dir-west { background: rgba(255,182,193,0.2); color: #ffb6c1; border: 1px solid rgba(255,182,193,0.4); }
.dir-portal { background: rgba(194,40,40,0.2); color: var(--red); border: 1px solid rgba(194,40,40,0.4); }

.ni-info { flex: 1; }
.ni-name { font-size: 14px; font-weight: 600; color: #1A1A1A; }
.ni-type { font-size: 11px; }

.btn-move {
  flex-shrink: 0;
  padding: 5px 12px;
  background: rgba(194,40,40,0.1);
  border: 1px solid var(--red-dark);
  border-radius: 3px;
  color: var(--red);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-move:hover { background: rgba(194,40,40,0.2); }
.btn-move:active { background: var(--red); color: white; }

.other-list { display: flex; flex-direction: column; gap: 3px; }

.other-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--bg-card);
  border-radius: 3px;
  opacity: 0.6;
}

.rank-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-city, .dot-town { background: #4a9eff; }
.dot-dungeon, .dot-secret { background: #9b59b6; }
.dot-temple, .dot-sect { background: var(--gold); }
.dot-portal { background: var(--red); }

.oi-name { flex: 1; font-size: 12px; color: #1A1A1A; }
.oi-type { font-size: 10px; }
.oi-portal { font-size: 10px; }
</style>

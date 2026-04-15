<template>
  <div class="tavern-view">
    <div class="view-header">
      <button class="back-btn" @click="back">← 返回</button>
      <span class="view-title">🍶 酒馆</span>
    </div>

    <div class="tavern-content">
      <!-- 酒馆闲聊 -->
      <div class="gossip-card">
        <div class="gossip-label text-gray">—— 江湖传闻 ——</div>
        <div
          class="gossip-text"
          :class="buildingData?.type === 'hidden' ? 'hidden-hint' : ''"
        >
          <template v-if="buildingData?.type === 'hidden'">
            📍 {{ buildingData.location?.name }}
            <br>{{ buildingData.location?.desc }}
          </template>
          <template v-else-if="buildingData?.text">
            {{ buildingData.text }}
          </template>
          <template v-else>
            酒馆里人来人往，杯盏交错间，不知在说些什么……
          </template>
        </div>
        <div v-if="buildingData?.type === 'hidden'" class="hidden-hint-badge">
          🔔 发现隐秘之地线索！
        </div>
      </div>

      <!-- 打听新消息 -->
      <button class="btn btn-ghost btn-block" @click="listenMore">
        👂 继续打听（消耗1回合）
      </button>

      <!-- 隐藏地点列表 -->
      <div class="section-title" v-if="discovered.length">—— 已发现隐秘地点 ——</div>
      <div v-if="discovered.length" class="hidden-list">
        <div v-for="loc in discovered" :key="loc.id" class="hidden-card">
          <div class="hc-name">{{ loc.name }}</div>
          <div class="hc-region text-gray">{{ getRegionName(loc.regionId) }}</div>
        </div>
      </div>

      <!-- 休息（恢复） -->
      <div class="rest-section">
        <div class="rest-title text-gray">—— 休息恢复 ——</div>
        <div class="rest-cost">💰 20两银子可在此休息，恢复体力与内力至满</div>
        <button
          class="btn btn-red btn-block"
          @click="rest"
          :disabled="state.player?.gold < 20"
        >
          {{ state.player?.gold >= 20 ? '休息一晚' : '银两不足' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { REGIONS, HIDDEN_LOCATIONS } from '../data/regions.js'

const router = useRouter()
const game = useGame()
const state = game.state

const buildingData = computed(() => state.building?.data)

const discovered = computed(() => {
  const ids = state.player?.discovered_locations || []
  return HIDDEN_LOCATIONS.filter(l => ids.includes(l.id))
})

function listenMore () {
  game.enterBuilding('tavern')
}

function rest () {
  if (state.player.gold < 20) return
  state.player.gold -= 20
  state.player.current_stamina = state.player.max_stamina
  state.player.current_qi = state.player.max_qi
  state.player.current_hp = Math.min(state.player.max_hp, state.player.current_hp + Math.floor(state.player.max_hp * 0.3))
  game.addLog('你在酒馆休息了一晚，体力与内力完全恢复！', 'event')
}

function getRegionName (id) {
  return REGIONS.find(r => r.id === id)?.name || id
}

function back () { state.phase = 'main'; router.push('/game/explore') }
</script>

<style scoped>
.tavern-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.view-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #0a0a0a;
  border-bottom: 1px solid var(--border);
}

.back-btn {
  background: transparent;
  border: none;
  color: var(--red);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}

.view-title { font-size: 16px; font-weight: 700; color: var(--white); }

.tavern-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.gossip-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gossip-label { font-size: 11px; }

.gossip-text {
  font-size: 14px;
  color: var(--gray);
  line-height: 1.8;
  font-style: italic;
}

.gossip-text.hidden-hint {
  color: var(--gold);
  font-style: normal;
  font-weight: 600;
  line-height: 1.8;
}

.hidden-hint-badge {
  font-size: 12px;
  color: var(--red);
  background: rgba(194,40,40,0.15);
  border: 1px solid var(--red-dark);
  padding: 4px 8px;
  border-radius: 3px;
  text-align: center;
}

.section-title { font-size: 12px; color: var(--gray); letter-spacing: 0.1em; }

.hidden-list { display: flex; flex-direction: column; gap: 6px; }

.hidden-card {
  background: rgba(194,40,40,0.1);
  border: 1px solid var(--red-dark);
  border-radius: 3px;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hc-name { font-size: 13px; color: var(--white); font-weight: 600; }
.hc-region { font-size: 11px; }

.rest-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
}

.rest-title { font-size: 11px; }
.rest-cost { font-size: 13px; color: var(--gray); }

.btn-block { width: 100%; margin-top: 4px; }
</style>

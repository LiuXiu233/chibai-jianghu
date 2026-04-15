<template>
  <div class="martial-hall-view">
    <div class="view-header">
      <button class="back-btn" @click="back">← 返回</button>
      <span class="view-title">⚔ 武馆</span>
    </div>

    <div class="mh-content">
      <!-- 当前武学 -->
      <div class="current-martial" v-if="currentMartial">
        <div class="cm-label text-gray">—— 武馆传授 ——</div>
        <div class="martial-card">
          <div class="mc-header">
            <span :class="['rank-tag','rank-'+currentMartial.rank]">{{ rankLabel[currentMartial.rank] }}</span>
            <span class="mc-name">{{ currentMartial.name }}</span>
          </div>
          <div class="mc-type text-gray">{{ typeLabel[currentMartial.type] || '武学' }}</div>
          <div class="mc-desc">{{ currentMartial.desc }}</div>
          <div class="mc-attrs" v-if="currentMartial.attrs">
            <span v-for="(v, k) in currentMartial.attrs" :key="k" class="attr-chip">
              {{ attrNames[k] || k }} +{{ v }}
            </span>
          </div>
          <div class="mc-req" v-if="currentMartial.rank !== 'wu'">
            <span class="text-gray">悟性要求：</span>
            <span :class="canLearn ? 'text-gold' : 'text-red'">
              {{ getReq(currentMartial.rank) }}（你 {{ state.player?.attrs?.悟性 }}）
            </span>
          </div>
          <div class="mc-cd" v-if="hallCooldown > 0">
            ⚠️ 武馆冷却中，还需 {{ hallCooldown }} 回合
          </div>
          <div class="mc-actions">
            <button class="btn btn-red" @click="learn" :disabled="hallCooldown > 0">
              {{ hallCooldown > 0 ? '冷却中' : '修习此招' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-tip">
        武馆今日无武功传授……
      </div>

      <!-- 已学会武学 -->
      <div class="known-section">
        <div class="section-title">已掌握武学</div>
        <div v-if="knownMartials.length" class="known-list">
          <div v-for="m in knownMartials" :key="m.martial_id" class="known-item">
            <span :class="['rank-tag','rank-'+m.data.rank]">{{ rankLabel[m.data.rank] }}</span>
            <span class="ki-name">{{ m.data.name }}</span>
            <span class="ki-mastery text-gold">{{ m.mastery }}/100</span>
          </div>
        </div>
        <div v-else class="text-gray" style="font-size:13px">尚未学习任何武学</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'

const router = useRouter()
const game = useGame()
const state = game.state

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const attrNames = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性' }
const typeLabel = { external: '外功', internal: '内功', unarmed: '空手' }

const currentMartial = computed(() => state.building?.data?.id ? state.building.data : null)

const hallCooldown = computed(() => state.player?.martialHallCooldown || 0)

const canLearn = computed(() => {
  const m = currentMartial.value
  if (!m) return false
  if (m.rank === 'wu') return true
  const req = { tian: 28, di: 22, xuan: 16, huang: 10, wu: 0 }[m.rank] || 10
  return (state.player?.attrs?.悟性 || 0) >= req
})

const knownMartials = computed(() => game.getKnownMartials())

function getReq (rank) {
  return { tian: 28, di: 22, xuan: 16, huang: 10, wu: 0 }[rank] || 10
}

function learn () { game.learnAtMartialHall() }

function refresh () { game.enterBuilding('martialHall') }

function back () { state.phase = 'main'; router.push('/game/explore') }
</script>

<style scoped>
.martial-hall-view {
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

.view-title { font-size: 16px; font-weight: 700; color: #1A1A1A; }

.mh-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cm-label { font-size: 11px; letter-spacing: 0.1em; }

.martial-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mc-header { display: flex; align-items: center; gap: 8px; }
.mc-name { font-size: 18px; font-weight: 900; color: #1A1A1A; }
.mc-type { font-size: 12px; }
.mc-desc { font-size: 13px; color: var(--gray); line-height: 1.6; }

.mc-attrs { display: flex; flex-wrap: wrap; gap: 4px; }
.attr-chip {
  font-size: 11px;
  color: var(--gold);
  background: rgba(255,215,0,0.1);
  border: 1px solid rgba(255,215,0,0.3);
  padding: 2px 6px;
  border-radius: 2px;
}

.mc-req { font-size: 13px; }
.mc-cd {
  font-size: 13px;
  color: var(--blue);
  background: rgba(30,58,138,0.2);
  border: 1px solid rgba(30,58,138,0.4);
  padding: 4px 8px;
  border-radius: 3px;
}

.mc-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px;
  color: var(--gray);
  font-size: 13px;
}

.known-section { display: flex; flex-direction: column; gap: 8px; }
.section-title { font-size: 12px; color: var(--gray); letter-spacing: 0.1em; }

.known-list { display: flex; flex-direction: column; gap: 4px; }
.known-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-card);
  border-radius: 3px;
}
.ki-name { flex: 1; font-size: 13px; color: #1A1A1A; }
.ki-mastery { font-size: 11px; }
</style>

<template>
  <div class="ending-view">
    <div class="ending-title pulse-red">江湖路尽</div>

    <div class="ending-days">
      <div class="days-label">你共闯荡了</div>
      <div class="days-val text-red">{{ state.clock > 0 ? Math.floor(state.clock / 24) : 1000 }} 天</div>
    </div>

    <div class="ending-summary">
      <div class="summary-title">江湖评语</div>
      <div class="summary-text">{{ endingText }}</div>
    </div>

    <div class="ending-stats">
      <div class="stat-item">
        <span class="s-label">等级</span>
        <span class="s-val">{{ state.player?.level || 1 }}</span>
      </div>
      <div class="stat-item">
        <span class="s-label">银子</span>
        <span class="s-val text-gold">{{ state.player?.gold || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="s-label">武学</span>
        <span class="s-val">{{ state.player?.martial_arts?.length || 0 }} 门</span>
      </div>
      <div class="stat-item">
        <span class="s-label">结局</span>
        <span class="s-val" :class="isDeath ? 'text-red' : 'text-gold'">{{ isDeath ? '身亡' : '寿终' }}</span>
      </div>
    </div>

    <div class="ending-final">{{ finalText }}</div>

    <button class="btn btn-red btn-lg" @click="restart">重入江湖</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'

const router = useRouter()
const game = useGame()
const state = game.state

const isDeath = computed(() => state.player?.current_hp <= 0)
const level = computed(() => state.player?.level || 1)

const endingText = computed(() => {
  if (level.value >= 30) return '你已名震天下，武林至尊实至名归。'
  if (level.value >= 20) return '一方霸主，江湖上无人不知你的名号。'
  if (level.value >= 10) return '小有名气的一方侠客，江湖中留有你的传说。'
  if (level.value >= 5) return '初出茅庐的江湖新秀，未来可期。'
  return '匆匆过客，未在江湖留下太多痕迹。'
})

const finalText = computed(() => {
  if (level.value >= 30) return '后人评曰：「此人武功盖世，天下无敌，其名永载武林青史。」'
  if (level.value >= 20) return '后人评曰：「一方霸主，威震江湖，至今仍有人怀念。」'
  if (level.value >= 10) return '后人评曰：「侠之大者，为国为民，虽死犹荣。」'
  return '江湖依旧在，故人已无踪。'
})

function restart () {
  localStorage.removeItem('chibai_save_v1')
  game.newGame()
  router.push('/fate')
}
</script>

<style scoped>
.ending-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background: radial-gradient(ellipse at 50% 40%, #1a0505 0%, #0D0D0D 70%);
  min-height: 100vh;
  gap: 24px;
}

.ending-title {
  font-size: 42px;
  font-weight: 900;
  color: var(--red);
  letter-spacing: 0.3em;
}

.ending-days {
  text-align: center;
}

.days-label { font-size: 14px; color: var(--gray); margin-bottom: 8px; }
.days-val { font-size: 48px; font-weight: 900; color: var(--red); }

.ending-summary {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 20px;
  max-width: 400px;
  text-align: center;
}

.summary-title {
  font-size: 13px;
  color: var(--gray);
  margin-bottom: 8px;
  letter-spacing: 0.1em;
}

.summary-text {
  font-size: 16px;
  color: var(--white);
  line-height: 1.6;
}

.ending-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
}

.s-label { font-size: 12px; color: var(--gray); }
.s-val { font-size: 18px; font-weight: 700; color: var(--white); }

.ending-final {
  font-size: 14px;
  color: var(--gray);
  text-align: center;
  max-width: 360px;
  line-height: 1.6;
  font-style: italic;
}
</style>

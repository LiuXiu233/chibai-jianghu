<template>
  <div class="pharmacy-view">
    <div class="view-header">
      <button class="back-btn" @click="back">← 返回</button>
      <span class="view-title">💊 药铺</span>
    </div>

    <div class="pharma-content">
      <div class="pharma-gold">💰 你有 <span class="text-gold">{{ state.player?.gold }}</span> 两银子</div>

      <div class="section-title">在售药品</div>
      <div class="drug-list">
        <div v-for="drug in drugs" :key="drug.id" class="drug-card">
          <div class="drug-row">
            <span :class="['rank-tag','rank-'+drug.rank]">{{ rankLabel[drug.rank] }}</span>
            <span class="drug-name">{{ drug.name }}</span>
            <span class="drug-cost text-gold">{{ drug.cost }}两</span>
          </div>
          <div class="drug-desc text-gray">{{ drug.desc }}</div>
          <div class="drug-effect text-red">效果：{{ drug.effect.hp ? '+' + drug.effect.hp + ' 生命' : '' }}{{ drug.effect.qi ? '+' + drug.effect.qi + ' 内力' : '' }}{{ drug.effect.stamina ? '+' + drug.effect.stamina + ' 体力' : '' }}</div>
          <button
            class="btn btn-red btn-sm"
            @click="buy(drug)"
            :disabled="state.player?.gold < drug.cost"
          >
            {{ state.player?.gold >= drug.cost ? '购买' : '银两不足' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { ITEMS } from '../data/items.js'

const router = useRouter()
const game = useGame()
const state = game.state

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const drugs = computed(() => ITEMS.filter(i => i.type === 'consumable').slice(0, 6))

function buy (drug) {
  game.buyItem(drug.id)
}
function back () { state.phase = 'main'; router.push('/game/explore') }
</script>

<style scoped>
.pharmacy-view {
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

.pharma-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pharma-gold { font-size: 14px; color: var(--gray); }
.section-title { font-size: 12px; color: var(--gray); letter-spacing: 0.1em; }

.drug-list { display: flex; flex-direction: column; gap: 8px; }

.drug-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drug-row { display: flex; align-items: center; gap: 6px; }
.drug-name { flex: 1; font-size: 14px; color: #1A1A1A; font-weight: 600; }
.drug-cost { font-size: 13px; }
.drug-desc { font-size: 12px; }
.drug-effect { font-size: 12px; }
</style>

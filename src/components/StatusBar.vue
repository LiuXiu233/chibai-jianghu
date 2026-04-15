<template>
  <div class="status-bar">
    <!-- 三条状态条 -->
    <div class="bars-row">
      <div class="stat-bar">
        <span class="stat-label text-red">命</span>
        <div class="bar-track">
          <div class="bar-fill bar-hp" :style="{ width: hpPct + '%' }"></div>
        </div>
        <span class="stat-val">{{ Math.floor(state.player?.current_hp || 0) }}</span>
      </div>
      <div class="stat-bar">
        <span class="stat-label text-gray">气</span>
        <div class="bar-track">
          <div class="bar-fill bar-qi" :style="{ width: qiPct + '%' }"></div>
        </div>
        <span class="stat-val">{{ Math.floor(state.player?.current_qi || 0) }}</span>
      </div>
      <div class="stat-bar">
        <span class="stat-label text-gray">体</span>
        <div class="bar-track">
          <div class="bar-fill bar-stamina" :style="{ width: staminaPct + '%' }"></div>
        </div>
        <span class="stat-val">{{ Math.floor(state.player?.current_stamina || 0) }}</span>
      </div>
    </div>
    <!-- 信息行 -->
    <div class="info-row">
      <span class="info-item">第 <span class="text-red">{{ game.computed.currentDay.value }}</span> 天</span>
      <span class="info-item text-red">{{ game.computed.currentShichen.value }}</span>
      <span class="info-item">第{{ game.computed.currentKe.value }}刻</span>
      <span class="info-item">💰 <span class="text-gold">{{ state.player?.gold }}</span></span>
      <span class="info-item">Lv.{{ state.player?.level }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGame } from '../composables/useGame'

const game = useGame()
const state = game.state

const hpPct = computed(() => state.player ? Math.max(0, state.player.current_hp / game.computed.maxHP.value * 100) : 0)
const qiPct = computed(() => state.player ? Math.max(0, state.player.current_qi / game.computed.maxQi.value * 100) : 0)
const staminaPct = computed(() => state.player ? Math.max(0, state.player.current_stamina / game.computed.maxStamina.value * 100) : 0)
</script>

<style scoped>
.status-bar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 6px 10px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bars-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  width: 14px;
  flex-shrink: 0;
  text-align: center;
}

.bar-track {
  flex: 1;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.stat-val {
  font-size: 10px;
  color: var(--gray);
  width: 40px;
  text-align: right;
  flex-shrink: 0;
}

.info-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-item {
  font-size: 11px;
  color: var(--gray);
}
</style>

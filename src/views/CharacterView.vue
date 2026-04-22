<template>
  <div class="character-view">
    <div class="char-header">
      <div class="char-portrait">
        <div class="portrait-icon">👤</div>
      </div>
      <div class="char-info">
        <div class="char-name text-red">{{ state.player?.name }}</div>
        <div class="char-title">{{ title }}</div>
        <div class="char-meta text-gray">Lv.{{ state.player?.level }} · {{ regionName }}</div>
      </div>
    </div>

    <!-- 派生状态 -->
    <div class="section">
      <div class="section-title">状态</div>
      <div class="vstat-grid">
        <div class="vstat-item">
          <div class="vs-label text-red">生命</div>
          <div class="vs-bar"><div class="bar-fill bar-hp" :style="{ width: hpPct + '%' }"></div></div>
          <div class="vs-val">{{ Math.floor(state.player?.current_hp) }} / {{ game.computed.maxHP.value }}</div>
        </div>
        <div class="vstat-item">
          <div class="vs-label">内力</div>
          <div class="vs-bar"><div class="bar-fill bar-qi" :style="{ width: qiPct + '%' }"></div></div>
          <div class="vs-val">{{ Math.floor(state.player?.current_qi) }} / {{ game.computed.maxQi.value }}</div>
        </div>
        <div class="vstat-item">
          <div class="vs-label">体力</div>
          <div class="vs-bar"><div class="bar-fill bar-stamina" :style="{ width: staminaPct + '%' }"></div></div>
          <div class="vs-val">{{ Math.floor(state.player?.current_stamina) }} / {{ game.computed.maxStamina.value }}</div>
        </div>
      </div>
    </div>

    <!-- 经验 -->
    <div class="section">
      <div class="section-title">经验</div>
      <div class="exp-row">
        <span class="exp-val text-gold">{{ state.player?.exp }}</span>
        <div class="exp-bar-track">
          <div class="bar-fill bar-exp" :style="{ width: expPct + '%' }"></div>
        </div>
        <span class="exp-next text-gray">下一级还需 {{ state.player?.exp_needed - state.player?.exp }}</span>
      </div>
    </div>

    <!-- 基础属性 -->
    <div class="section">
      <div class="section-title">基础属性</div>
      <div class="attrs-grid">
        <div v-for="(val, key) in displayAttrs" :key="key" class="attr-item">
          <div class="attr-name">{{ key }}</div>
          <div class="attr-val">{{ val }}</div>
          <div class="attr-bar-track">
            <div class="bar-fill" :style="{ width: Math.min(100, val) + '%', background: attrColors[key] }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 装备加成 -->
    <div class="section">
      <div class="section-title">装备加成</div>
      <div v-if="equipBonuses.length" class="bonus-list">
        <div v-for="b in equipBonuses" :key="b.label" class="bonus-item">
          <span class="bonus-eq text-gray">{{ b.eq }}</span>
          <span class="bonus-label">{{ b.label }}</span>
          <span class="bonus-val text-gold">+{{ b.val }}</span>
        </div>
      </div>
      <div v-else class="text-gray empty">暂无装备加成</div>
    </div>

    <!-- 心法 -->
    <div class="section">
      <div class="section-title">已修心法</div>
      <div v-if="knownXinfas.length" class="xinfa-list">
        <div v-for="xf in knownXinfas" :key="xf.id" class="xinfa-item">
          <span :class="['rank-tag','rank-'+xf.rank]">{{ rankLabel[xf.rank] }}</span>
          <span class="xf-name">{{ xf.name }}</span>
          <span class="xf-desc text-gray">{{ xf.effects?.[0]?.desc }}</span>
        </div>
      </div>
      <div v-else class="text-gray empty">尚未修习心法</div>
    </div>

    <!-- 统计 -->
    <div class="section">
      <div class="section-title">江湖统计</div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-val text-gold">{{ state.player?.gold }}</div>
          <div class="stat-label">银两</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">{{ state.player?.martial_arts?.length || 0 }}</div>
          <div class="stat-label">武学数</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">{{ totalKills }}</div>
          <div class="stat-label">击杀数</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">{{ game.computed.currentDay.value }}</div>
          <div class="stat-label">当前天数</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">{{ carryInfo }}</div>
          <div class="stat-label">负重</div>
        </div>
        <div class="stat-item">
          <div class="stat-val text-red">{{ game.computed.currentShichen.value }}</div>
          <div class="stat-label">时辰</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGame } from '../composables/useGame'
import { getItemById } from '../data/items.js'
import { XINFA } from '../data/martialArts.js'
import { REGIONS } from '../data/regions.js'

const game = useGame()
const state = game.state

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const attrColors = {
  力量: 'var(--red)', 气海: '#800080', 身法: 'var(--gold)',
  耐力: '#3B82F6', 根骨: '#3B82F6', 悟性: 'var(--gold)', 幸运: 'var(--di-color)',
}

const hpPct = computed(() => state.player ? Math.max(0, state.player.current_hp / game.computed.maxHP.value * 100) : 0)
const qiPct = computed(() => state.player ? Math.max(0, state.player.current_qi / game.computed.maxQi.value * 100) : 0)
const staminaPct = computed(() => state.player ? Math.max(0, state.player.current_stamina / game.computed.maxStamina.value * 100) : 0)
const expPct = computed(() => state.player ? Math.max(0, state.player.exp / state.player.exp_needed * 100) : 0)

const title = computed(() => {
  const l = state.player?.level || 1
  if (l >= 50) return '武林神话'
  if (l >= 40) return '一代宗师'
  if (l >= 30) return '江湖名宿'
  if (l >= 20) return '一方豪杰'
  if (l >= 10) return '小有名气'
  return '江湖新秀'
})

const regionName = computed(() => REGIONS.find(r => r.id === state.player?.regionId)?.name || '未知')

const displayAttrs = computed(() => {
  const attrs = state.player?.attrs || {}
  // 加上装备加成
  const bonuses = equipBonusMap.value
  return {
    力量: (attrs.力量 || 0) + (bonuses.力量 || 0),
    气海: (attrs.气海 || 0) + (bonuses.气海 || 0),
    身法: (attrs.身法 || 0) + (bonuses.身法 || 0),
    耐力: (attrs.耐力 || 0) + (bonuses.耐力 || 0),
    根骨: (attrs.根骨 || 0) + (bonuses.根骨 || 0),
    悟性: (attrs.悟性 || 0) + (bonuses.悟性 || 0),
    幸运: (attrs.幸运 || 0) + (bonuses.幸运 || 0),
  }
})

const equipBonusMap = computed(() => {
  const map = {}
  const eq = state.player?.equipment || {}
  for (const [slot, itemId] of Object.entries(eq)) {
    if (!itemId) continue
    const item = getItemById(itemId)
    if (!item?.attrs) continue
    for (const [k, v] of Object.entries(item.attrs)) {
      const attrKey = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性' }[k]
      if (attrKey) map[attrKey] = (map[attrKey] || 0) + v
    }
  }
  return map
})

const equipBonuses = computed(() => {
  const eq = state.player?.equipment || {}
  const result = []
  const slotNames = { weapon: '武器', armor: '防具', accessory: '饰品' }
  const attrNames = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性', defense: '防御' }
  for (const [slot, itemId] of Object.entries(eq)) {
    if (!itemId) continue
    const item = getItemById(itemId)
    if (!item) continue
    if (item.attrs) {
      for (const [k, v] of Object.entries(item.attrs)) {
        const label = attrNames[k] || k
        result.push({ eq: slotNames[slot] + '·' + item.name, label, val: v })
      }
    }
  }
  return result
})

const knownXinfas = computed(() => game.getKnownXinfas())

const totalKills = computed(() => Object.values(state.player?.enemy_kills || {}).reduce((a, b) => a + b, 0))

const carryInfo = computed(() => {
  const w = game.computed.carryWeight.value
  const m = game.computed.maxCarry.value
  return `${w}/${m}`
})
</script>

<style scoped>
.character-view {
  height: 100%;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.char-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.portrait-icon { font-size: 48px; line-height: 1; }
.char-name { font-size: 22px; font-weight: 900; }
.char-title { font-size: 13px; color: var(--gold); }
.char-meta { font-size: 12px; margin-top: 2px; }

.section { display: flex; flex-direction: column; gap: 6px; }
.section-title { font-size: 11px; color: var(--gray); letter-spacing: 0.1em; }

.vstat-grid { display: flex; flex-direction: column; gap: 4px; }
.vstat-item { display: flex; align-items: center; gap: 8px; }
.vs-label { font-size: 11px; width: 24px; flex-shrink: 0; }
.vs-bar { flex: 1; height: 4px; background: #222; border-radius: 2px; overflow: hidden; }
.vs-val { font-size: 10px; color: var(--gray); width: 80px; text-align: right; flex-shrink: 0; }

.exp-row { display: flex; align-items: center; gap: 8px; }
.exp-val { font-size: 16px; font-weight: 700; }
.exp-bar-track { flex: 1; height: 4px; background: #222; border-radius: 2px; overflow: hidden; }
.exp-next { font-size: 11px; }

.attrs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.attr-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.attr-name { font-size: 11px; color: var(--gray); }
.attr-val { font-size: 18px; font-weight: 700; color: #1A1A1A; }
.attr-bar-track { height: 3px; background: #222; border-radius: 2px; overflow: hidden; }

.bonus-list { display: flex; flex-direction: column; gap: 3px; }
.bonus-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 0;
}
.bonus-eq { width: 80px; color: var(--gray); flex-shrink: 0; }
.bonus-label { flex: 1; }
.bonus-val { color: var(--gold); }

.xinfa-list { display: flex; flex-direction: column; gap: 4px; }
.xinfa-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg-card);
  border-radius: 3px;
}
.xf-name { flex: 1; font-size: 13px; color: #1A1A1A; }
.xf-desc { font-size: 11px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.stat-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.stat-val { font-size: 15px; font-weight: 700; color: #1A1A1A; }
.stat-label { font-size: 10px; color: var(--gray); }

.empty { font-size: 12px; text-align: center; padding: 8px; }
</style>

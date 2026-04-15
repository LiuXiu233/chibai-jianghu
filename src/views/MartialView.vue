<template>
  <div class="martial-view">
    <!-- 标签 -->
    <div class="tab-bar">
      <button :class="['tab', tab === 'martial' ? 'tab-active' : '']" @click="tab = 'martial'">武学</button>
      <button :class="['tab', tab === 'xinfa' ? 'tab-active' : '']" @click="tab = 'xinfa'">心法</button>
    </div>

    <!-- 武学列表 -->
    <div class="list-area" v-if="tab === 'martial'">
      <div v-for="m in martials" :key="m.martial_id" class="martial-row" @click="openMartial(m)">
        <span :class="['rank-tag', 'rank-' + m.data.rank]">{{ rankLabel[m.data.rank] }}</span>
        <span class="m-name">{{ m.data.name }}</span>
        <span class="m-type text-gray">{{ typeLabel[m.data.type] }}</span>
        <div class="mastery-bar">
          <div class="bar-fill" style="background:var(--gold);height:100%" :style="{ width: m.mastery + '%' }"></div>
        </div>
        <span class="m-mastery text-gold">{{ m.mastery }}</span>
        <span v-if="getCooldown(m.martial_id) > 0" class="cooldown-tag">冷却{{ getCooldown(m.martial_id) }}T</span>
      </div>
    </div>

    <!-- 心法界面 -->
    <div class="xinfa-area" v-if="tab === 'xinfa'">
      <!-- 槽位 -->
      <div class="slots-section">
        <div class="section-title">心法槽位</div>
        <div class="slots-grid">
          <div :class="['slot-card', 'slot-main', equippedMain ? 'slot-equipped' : 'slot-empty']" @click="openSlotXinfas('main')">
            <div class="slot-label">主心法</div>
            <div class="slot-val" v-if="equippedMain">
              <span :class="['rank-tag','rank-'+equippedMain.rank]">{{ rankLabel[equippedMain.rank] }}</span>
              <span class="slot-name">{{ equippedMain.name }}</span>
            </div>
            <div class="slot-empty-tip" v-else>空</div>
            <div class="slot-mult" v-if="equippedMain">100%</div>
          </div>
          <div :class="['slot-card', equippedSub1 ? 'slot-equipped' : 'slot-empty']" @click="openSlotXinfas('sub1')">
            <div class="slot-label">辅心法1</div>
            <div class="slot-val" v-if="equippedSub1">
              <span :class="['rank-tag','rank-'+equippedSub1.rank]">{{ rankLabel[equippedSub1.rank] }}</span>
              <span class="slot-name">{{ equippedSub1.name }}</span>
            </div>
            <div class="slot-empty-tip" v-else>空</div>
            <div class="slot-mult" v-if="equippedSub1">40%</div>
          </div>
          <div :class="['slot-card', equippedSub2 ? 'slot-equipped' : 'slot-empty']" @click="openSlotXinfas('sub2')">
            <div class="slot-label">辅心法2</div>
            <div class="slot-val" v-if="equippedSub2">
              <span :class="['rank-tag','rank-'+equippedSub2.rank]">{{ rankLabel[equippedSub2.rank] }}</span>
              <span class="slot-name">{{ equippedSub2.name }}</span>
            </div>
            <div class="slot-empty-tip" v-else>空</div>
            <div class="slot-mult" v-if="equippedSub2">40%</div>
          </div>
        </div>
        <div class="slots-tip text-gray">主心法100%效果 · 辅心法40%效果 · 切换消耗1时辰调息</div>
      </div>

      <!-- 共鸣 -->
      <div class="resonance-section" v-if="currentResonance">
        <div class="section-title">共鸣效果</div>
        <div class="resonance-card">
          <div class="res-name text-gold">{{ currentResonance.name }}</div>
          <div class="res-desc">{{ currentResonance.desc }}</div>
          <div class="res-elements">
            <span v-for="el in resonanceElements" :key="el" class="el-tag">{{ elLabel[el] }}</span>
          </div>
        </div>
      </div>
      <div class="resonance-section" v-else>
        <div class="section-title">共鸣效果</div>
        <div class="resonance-empty text-gray">装备相同元素属性的心法可触发共鸣</div>
        <div class="res-pair-hints">
          <div v-for="pair in RESONANCE_PAIRS" :key="pair.name" class="res-pair-item">
            <span class="el-tag">{{ elLabel[pair.elements[0]] }}</span>
            <span class="el-tag">{{ elLabel[pair.elements[1]] }}</span>
            <span class="text-gold">{{ pair.name }}</span>
          </div>
        </div>
      </div>

      <!-- 已学心法列表 -->
      <div class="known-section">
        <div class="section-title">已修心法</div>
        <div class="xinfa-list">
          <div v-for="xf in knownXinfas" :key="xf.id" class="xinfa-row" @click="openXinfaDetail(xf)">
            <span :class="['rank-tag','rank-'+xf.rank]">{{ rankLabel[xf.rank] }}</span>
            <span class="xf-name">{{ xf.name }}</span>
            <span class="xf-el text-gray">{{ elLabel[xf.element] }}</span>
            <span class="xf-cat text-gray">{{ catLabel[xf.category] }}</span>
            <span class="xf-eq" v-if="isEquipped(xf.id)">已装备</span>
            <button v-else class="btn-sm" @click.stop="equipToSlot(xf)">装备</button>
          </div>
          <div v-if="!knownXinfas.length" class="empty-tip">尚未修习任何心法</div>
        </div>
      </div>

      <!-- 可学心法（按等级分组） -->
      <div class="learn-section">
        <div class="section-title">可修习心法</div>
        <div v-for="rank in ['tian','di','xuan','huang','wu']" :key="rank">
          <div v-if="learnableByRank[rank]?.length" class="rank-group">
            <div class="rank-label">
              <span :class="['rank-tag','rank-'+rank]">{{ rankLabel[rank] }}</span>
            </div>
            <div v-for="xf in learnableByRank[rank]" :key="xf.id" class="learn-row" @click="openXinfaDetail(xf)">
              <span class="xf-name">{{ xf.name }}</span>
              <span class="xf-el text-gray">{{ elLabel[xf.element] }}</span>
              <button class="btn-sm btn-gold" @click.stop="tryLearn(xf)">修习</button>
            </div>
          </div>
        </div>
        <div v-if="!hasAnyLearnable" class="empty-tip">悟性不足，无法修习更高级心法</div>
      </div>
    </div>

    <!-- 武学详情弹窗 -->
    <div class="modal" v-if="modalType === 'martial' && selectedMartial" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-title">
          <span :class="['rank-tag', 'rank-' + selectedMartial.data.rank]">{{ rankLabel[selectedMartial.data.rank] }}</span>
          {{ selectedMartial.data.name }}
        </div>
        <div class="modal-type">{{ typeLabel[selectedMartial.data.type] }}</div>
        <div class="modal-desc">{{ selectedMartial.data.desc }}</div>
        <div class="modal-attrs" v-if="selectedMartial.data.attrs">
          <div v-for="(v, k) in selectedMartial.data.attrs" :key="k" class="attr-line">
            {{ attrNames[k] || k }}: <span class="text-gold">+{{ v }}</span>
          </div>
        </div>
        <div class="modal-effects" v-if="selectedMartial.data.effects?.length">
          <div class="effects-title">效果</div>
          <div v-for="e in selectedMartial.data.effects" :key="e.type" class="effect-line">
            {{ e.desc || e.type }}
          </div>
        </div>
        <div class="modal-cooldown" v-if="getCooldown(selectedMartial.martial_id) > 0">
          ⚠️ 冷却中：还需 {{ getCooldown(selectedMartial.martial_id) }} 回合
        </div>
        <div class="modal-mastery">
          熟练度: <span class="text-gold">{{ selectedMartial.mastery }}</span>/100
        </div>
        <button class="btn" @click="closeModal">关闭</button>
      </div>
    </div>

    <!-- 心法详情弹窗 -->
    <div class="modal" v-if="modalType === 'xinfa' && selectedXinfa" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-title">
          <span :class="['rank-tag', 'rank-' + selectedXinfa.rank]">{{ rankLabel[selectedXinfa.rank] }}</span>
          {{ selectedXinfa.name }}
        </div>
        <div class="modal-meta">
          <span class="meta-tag">{{ catLabel[selectedXinfa.category] }}</span>
          <span class="meta-tag">{{ elLabel[selectedXinfa.element] }}</span>
        </div>
        <div class="modal-desc">{{ selectedXinfa.desc }}</div>
        <div class="modal-attrs" v-if="selectedXinfa.attrs">
          <div v-for="(v, k) in selectedXinfa.attrs" :key="k" class="attr-line">
            {{ attrNames[k] || k }}: <span class="text-gold">+{{ v }}</span>
            <span class="attr-note" v-if="['hp_regen','qi_regen'].includes(k)">每刻</span>
          </div>
        </div>
        <div class="combat-effects" v-if="Object.keys(selectedXinfa.combat_effects || {}).length">
          <div class="effects-title">战斗效果</div>
          <div v-for="(v, k) in selectedXinfa.combat_effects" :key="k" class="effect-line">
            {{ combatEffectLabel[k] }}: {{ combatEffectDesc[k]?.(v) || v }}
          </div>
        </div>
        <div class="modal-req">
          悟性要求：<span :class="compReqMet ? 'text-green' : 'text-red'">{{ selectedXinfa.learn_req?.comprehension || 0 }}</span>
          （当前 {{ state.player?.attrs?.悟性 }}）
        </div>
        <div class="modal-actions">
          <button v-if="isKnown(selectedXinfa.id)" class="btn btn-disabled" disabled>已修习</button>
          <button v-else class="btn btn-red" @click="tryLearn(selectedXinfa)">修习</button>
          <button v-if="isKnown(selectedXinfa.id) && !isEquipped(selectedXinfa.id)" class="btn btn-gold" @click="equipToSlot(selectedXinfa)">装备</button>
          <button class="btn" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- 槽位选择弹窗 -->
    <div class="modal" v-if="modalType === 'slot'" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-title">选择心法</div>
        <div class="slot-xinfa-list">
          <div v-for="xf in knownXinfas" :key="xf.id"
            :class="['slot-opt', currentSlotXinfa === xf.id ? 'slot-opt-active' : '']"
            @click="switchToSlot(xf.id)">
            <span :class="['rank-tag','rank-'+xf.rank]">{{ rankLabel[xf.rank] }}</span>
            <span class="xf-name">{{ xf.name }}</span>
            <span class="xf-el text-gray">{{ elLabel[xf.element] }}</span>
          </div>
          <div v-if="!knownXinfas.length" class="text-gray empty-tip">尚无已修心法</div>
        </div>
        <button class="btn" @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGame } from '../composables/useGame'
import { XINFA, RESONANCE_PAIRS } from '../data/martialArts.js'

const game = useGame()
const state = game.state
const tab = ref('martial')
const selectedMartial = ref(null)
const selectedXinfa = ref(null)
const modalType = ref(null) // 'martial' | 'xinfa' | 'slot'
const slotTarget = ref(null) // 'main' | 'sub1' | 'sub2'

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const typeLabel = { external: '外功', internal: '内功', unarmed: '空手', undefined: '心法' }
const catLabel = { foundation: '根基', sustain: '续航', combat: '变种', survival: '辅助', style: '流派' }
const elLabel = { yang: '阳', yin: '阴', neutral: '中立', light: '轻', heavy: '重' }
const attrNames = {
  power: '力量', qi: '气海', agility: '身法', constitution: '根骨',
  luck: '幸运', comprehension: '悟性', hp: '生命上限', hp_regen: '生命回复/刻',
  qi_regen: '内力回复/刻', stamina_max: '体力上限', defense: '防御', dodge: '闪避率',
  power_scale: '力量加成', crit_bonus: '暴击率', crit_dmg_bonus: '暴击伤害',
  lifesteal: '吸血'
}
const combatEffectLabel = {
  crit_mult_bonus: '暴击伤害加成', lethal_resist: '死亡复活', weaken_def: '破防效果',
  qi_scaling_bonus: '内功加成', qi_regen: '内力回复', lifesteal: '吸血',
  damage_reduction: '伤害减免', dodge_bonus: '闪避加成', damage_bonus: '伤害加成',
  sword_damage_bonus: '剑类加成', spear_damage_bonus: '枪类加成',
  agility_start_bonus: '战斗初身法', defense_to_attack: '防转攻',
  hp_regen: '生命回复', stamina_max: '体力上限', external_damage_bonus: '外功加成',
}
const combatEffectDesc = {
  crit_mult_bonus: v => `+${(v*100).toFixed(0)}%`,
  lethal_resist: v => v ? '死亡时复活（30%HP）' : '无',
  weaken_def: v => `破防-${(v*100).toFixed(0)}%`,
  qi_scaling_bonus: v => `+${(v*100).toFixed(0)}%`,
  qi_regen: v => `+${v}/刻`,
  lifesteal: v => `伤害的${(v*100).toFixed(0)}%转化为生命`,
  damage_reduction: v => `-${(v*100).toFixed(0)}%`,
  dodge_bonus: v => `+${v}%`,
  damage_bonus: v => `+${(v*100).toFixed(0)}%`,
  sword_damage_bonus: v => `+${(v*100).toFixed(0)}%`,
  spear_damage_bonus: v => `+${(v*100).toFixed(0)}%`,
  agility_start_bonus: v => `战斗初+${(v*100).toFixed(0)}%`,
  defense_to_attack: v => `1防=${(v*100).toFixed(0)}%攻`,
  hp_regen: v => `${v}%最大HP/刻`,
  stamina_max: v => `+${v}`,
  external_damage_bonus: v => `+${(v*100).toFixed(0)}%`,
}

const martials = computed(() => game.getKnownMartials())

// 心法相关 computed
const slots = computed(() => state.player?.xinfa_slots || { main: null, sub1: null, sub2: null })
const equippedMain = computed(() => {
  const id = slots.value.main
  return id ? XINFA.find(x => x.id === id) : null
})
const equippedSub1 = computed(() => {
  const id = slots.value.sub1
  return id ? XINFA.find(x => x.id === id) : null
})
const equippedSub2 = computed(() => {
  const id = slots.value.sub2
  return id ? XINFA.find(x => x.id === id) : null
})
const knownXinfas = computed(() => game.getKnownXinfas())
const currentResonance = computed(() => game.getResonance())
const resonanceElements = computed(() => {
  if (!currentResonance.value) return []
  return currentResonance.value.elements
})

const learnableByRank = computed(() => {
  const result = {}
  const knownIds = new Set(knownXinfas.value.map(x => x.id))
  const playerComp = state.player?.attrs?.悟性 || 0
  for (const xf of XINFA) {
    if (knownIds.has(xf.id)) continue
    const req = xf.learn_req?.comprehension ?? 0
    if (playerComp < req) continue
    if (!result[xf.rank]) result[xf.rank] = []
    result[xf.rank].push(xf)
  }
  return result
})
const hasAnyLearnable = computed(() => Object.values(learnableByRank.value).some(v => v?.length))

function isEquipped (xinfaId) {
  const s = slots.value
  return s.main === xinfaId || s.sub1 === xinfaId || s.sub2 === xinfaId
}
function isKnown (xinfaId) {
  return knownXinfas.value.some(x => x.id === xinfaId)
}
function getCooldown (martialId) {
  return state.player?.martialCooldowns?.[martialId] || 0
}
function compReqMet (xf) {
  return (state.player?.attrs?.悟性 || 0) >= (xf.learn_req?.comprehension || 0)
}

// Modal actions
function openMartial (m) {
  selectedMartial.value = m
  selectedXinfa.value = null
  modalType.value = 'martial'
}
function openXinfaDetail (xf) {
  selectedXinfa.value = xf
  selectedMartial.value = null
  modalType.value = 'xinfa'
}
function openSlotXinfas (slot) {
  slotTarget.value = slot
  modalType.value = 'slot'
}
function closeModal () {
  modalType.value = null
  selectedMartial.value = null
  selectedXinfa.value = null
}

const currentSlotXinfa = computed(() => {
  return slotTarget.value ? slots.value[slotTarget.value] : null
})

function tryLearn (xf) {
  const result = game.learnXinfa(xf.id)
  if (result.ok) {
    closeModal()
  } else if (result.reason === 'already_known') {
    // already handled
  } else if (result.reason === 'comprehension') {
    // show error in modal
  }
}

function equipToSlot (xf) {
  if (isEquipped(xf.id)) return
  // 自动找空槽
  const s = slots.value
  if (!s.main) game.switchXinfa('main', xf.id)
  else if (!s.sub1) game.switchXinfa('sub1', xf.id)
  else if (!s.sub2) game.switchXinfa('sub2', xf.id)
  closeModal()
}

function switchToSlot (xinfaId) {
  if (!slotTarget.value) return
  game.switchXinfa(slotTarget.value, xinfaId)
  closeModal()
}
</script>

<style scoped>
.martial-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
  gap: 10px;
}

.tab-bar {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.tab {
  padding: 5px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--gray);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.tab-active {
  border-color: var(--red);
  color: #1A1A1A;
}

.list-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 心法区域 */
.xinfa-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 11px;
  color: var(--gray);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

/* 槽位 */
.slots-section { display: flex; flex-direction: column; }
.slots-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}
.slot-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 72px;
}
.slot-main {
  border-color: var(--red-dark);
  background: rgba(194,40,40,0.05);
}
.slot-equipped { border-color: var(--gold); background: rgba(255,200,0,0.08); }
.slot-empty { opacity: 0.7; }
.slot-card:hover { border-color: var(--red); }
.slot-label { font-size: 10px; color: var(--gray); }
.slot-val { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.slot-name { font-size: 11px; color: #1A1A1A; font-weight: 600; }
.slot-empty-tip { font-size: 12px; color: var(--gray); text-align: center; padding: 4px; }
.slot-mult { font-size: 9px; color: var(--gold); }
.slots-tip { font-size: 10px; text-align: center; }

/* 共鸣 */
.resonance-section { display: flex; flex-direction: column; }
.resonance-card {
  background: rgba(255,200,0,0.08);
  border: 1px solid var(--gold);
  border-radius: 3px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.res-name { font-size: 14px; font-weight: 700; }
.res-desc { font-size: 12px; color: #1A1A1A; }
.res-elements { display: flex; gap: 4px; flex-wrap: wrap; }
.resonance-empty { font-size: 12px; }
.res-pair-hints { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.res-pair-item { display: flex; align-items: center; gap: 3px; font-size: 11px; }

.el-tag {
  background: rgba(255,255,255,0.1);
  border: 1px solid var(--border);
  border-radius: 2px;
  padding: 1px 5px;
  font-size: 10px;
  color: var(--gray);
}

/* 心法列表 */
.known-section, .learn-section { display: flex; flex-direction: column; }
.xinfa-list { display: flex; flex-direction: column; gap: 3px; }
.xinfa-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--bg-card);
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.15s;
}
.xinfa-row:hover { background: rgba(194,40,40,0.08); }
.xf-name { flex: 1; font-size: 13px; color: #1A1A1A; }
.xf-el, .xf-cat { font-size: 11px; }
.xf-eq { font-size: 11px; color: var(--gold); }

/* 可学 */
.rank-group { margin-bottom: 6px; }
.rank-label { margin-bottom: 3px; }
.learn-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.15s;
  background: rgba(255,255,255,0.5);
}
.learn-row:hover { background: rgba(194,40,40,0.08); }

/* 武学列表 */
.martial-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-card);
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.15s;
}
.martial-row:hover { background: rgba(194,40,40,0.08); }
.m-name { flex: 1; font-size: 14px; color: #1A1A1A; }
.m-type { font-size: 12px; }
.mastery-bar { width: 60px; height: 4px; background: #222; border-radius: 2px; overflow: hidden; }
.m-mastery { font-size: 11px; width: 24px; text-align: right; }
.cooldown-tag {
  font-size: 10px; color: var(--blue);
  background: rgba(30,58,138,0.3);
  border: 1px solid var(--blue);
  padding: 1px 4px;
  border-radius: 2px;
}

.empty-tip { text-align: center; color: var(--gray); font-size: 13px; padding: 16px; }

/* 弹窗 */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 20px;
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1A1A1A;
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-meta { display: flex; gap: 6px; }
.meta-tag {
  background: var(--border);
  border-radius: 2px;
  padding: 2px 6px;
  font-size: 11px;
  color: var(--gray);
}
.modal-type { font-size: 13px; color: var(--gray); }
.modal-desc { font-size: 13px; color: #555; line-height: 1.6; }
.modal-attrs { display: flex; flex-direction: column; gap: 4px; }
.attr-line { font-size: 13px; color: #1A1A1A; display: flex; align-items: center; gap: 4px; }
.attr-note { font-size: 11px; color: var(--gray); }
.effects-title { font-size: 12px; color: var(--gray); }
.effect-line { font-size: 13px; color: var(--gold); }
.combat-effects { display: flex; flex-direction: column; gap: 4px; }
.modal-cooldown { font-size: 13px; color: var(--blue); font-weight: 600; }
.modal-mastery { font-size: 13px; color: #1A1A1A; }
.modal-req { font-size: 12px; color: var(--gray); }
.modal-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.text-green { color: #22c55e; }
.text-red { color: var(--red); }
.btn-red { background: var(--red); color: white; border: none; border-radius: 3px; padding: 8px 14px; font-size: 13px; cursor: pointer; font-family: inherit; }
.btn-red:hover { background: var(--red-dark); }
.btn-gold { background: var(--gold); color: #1A1A1A; border: none; border-radius: 3px; padding: 8px 14px; font-size: 13px; cursor: pointer; font-family: inherit; }
.btn-gold:hover { filter: brightness(0.9); }
.btn { background: var(--bg-card); border: 1px solid var(--border); color: #1A1A1A; border-radius: 3px; padding: 8px 14px; font-size: 13px; cursor: pointer; font-family: inherit; }
.btn:hover { border-color: var(--red); }
.btn-sm {
  background: transparent;
  border: 1px solid var(--red);
  color: var(--red);
  border-radius: 2px;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
}
.btn-sm:hover { background: rgba(194,40,40,0.1); }
.btn-disabled { background: var(--border); color: var(--gray); border: none; border-radius: 3px; padding: 8px 14px; font-size: 13px; cursor: not-allowed; }

/* 槽位选择弹窗列表 */
.slot-xinfa-list { display: flex; flex-direction: column; gap: 4px; max-height: 300px; overflow-y: auto; }
.slot-opt {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}
.slot-opt:hover { border-color: var(--red); background: rgba(194,40,40,0.05); }
.slot-opt-active { border-color: var(--gold); background: rgba(255,200,0,0.1); }
</style>

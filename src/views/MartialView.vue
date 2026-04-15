<template>
  <div class="martial-view">
    <!-- 标签 -->
    <div class="tab-bar">
      <button :class="['tab', tab === 'martial' ? 'tab-active' : '']" @click="tab = 'martial'">武学</button>
      <button :class="['tab', tab === 'xinfa' ? 'tab-active' : '']" @click="tab = 'xinfa'">心法</button>
    </div>

    <!-- 武学列表 -->
    <div class="list-area" v-if="tab === 'martial'">
      <div v-for="m in martials" :key="m.martial_id" class="martial-row" @click="selected = m">
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

    <!-- 心法列表 -->
    <div class="list-area" v-if="tab === 'xinfa'">
      <div v-for="xf in xinfas" :key="xf.id" class="martial-row" @click="selected = xf">
        <span :class="['rank-tag', 'rank-' + xf.rank]">{{ rankLabel[xf.rank] }}</span>
        <span class="m-name">{{ xf.name }}</span>
        <span class="m-type text-gray">心法</span>
      </div>
      <div v-if="!xinfas.length" class="empty-tip">尚未修习任何心法</div>
    </div>

    <!-- 详情弹窗 -->
    <div class="modal" v-if="selected" @click.self="selected = null">
      <div class="modal-content">
        <div class="modal-title">
          <span :class="['rank-tag', 'rank-' + selected.rank]">{{ rankLabel[selected.rank] }}</span>
          {{ selected.name }}
        </div>
        <div class="modal-type">{{ typeLabel[selected.type] || '心法' }}</div>
        <div class="modal-desc">{{ selected.desc }}</div>
        <div class="modal-attrs" v-if="selected.attrs">
          <div v-for="(v, k) in selected.attrs" :key="k" class="attr-line">
            {{ attrNames[k] || k }}: <span class="text-gold">+{{ v }}</span>
          </div>
        </div>
        <div class="modal-effects" v-if="selected.effects?.length">
          <div class="effects-title">效果</div>
          <div v-for="e in selected.effects" :key="e.type" class="effect-line">
            {{ e.desc || e.type }}
          </div>
        </div>
        <div class="modal-cooldown" v-if="selected.mastery !== undefined && getCooldown(selected.martial_id) > 0">
          ⚠️ 冷却中：还需 {{ getCooldown(selected.martial_id) }} 回合
        </div>
        <div class="modal-req" v-if="selected.rank && selected.rank !== 'wu'">
          悟性要求：<span class="text-red">{{ getReqComprehension(selected.rank) }}</span>（当前 {{ state.player?.attrs?.悟性 }}）
        </div>
        <div class="modal-mastery" v-if="selected.mastery !== undefined">
          熟练度: <span class="text-gold">{{ selected.mastery }}</span>/100
        </div>
        <button class="btn" @click="selected = null">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGame } from '../composables/useGame'
import { XINFA } from '../data/martialArts.js'

const game = useGame()
const state = game.state
const tab = ref('martial')
const selected = ref(null)

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const typeLabel = { external: '外功', internal: '内功', unarmed: '空手', undefined: '心法' }
const attrNames = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性', hp: '生命上限', hp_regen: '生命回复', qi_regen: '内力回复', defense: '防御', dodge: '闪避', power_scale: '力量加成' }

const martials = computed(() => game.getKnownMartials())
const xinfas = computed(() => state.player?.xinfas?.map(x => XINFA.find(xf => xf.id === x.id)).filter(Boolean) || [])

function getCooldown (martialId) {
  return state.player?.martialCooldowns?.[martialId] || 0
}

function getReqComprehension (rank) {
  const map = { tian: 28, di: 22, xuan: 16, huang: 10, wu: 0 }
  return map[rank] || 10
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
  color: var(--white);
}

.list-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

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

.martial-row:hover { background: var(--bg-card-hover); }

.m-name {
  flex: 1;
  font-size: 14px;
  color: var(--white);
}

.m-type { font-size: 12px; }

.mastery-bar {
  width: 60px;
  height: 4px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
}

.m-mastery { font-size: 11px; width: 24px; text-align: right; }

.cooldown-tag {
  font-size: 10px;
  color: var(--blue);
  background: rgba(30, 58, 138, 0.3);
  border: 1px solid var(--blue);
  padding: 1px 4px;
  border-radius: 2px;
}

.empty-tip {
  text-align: center;
  color: var(--gray);
  font-size: 14px;
  padding: 32px;
}

/* 弹窗 */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
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
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-type {
  font-size: 13px;
  color: var(--gray);
}

.modal-desc {
  font-size: 13px;
  color: var(--gray);
  line-height: 1.6;
}

.modal-attrs {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attr-line { font-size: 13px; color: var(--white); }

.effects-title {
  font-size: 12px;
  color: var(--gray);
  margin-top: 4px;
}

.effect-line {
  font-size: 13px;
  color: var(--gold);
}

.modal-mastery {
  font-size: 13px;
  color: var(--white);
}

.modal-cooldown {
  font-size: 13px;
  color: var(--blue);
  font-weight: 600;
}

.modal-req {
  font-size: 12px;
  color: var(--gray);
}
</style>

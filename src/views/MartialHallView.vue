<template>
  <div class="martial-hall-view">
    <!-- 顶部导航 -->
    <div class="view-header">
      <button class="back-btn" @click="back">← 返回</button>
      <span class="view-title">⚔ 武馆</span>
    </div>

    <!-- 标签 -->
    <div class="tab-bar">
      <button :class="['tab', tab === 'teach' ? 'tab-active' : '']" @click="tab = 'teach'">传授</button>
      <button :class="['tab', tab === 'practice' ? 'tab-active' : '']" @click="tab = 'practice'">修炼</button>
      <button :class="['tab', tab === 'library' ? 'tab-active' : '']" @click="tab = 'library'">藏书阁</button>
    </div>

    <!-- ===== 传授 ===== -->
    <div class="tab-content" v-if="tab === 'teach'">
      <!-- 武学卡片 -->
      <div class="martials-grid">
        <div
          v-for="m in hallMartials"
          :key="m.id"
          :class="['martial-card', isKnown(m.id) ? 'card-known' : '', selectedMartial?.id === m.id ? 'card-selected' : '']"
          @click="selectMartial(m)"
        >
          <div class="mc-header">
            <span :class="['rank-tag', 'rank-'+m.rank]">{{ rankLabel[m.rank] }}</span>
            <span class="mc-name">{{ m.name }}</span>
            <span v-if="isKnown(m.id)" class="known-badge">已学</span>
          </div>
          <div class="mc-type text-gray">{{ typeLabel[m.type] }}</div>
          <div class="mc-desc">{{ m.desc }}</div>
          <div class="mc-attrs">
            <span v-for="(v, k) in m.attrs" :key="k" class="attr-chip">
              {{ attrNames[k] || k }} +{{ v }}
            </span>
          </div>
          <div class="mc-req text-gray" v-if="m.rank !== 'wu'">
            悟性要求：<span :class="canLearn(m) ? 'text-gold' : 'text-red'">{{ getReq(m.rank) }}（你 {{ state.player?.attrs?.悟性 }}）</span>
          </div>
        </div>
        <div class="empty-card" v-if="!hallMartials.length">
          <div class="text-gray">武馆今日无武功传授……</div>
          <button class="btn btn-red" @click="doRefresh">刷新</button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-bar" v-if="hallMartials.length">
        <button class="btn" @click="doRefresh">
          🔄 刷新 <span class="refresh-cost text-gray">({{ refreshCost }}两)</span>
        </button>
        <button
          v-if="selectedMartial && !isKnown(selectedMartial.id)"
          class="btn btn-red"
          :disabled="!canLearn(selectedMartial)"
          @click="doLearn"
        >
          {{ canLearn(selectedMartial) ? '修习此招' : '悟性不足' }}
        </button>
      </div>

      <!-- 提示 -->
      <div class="hall-tip text-gray">
        武馆每24刻可免费刷新一次。点击武学卡片选中后再修习。
      </div>
    </div>

    <!-- ===== 修炼 ===== -->
    <div class="tab-content" v-if="tab === 'practice'">
      <div class="known-list">
        <div v-for="m in knownMartials" :key="m.martial_id" class="practice-row">
          <div class="pr-left">
            <span :class="['rank-tag', 'rank-'+m.data.rank]">{{ rankLabel[m.data.rank] }}</span>
            <span class="pr-name">{{ m.data.name }}</span>
          </div>
          <div class="pr-mid">
            <div class="mastery-bar-wrap">
              <div class="bar-fill bar-mastery" :style="{ width: m.mastery + '%' }"></div>
            </div>
            <span class="pr-mastery text-gold">{{ m.mastery }}/100</span>
          </div>
          <div class="pr-right">
            <span class="pr-cost text-gray">{{ practiceCost(m) }}两</span>
            <button
              class="btn btn-sm btn-red"
              :disabled="m.mastery >= 100 || !canPractice(m)"
              @click="doPractice(m.martial_id)"
            >
              修炼
            </button>
          </div>
        </div>
        <div class="empty-tip" v-if="!knownMartials.length">尚未学习任何武学</div>
      </div>
      <div class="practice-tip text-gray">
        每次修炼消耗 {{ staminaCostPer }} 体力 + 相应银两，提升熟练度。
      </div>
    </div>

    <!-- ===== 藏书阁 ===== -->
    <div class="tab-content" v-if="tab === 'library'">
      <div class="section-title">武学残卷</div>
      <div class="scroll-list">
        <div v-for="s in martialScrolls" :key="s.item_id" class="scroll-row">
          <span :class="['rank-tag', 'rank-'+s.item.rank]">{{ rankLabel[s.item.rank] }}</span>
          <div class="sr-info">
            <span class="sr-name">{{ s.item.name }}</span>
            <span class="sr-target text-gray">习得：{{ getMartialName(s.item.martial_id) }}</span>
          </div>
          <span class="sr-qty text-gray">×{{ s.quantity }}</span>
          <button
            class="btn btn-sm btn-gold"
            :disabled="isMartialKnown(s.item.martial_id)"
            @click="learnScroll(s.item)"
          >
            {{ isMartialKnown(s.item.martial_id) ? '已学' : '研习' }}
          </button>
        </div>
        <div class="empty-tip" v-if="!martialScrolls.length">背包中无武学残卷</div>
      </div>

      <!-- 探索获得的武学残卷 -->
      <div class="section-title" style="margin-top:12px">探索武学</div>
      <div class="scroll-list">
        <div v-for="s in discoveredProcMartials" :key="s.id" class="scroll-row">
          <span :class="['rank-tag', 'rank-'+s.rank]">{{ rankLabel[s.rank] }}</span>
          <div class="sr-info">
            <span class="sr-name">{{ s.name }}</span>
            <span class="sr-target text-gray">习得：{{ s.id }}</span>
          </div>
          <button
            class="btn btn-sm btn-gold"
            :disabled="isProcMartialKnown(s.id)"
            @click="learnProcScroll(s.id, 'martial')"
          >
            {{ isProcMartialKnown(s.id) ? '已学' : '研习' }}
          </button>
        </div>
        <div class="empty-tip" v-if="!discoveredProcMartials.length">探索中尚未发现武学</div>
      </div>

      <div class="section-title" style="margin-top:12px">心法残卷</div>
      <div class="scroll-list">
        <div v-for="s in xinfaScrolls" :key="s.item_id" class="scroll-row">
          <span :class="['rank-tag', 'rank-'+s.item.rank]">{{ rankLabel[s.item.rank] }}</span>
          <div class="sr-info">
            <span class="sr-name">{{ s.item.name }}</span>
            <span class="sr-target text-gray">修习：{{ getXinfaName(s.item.xinfa_id) }}</span>
          </div>
          <span class="sr-qty text-gray">×{{ s.quantity }}</span>
          <button
            class="btn btn-sm btn-gold"
            :disabled="isXinfaKnown(s.item.xinfa_id)"
            @click="learnScroll(s.item)"
          >
            {{ isXinfaKnown(s.item.xinfa_id) ? '已学' : '研习' }}
          </button>
        </div>
        <div class="empty-tip" v-if="!xinfaScrolls.length">背包中无心法残卷</div>
      </div>

      <!-- 探索获得的心法残卷 -->
      <div class="section-title" style="margin-top:12px">探索心法</div>
      <div class="scroll-list">
        <div v-for="s in discoveredProcXinfas" :key="s.id" class="scroll-row">
          <span :class="['rank-tag', 'rank-'+s.rank]">{{ rankLabel[s.rank] }}</span>
          <div class="sr-info">
            <span class="sr-name">{{ s.name }}</span>
            <span class="sr-target text-gray">修习：{{ s.id }}</span>
          </div>
          <button
            class="btn btn-sm btn-gold"
            :disabled="isProcXinfaKnown(s.id)"
            @click="learnProcScroll(s.id, 'xinfa')"
          >
            {{ isProcXinfaKnown(s.id) ? '已学' : '研习' }}
          </button>
        </div>
        <div class="empty-tip" v-if="!discoveredProcXinfas.length">探索中尚未发现心法</div>
      </div>
    </div>

    <!-- 详情弹窗（修习成功反馈） -->
    <div class="modal" v-if="learnResult" @click.self="learnResult = null">
      <div class="modal-content">
        <div class="modal-title text-gold">修习成功！</div>
        <div class="modal-desc">{{ learnResult }}</div>
        <button class="btn" @click="learnResult = null">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { MARTIAL_ARTS, XINFA } from '../data/martialArts.js'
import { getMartialScrollsFromInventory, getXinfaScrollsFromInventory, getItemById } from '../data/items.js'
import { calcPracticeCost, getMartialReq } from '../data/generator.js'

const router = useRouter()
const game = useGame()
const state = game.state

const tab = ref('teach')
const selectedMartial = ref(null)
const learnResult = ref(null)

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const typeLabel = { external: '外功', internal: '内功', unarmed: '空手' }
const attrNames = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性' }

const staminaCostPer = 5

// 武馆展示的武学
const hallMartials = computed(() => {
  const data = state.building?.data
  return (data?.martials || []).filter(Boolean)
})

// 当前刷新费用
const refreshCost = computed(() => {
  const lastRefresh = state.player?.lastMartialHallRefresh || 0
  const cooldown = state.clock - lastRefresh < 24
  return cooldown ? 50 : 0
})

// 已学会武学
const knownMartials = computed(() => game.getKnownMartials())

// 背包中的残卷
const martialScrolls = computed(() => {
  return getMartialScrollsFromInventory(state.player?.inventory || [])
})
const xinfaScrolls = computed(() => {
  return getXinfaScrollsFromInventory(state.player?.inventory || [])
})

// 探索发现的武学残卷（过程化，未研习）
const discoveredProcMartials = computed(() => {
  return (state.player?.procKnownMartials || []).map(e => ({
    id: e.id,
    name: e.name,
    rank: game.getProcMartialData(e.id)?.rank || 'huang',
    martialId: e.id,
    mastery: e.mastery,
    proc: true,
  })).filter(e => e.proc && e.name)
})

// 探索发现的心法残卷（过程化，未研习）
const discoveredProcXinfas = computed(() => {
  return (state.player?.procKnownXinfas || []).map(e => ({
    id: e.id,
    name: e.name,
    rank: 'huang',
    xinfaId: e.id,
    proc: true,
  })).filter(e => e.proc && e.name)
})

function getReq (rank) {
  return getMartialReq(rank)
}

function canLearn (m) {
  if (m.rank === 'wu') return true
  return (state.player?.attrs?.悟性 || 0) >= getReq(m.rank)
}

function isKnown (martialId) {
  return !!state.player?.martial_arts?.find(m => m.martial_id === martialId)
}

function isMartialKnown (martialId) {
  return isKnown(martialId)
}

function isXinfaKnown (xinfaId) {
  return !!game.getKnownXinfas().find(x => x.id === xinfaId)
}

function isProcMartialKnown (martialId) {
  return !!(state.player?.procKnownMartials?.find(e => e.id === martialId))
}

function isProcXinfaKnown (xinfaId) {
  return !!(state.player?.procKnownXinfas?.find(e => e.id === xinfaId))
}

function selectMartial (m) {
  selectedMartial.value = selectedMartial.value?.id === m.id ? null : m
}

function doLearn () {
  if (!selectedMartial.value) return
  const result = game.learnAtMartialHall(selectedMartial.value.id)
  if (result.ok) {
    learnResult.value = `你学会了「${selectedMartial.value.name}」！`
    selectedMartial.value = null
  } else if (result.reason === 'already_known') {
    learnResult.value = '你已经会这门武学了。'
  } else if (result.reason === 'comprehension') {
    learnResult.value = `悟性不足（需${result.required}，当前${result.current}）。`
  }
}

function doRefresh () {
  game.refreshMartialHall()
  selectedMartial.value = null
}

function practiceCost (m) {
  return calcPracticeCost(m.data?.rank || 'wu')
}

function canPractice (m) {
  const cost = calcPracticeCost(m.data?.rank || 'wu')
  return (state.player?.current_stamina || 0) >= staminaCostPer && (state.player?.gold || 0) >= cost
}

function doPractice (martialId) {
  const result = game.practiceMartial(martialId, 1)
  if (!result.ok) {
    if (result.reason === 'no_stamina') learnResult.value = `体力不足，需要${result.needed}体力。`
    else if (result.reason === 'no_gold') learnResult.value = `银两不足，需要${result.needed}两。`
    else if (result.reason === 'max_mastery') learnResult.value = '此武学熟练度已达上限。'
  }
}

function learnScroll (item) {
  const result = game.useItem(item.id)
  if (result.ok) {
    const name = item.type === 'martial_scroll'
      ? getMartialName(item.martial_id)
      : getXinfaName(item.xinfa_id)
    learnResult.value = `你研读了【${item.name}】，习得了「${name}」！`
  } else if (result.reason === 'already_known') {
    learnResult.value = '你已掌握此武学/心法。'
  } else if (result.reason === 'comprehension') {
    learnResult.value = `悟性不足（需${result.required}，当前${result.current}）。`
  }
}

function learnProcScroll (procId, type) {
  if (type === 'martial') {
    const procData = game.getProcMartialData(procId)
    const result = game.learnProcMartial(procId, procId, procData)
    if (result.ok) {
      learnResult.value = `你研读了【${procId}】，习得了该武学！`
    } else if (result.reason === 'already_known') {
      learnResult.value = '你已掌握此武学。'
    } else if (result.reason === 'comprehension') {
      learnResult.value = `悟性不足（需${result.required}，当前${result.current}）。`
    }
  } else {
    const result = game.learnProcXinfa(procId, procId, null)
    if (result.ok) {
      learnResult.value = `你研读了【${procId}】，修习了该心法！`
    } else if (result.reason === 'already_known') {
      learnResult.value = '你已掌握此心法。'
    }
  }
}

function getMartialName (martialId) {
  return MARTIAL_ARTS.find(m => m.id === martialId)?.name || martialId
}

function getXinfaName (xinfaId) {
  return XINFA.find(x => x.id === xinfaId)?.name || xinfaId
}

function back () {
  state.phase = 'main'
  router.push('/game/explore')
}
</script>

<style scoped>
.martial-hall-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}

.view-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-card);
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

.tab-bar {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

.tab {
  padding: 5px 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 2px;
  color: var(--gray);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.tab-active {
  border-color: var(--red);
  color: #1A1A1A;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 传授 */
.martials-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.martial-card {
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.martial-card:hover { border-color: var(--red); }
.card-known { opacity: 0.6; }
.card-selected { border-color: var(--red); background: rgba(194,40,40,0.06); }

.mc-header { display: flex; align-items: center; gap: 8px; }
.mc-name { font-size: 16px; font-weight: 700; color: #1A1A1A; flex: 1; }
.known-badge { font-size: 11px; color: var(--gold); border: 1px solid var(--gold); padding: 1px 4px; border-radius: 2px; }
.mc-type { font-size: 12px; }
.mc-desc { font-size: 12px; color: var(--gray); line-height: 1.5; }
.mc-attrs { display: flex; flex-wrap: wrap; gap: 4px; }
.attr-chip {
  font-size: 11px; color: var(--gold);
  background: rgba(255,215,0,0.1);
  border: 1px solid rgba(255,215,0,0.3);
  padding: 2px 6px; border-radius: 2px;
}
.mc-req { font-size: 12px; }
.text-gold { color: var(--gold); }
.text-red { color: var(--red); }
.text-gray { color: var(--gray); }

.empty-card {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 32px; background: var(--bg-card); border-radius: 4px;
}

.action-bar { display: flex; gap: 8px; flex-wrap: wrap; }
.refresh-cost { font-size: 12px; }

.hall-tip { font-size: 11px; text-align: center; }

/* 修炼 */
.practice-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-card);
  border-radius: 3px;
}
.pr-left { display: flex; align-items: center; gap: 6px; width: 110px; flex-shrink: 0; }
.pr-name { font-size: 13px; color: #1A1A1A; flex: 1; }
.pr-mid { flex: 1; display: flex; align-items: center; gap: 6px; }
.mastery-bar-wrap { flex: 1; height: 4px; background: #222; border-radius: 2px; overflow: hidden; }
.bar-mastery { height: 100%; background: var(--gold); transition: width 0.3s; }
.pr-mastery { font-size: 11px; width: 36px; text-align: right; flex-shrink: 0; }
.pr-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.pr-cost { font-size: 11px; }
.practice-tip { font-size: 11px; text-align: center; }

/* 藏书阁 */
.section-title {
  font-size: 11px; color: var(--gray); letter-spacing: 0.1em;
  border-bottom: 1px solid var(--border); padding-bottom: 4px;
}

.scroll-list { display: flex; flex-direction: column; gap: 4px; }
.scroll-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-card);
  border-radius: 3px;
}
.sr-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.sr-name { font-size: 13px; color: #1A1A1A; }
.sr-target { font-size: 11px; }
.sr-qty { font-size: 11px; flex-shrink: 0; }

/* 通用 */
.btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: #1A1A1A;
  border-radius: 3px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.btn:hover { border-color: var(--red); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-red { background: var(--red); border-color: var(--red); color: white; }
.btn-red:hover:not(:disabled) { background: var(--red-dark); }
.btn-gold { background: var(--gold); border: none; color: #1A1A1A; }
.btn-gold:hover:not(:disabled) { filter: brightness(0.9); }
.btn-sm { padding: 3px 8px; font-size: 12px; }

.empty-tip { text-align: center; color: var(--gray); font-size: 13px; padding: 16px; }

/* 弹窗 */
.modal {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 20px;
  max-width: 360px;
  width: 100%;
  display: flex; flex-direction: column; gap: 12px;
}
.modal-title { font-size: 18px; font-weight: 700; }
.modal-desc { font-size: 13px; color: var(--gray); line-height: 1.6; }
</style>

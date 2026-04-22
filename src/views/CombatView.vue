<template>
  <div class="combat-view">
    <!-- 天阶敌人红屏警告 -->
    <div v-if="flashRed" class="tian-flash" @click="flashRed = false">
      <div class="tian-flash-text">⚠ 天阶强敌来袭 ⚠</div>
    </div>

    <!-- 顶部状态 -->
    <div class="combat-status">
      <div class="turn-indicator text-red">{{ enemy ? '⚔ 战斗进行中' : '战斗结束' }}</div>
    </div>

    <!-- 敌人 -->
    <div class="enemy-section" v-if="enemy">
      <div class="enemy-name">
        <span :class="['rank-tag','rank-'+enemy.rank]">{{ rankLabel[enemy.rank] }}</span>
        {{ enemy.name }}
        <span v-if="currentPhase && enemy.rank === 'tian' && currentPhase.desc" class="phase-tag">
          {{ currentPhase.desc }}
        </span>
      </div>
      <div class="hp-row">
        <span class="bar-label text-gray">生命</span>
        <div class="bar-track">
          <div class="bar-fill bar-hp" :style="{ width: enemyHpPct + '%' }"></div>
        </div>
        <span class="bar-text">{{ Math.max(0, Math.floor(enemy.current_hp)) }}/{{ enemy.max_hp }}</span>
      </div>
      <div class="enemy-desc text-gray">{{ enemy.desc }}</div>
    </div>

    <!-- 战斗日志 -->
    <div class="combat-log" ref="logEl">
      <div
        v-for="(line, i) in displayedLogs"
        :key="i"
        :class="['log-line', line.type || '', line.isNew ? 'log-new' : '']"
      >{{ line.text }}</div>
    </div>

    <!-- 玩家状态 -->
    <div class="player-section">
      <div class="pstat-row">
        <span class="bar-label text-red">你</span>
        <div class="bar-track">
          <div class="bar-fill bar-hp" :style="{ width: playerHpPct + '%' }"></div>
        </div>
        <span class="bar-text">{{ Math.floor(state.player.current_hp) }}</span>
      </div>
      <div class="pstat-row">
        <span class="bar-label text-gray">内力</span>
        <div class="bar-track">
          <div class="bar-fill bar-qi" :style="{ width: playerQiPct + '%' }"></div>
        </div>
        <span class="bar-text">{{ Math.floor(state.player.current_qi) }}</span>
      </div>
      <div class="pstat-row">
        <span class="bar-label text-gray">体力</span>
        <div class="bar-track">
          <div class="bar-fill bar-stamina" :style="{ width: playerStaminaPct + '%' }"></div>
        </div>
        <span class="bar-text">{{ Math.floor(state.player.current_stamina) }}</span>
      </div>
    </div>

    <!-- 动作区 -->
    <div class="action-section">
      <!-- 武学列表 -->
      <div v-if="showMartials" class="martial-list">
        <button class="btn btn-sm btn-ghost" @click="showMartials = false">← 返回</button>
        <button
          v-for="m in playerMartials"
          :key="m.martial_id"
          :class="['martial-btn', getCooldown(m.martial_id) > 0 ? 'on-cooldown' : '']"
          @click="useMartial(m.martial_id)"
        >
          <span :class="['rank-tag','rank-'+m.data.rank]">{{ rankLabel[m.data.rank] }}</span>
          {{ m.data.name }}
          <span v-if="getCooldown(m.martial_id) > 0" class="cd-tag">⏱{{ getCooldown(m.martial_id) }}T</span>
        </button>
      </div>

      <!-- 基础动作 -->
      <div v-else class="basic-actions">
        <button class="btn btn-red" @click="doAction('basic_attack')">👊 普通攻击</button>
        <button class="btn btn-gold" @click="showMartials = true">⚔ 武学</button>
        <button class="btn btn-ghost" @click="doAction('defend')">🛡 防御</button>
        <button class="btn btn-ghost" @click="doAction('useItem')">💊 道具</button>
        <button class="btn btn-ghost" @click="doAction('flee')">🏃 逃跑</button>
      </div>
    </div>

    <!-- 战斗结束遮罩 -->
    <div class="combat-over" v-if="combatEnded">
      <div class="over-title" :class="enemy?.current_hp <= 0 ? '' : 'defeat'">
        {{ enemy?.current_hp <= 0 ? '胜' : '败' }}
      </div>
      <div class="over-sub text-gray" v-if="enemy?.current_hp <= 0">
        获得 {{ enemy?.reward_exp }} 经验，{{ enemy?.reward_gold }} 两银子
      </div>
      <button class="btn btn-red btn-lg" @click="backToExplore">返回探索</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'

const router = useRouter()
const game = useGame()
const state = game.state
const showMartials = ref(false)
const logEl = ref(null)
const flashRed = ref(false)

// 逐条弹出的日志缓冲系统
const displayedLogs = ref([])
let pendingQueue = []
let logTimer = null

// 判断是否为关键日志（立即显示）
function isKeyLog (logEntry) {
  const text = typeof logEntry === 'string' ? logEntry : logEntry?.text || ''
  return (
    text.includes('伤害') ||
    text.includes('暴击') ||
    text.includes('击败') ||
    text.includes('阶段') ||
    text.includes('威胁') ||
    text.includes('恢复') ||
    text.includes('吸血') ||
    text.includes('灼烧') ||
    text.includes('共鸣')
  )
}

function flushPending (immediate = false) {
  if (!pendingQueue.length) return
  const entry = pendingQueue.shift()
  displayedLogs.value.push({ ...entry, isNew: true })
  // 标记为非新（动画结束后移除动画类）
  setTimeout(() => {
    const idx = displayedLogs.value.findIndex(l => l === entry)
    if (idx >= 0) displayedLogs.value[idx] = { ...entry, isNew: false }
  }, 400)
  if (pendingQueue.length) {
    logTimer = setTimeout(() => flushPending(), immediate ? 0 : 250)
  }
}

function syncLogs () {
  const raw = state.combat?.log || []
  // 计算新增的日志
  const newEntries = raw.slice(displayedLogs.value.length)
  if (!newEntries.length) return
  // 分类：关键日志立即显示，其余进入队列
  for (const entry of newEntries) {
    const normalized = typeof entry === 'string' ? { text: entry, type: '' } : entry
    if (isKeyLog(normalized)) {
      displayedLogs.value.push({ ...normalized, isNew: true })
      setTimeout(() => {
        const idx = displayedLogs.value.findIndex(l => l === normalized)
        if (idx >= 0) displayedLogs.value[idx] = { ...normalized, isNew: false }
      }, 400)
    } else {
      pendingQueue.push(normalized)
    }
  }
  // 开始弹出队列
  if (pendingQueue.length && !logTimer) {
    flushPending()
  }
}

watch(() => state.combat?.log?.length, () => {
  syncLogs()
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight
  })
})

// 战斗开始时重置日志
watch(() => state.combat?.enemy?.id, () => {
  clearTimeout(logTimer)
  logTimer = null
  pendingQueue = []
  displayedLogs.value = []
})

onUnmounted(() => {
  clearTimeout(logTimer)
})

const enemy = computed(() => state.combat?.enemy)
const combatEnded = computed(() => !state.combat?.inCombat && enemy.value?.current_hp !== undefined)

const playerMartials = computed(() => game.getKnownMartials().filter(m => {
  if (m.data.weapon === null && state.player?.equipment?.weapon) return false
  return true
}))

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }

const enemyHpPct = computed(() => enemy.value ? Math.max(0, enemy.value.current_hp / enemy.value.max_hp * 100) : 0)
const currentPhase = computed(() => {
  if (!enemy.value?.phases) return null
  const hpPct = enemyHpPct.value / 100
  return enemy.value.phases.find(p => hpPct <= p.threshold) || enemy.value.phases[0]
})
const playerHpPct = computed(() => state.player ? Math.max(0, state.player.current_hp / game.computed.maxHP.value * 100) : 0)
const playerQiPct = computed(() => state.player ? Math.max(0, state.player.current_qi / game.computed.maxQi.value * 100) : 0)
const playerStaminaPct = computed(() => state.player ? Math.max(0, state.player.current_stamina / game.computed.maxStamina.value * 100) : 0)

function getCooldown (martialId) {
  return state.player?.martialCooldowns?.[martialId] || 0
}

function useMartial (martialId) {
  if (!martialId) { showMartials.value = false; return }
  game.playerAction('martial', martialId)
}

function doAction (action) { game.playerAction(action) }

function backToExplore () {
  state.phase = 'main'
  showMartials.value = false
  router.push('/game/explore')
}

// 天阶敌人红屏警告
watch(enemy, (newEnemy) => {
  if (newEnemy?.rank === 'tian') {
    flashRed.value = true
    setTimeout(() => { flashRed.value = false }, 2000)
  }
}, { immediate: true })
</script>

<style scoped>
.combat-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
  position: relative;
}

.combat-status {
  flex-shrink: 0;
  padding: 6px 12px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  text-align: center;
}

.turn-indicator { font-size: 13px; font-weight: 700; }

.enemy-section {
  flex-shrink: 0;
  padding: 10px 12px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.enemy-name {
  font-size: 16px;
  font-weight: 700;
  color: #1A1A1A;
  display: flex;
  align-items: center;
  gap: 6px;
}

.phase-tag {
  font-size: 10px;
  color: var(--red);
  border: 1px solid var(--red);
  padding: 1px 5px;
  border-radius: 2px;
  animation: blink 1s ease-in-out infinite;
}

.hp-row, .pstat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.bar-track {
  flex: 1;
  height: 4px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
}

.bar-text { font-size: 10px; color: var(--gray); width: 50px; text-align: right; flex-shrink: 0; }
.enemy-desc { font-size: 11px; font-style: italic; }

.combat-log {
  flex: 1;
  overflow-y: auto;
  background: var(--white);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.log-line { font-size: 13px; line-height: 1.7; color: #333; }
.log-line.combat { color: var(--red); font-weight: 600; }
.log-line.system { color: var(--gold); }
.log-line.enemy { color: var(--gray); font-style: italic; }

/* 日志淡入动画 */
.log-new {
  animation: logFadeIn 0.35s ease forwards;
}
@keyframes logFadeIn {
  from { opacity: 0; transform: translateX(-6px); }
  to { opacity: 1; transform: translateX(0); }
}

.player-section {
  flex-shrink: 0;
  padding: 8px 12px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-section {
  flex-shrink: 0;
  padding: 8px 12px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.basic-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.martial-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.martial-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  color: #1A1A1A;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s;
}
.martial-btn:hover { border-color: var(--red); }
.martial-btn.on-cooldown { opacity: 0.5; cursor: not-allowed; }

.cd-tag {
  margin-left: auto;
  font-size: 10px;
  color: var(--blue);
  background: rgba(30,58,138,0.3);
  padding: 1px 4px;
  border-radius: 2px;
}

.combat-over {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 10;
}

.over-title {
  font-size: 72px;
  font-weight: 900;
  color: var(--red);
  text-shadow: 0 0 30px rgba(194,40,40,0.7);
}
.over-title.defeat { color: var(--gray); text-shadow: none; }
.over-sub { font-size: 14px; }

.btn-lg { padding: 12px 32px; font-size: 16px; }
.btn-gold { border-color: var(--gold); color: var(--gold); }
.btn-gold:hover { background: var(--gold); color: var(--bg); }

/* 天阶敌人红屏警告 */
.tian-flash {
  position: fixed;
  inset: 0;
  background: rgba(194, 40, 40, 0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: flash-pulse 0.5s ease-in-out 4;
}

.tian-flash-text {
  font-size: 28px;
  font-weight: 900;
  color: white;
  text-shadow: 0 0 20px rgba(255, 100, 100, 0.9);
  animation: flash-text 0.5s ease-in-out infinite alternate;
  text-align: center;
  letter-spacing: 0.2em;
}

@keyframes flash-pulse {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}

@keyframes flash-text {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}
</style>
le>

<template>
  <div class="notice-view">
    <div class="view-header">
      <button class="back-btn" @click="back">← 返回</button>
      <span class="view-title">📋 告示栏</span>
    </div>

    <div class="notice-content">
      <!-- 已有任务 -->
      <div class="section-title">进行中的任务</div>
      <div v-if="activeQuests.length" class="quest-list">
        <div
          v-for="q in activeQuests"
          :key="q.id"
          :class="['quest-card', 'card-tier-' + getTierColor(q), q.worldEffect ? 'card-world' : '']"
        >
          <!-- 任务头部 -->
          <div class="quest-header">
            <span :class="['tier-badge', 'tier-badge-' + getTierColor(q)]">
              {{ getTierLabel(q) }}
            </span>
            <span class="quest-name">{{ q.name }}</span>
            <span v-if="q.chain" class="chain-badge">第{{ (q.chain.index || 0) + 1 }}环</span>
          </div>

          <div class="quest-desc">{{ q.desc }}</div>

          <!-- 时限 -->
          <div v-if="!q.claimed && !q.expired" class="quest-timer">
            <span class="text-gray">剩余：</span>
            <span :class="timerClass(q)">{{ formatTimer(q) }}</span>
          </div>

          <!-- 目标进度 -->
          <div class="quest-goals" v-if="!q.claimed">
            <div v-for="(g, i) in q.goals" :key="i" class="goal-row">
              <span class="text-gray">{{ g.locationName ? g.locationName + ' · ' : '' }}{{ g.enemyName || g.target || g.type }}</span>
              <span :class="g.completed ? 'text-gold' : 'text-gray'">
                {{ g.completed ? '✓' : '' }}{{ g.current }}/{{ g.count }}
              </span>
            </div>
          </div>

          <!-- 奖励 -->
          <div class="quest-reward" v-if="!q.claimed">
            报酬：{{ q.rewardDesc || '若干奖励' }}
          </div>

          <!-- 失败惩罚 -->
          <div class="quest-penalty text-red" v-if="q.failPenalty?.desc && q.failPenalty.type !== 'none'">
            ⚠ {{ q.failPenalty.desc }}
          </div>

          <!-- 世界效果提示 -->
          <div class="world-effect-hint" v-if="q.worldEffect">
            🌿 完成后：{{ q.worldEffect.desc }}
          </div>

          <!-- 操作 -->
          <div class="quest-actions">
            <button
              v-if="q.completed && !q.claimed"
              class="btn btn-red btn-sm"
              @click="claim(q.id)"
            >领取奖励</button>
            <span v-if="q.claimed" class="text-gold">✓ 已领取</span>
            <span v-if="q.expired" class="text-red">已过期</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-tip">暂无进行中的任务</div>

      <!-- 刷新新任务 -->
      <button class="btn btn-ghost btn-block" @click="refresh" style="margin-top:16px">
        🔄 查看新任务（消耗1回合）
      </button>
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

const activeQuests = computed(() => (state.quests || []).filter(q => q && !q.claimed))

function back () { router.push('/game/explore') }

function refresh () {
  const active = (state.quests || []).filter(q => !q.claimed)
  if (active.length >= 5) {
    game.addLog('任务已满，请先完成或放弃一些任务。', 'system')
    return
  }
  const slot = Math.min(3, 5 - active.length)
  const quests = game.generateQuestForLocation(slot)
  if (quests && quests.length) {
    game.advanceTurn(1)
    game.addLog(`你发现了 ${quests.length} 条新任务。`, 'event')
  }
}

function claim (id) { game.claimQuestReward(id) }

function getTierColor (q) {
  const tierColor = { tian: 'tian', di: 'di', xuan: 'xuan', huang: 'huang', wu: 'wu' }
  return q.tierColor || tierColor[q.tier] || 'huang'
}

function getTierLabel (q) {
  const tierLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
  return tierLabel[q.tier] || '黄'
}

function formatTimer (q) {
  const hoursPassed = Math.floor((state.clock - (q.created_turn || 0)) / 4)
  const expireHours = q.expire_hours || (q.expire_days || 3) * 24
  const remaining = Math.max(0, expireHours - hoursPassed)
  if (remaining === 0) return '已过期'
  const h = Math.floor(remaining)
  const m = Math.round((remaining - h) * 60)
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

function timerClass (q) {
  const hoursPassed = Math.floor((state.clock - (q.created_turn || 0)) / 4)
  const expireHours = q.expire_hours || (q.expire_days || 3) * 24
  const remaining = expireHours - hoursPassed
  if (remaining <= 6) return 'text-red'
  if (remaining <= 24) return 'text-orange'
  return 'text-gold'
}
</script>

<style scoped>
.notice-view {
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
  padding: 4px 0;
}

.view-title { font-size: 16px; font-weight: 700; color: #1A1A1A; }

.notice-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title { font-size: 12px; color: var(--gray); letter-spacing: 0.1em; }

.quest-list { display: flex; flex-direction: column; gap: 8px; }

/* 等阶卡片配色 */
.quest-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card-tier-tian { border-color: var(--tian); box-shadow: 0 0 6px rgba(194,40,40,0.3); }
.card-tier-di   { border-color: var(--di);   box-shadow: 0 0 5px rgba(255,215,0,0.25); }
.card-tier-xuan { border-color: var(--xuan); }
.card-tier-huang { border-color: var(--huang); }
.card-tier-wu   { border-color: var(--border); opacity: 0.8; }
.card-world { border-style: dashed; }

.quest-header { display: flex; align-items: center; gap: 6px; }

.tier-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 2px;
  border: 1px solid;
  flex-shrink: 0;
}
.tier-badge-tian { color: var(--tian); border-color: var(--tian); background: rgba(194,40,40,0.08); }
.tier-badge-di   { color: var(--di);   border-color: var(--di);   background: rgba(255,215,0,0.08); }
.tier-badge-xuan { color: var(--xuan); border-color: var(--xuan); background: rgba(128,0,128,0.08); }
.tier-badge-huang { color: var(--huang); border-color: var(--huang); background: rgba(0,0,255,0.08); }
.tier-badge-wu   { color: var(--gray); border-color: var(--border); }

.quest-name { font-size: 14px; font-weight: 700; color: #1A1A1A; flex: 1; }

.chain-badge {
  font-size: 10px;
  color: var(--gold);
  border: 1px solid var(--gold);
  padding: 1px 4px;
  border-radius: 2px;
}

.quest-desc { font-size: 12px; color: var(--gray); line-height: 1.5; }
.quest-timer { font-size: 11px; }
.quest-goals { display: flex; flex-direction: column; gap: 3px; }
.goal-row { display: flex; justify-content: space-between; font-size: 12px; }
.quest-reward { font-size: 12px; color: var(--gold); }
.quest-penalty { font-size: 11px; }
.world-effect-hint { font-size: 11px; color: #4caf50; font-style: italic; }
.quest-actions { display: flex; gap: 8px; align-items: center; margin-top: 4px; }

.empty-tip { color: var(--gray); font-size: 13px; text-align: center; padding: 24px; }
.btn-block { width: 100%; }
.text-red { color: var(--red); }
.text-orange { color: #ff9800; }
.text-gold { color: var(--gold); }
.text-gray { color: var(--gray); }
</style>

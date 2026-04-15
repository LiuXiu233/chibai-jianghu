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
        <div v-for="q in activeQuests" :key="q.id" class="quest-card">
          <div class="quest-name">{{ q.name }}</div>
          <div class="quest-desc">{{ q.desc }}</div>
          <div class="quest-goals" v-if="!q.claimed">
            <div v-for="(g, i) in q.goals" :key="i" class="goal-row">
              <span class="text-gray">{{ g.target }}</span>
              <span :class="g.completed ? 'text-gold' : 'text-gray'">{{ g.current }}/{{ g.count }}</span>
            </div>
          </div>
          <div class="quest-reward text-gold" v-if="!q.claimed">
            {{ q.rewards.map(r => r.type === 'gold' ? r.val + '两' : r.type === 'exp' ? r.val + '经验' : r.type === 'martial' ? '武学' : '物品').join(' · ') }}
          </div>
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

const activeQuests = computed(() => (state.quests || []).filter(q => !q.claimed))

function back () { router.push('/game/explore') }

function refresh () {
  game.enterBuilding('notice')
  router.push('/game/explore')
}

function claim (id) { game.claimQuestReward(id) }
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

.view-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--white);
}

.notice-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 12px;
  color: var(--gray);
  letter-spacing: 0.1em;
}

.quest-list { display: flex; flex-direction: column; gap: 8px; }

.quest-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quest-name { font-size: 14px; font-weight: 700; color: var(--white); }
.quest-desc { font-size: 12px; color: var(--gray); line-height: 1.5; }
.quest-goals { display: flex; flex-direction: column; gap: 3px; }
.goal-row { display: flex; justify-content: space-between; font-size: 12px; }
.quest-reward { font-size: 12px; }
.quest-actions { display: flex; gap: 8px; align-items: center; margin-top: 4px; }

.empty-tip { color: var(--gray); font-size: 13px; text-align: center; padding: 24px; }
.btn-block { width: 100%; }
</style>

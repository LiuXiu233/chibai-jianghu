<template>
  <div class="quest-view">
    <div class="tabs">
      <button :class="['tab', tab === 'active' ? 'tab-active' : '']" @click="tab = 'active'">进行中</button>
      <button :class="['tab', tab === 'done' ? 'tab-active' : '']" @click="tab = 'done'">已完成</button>
    </div>

    <div class="quest-list">
      <div
        v-for="q in filteredQuests"
        :key="q.id"
        class="quest-item"
      >
        <div class="quest-header">
          <span class="quest-name">{{ q.name }}</span>
          <span class="quest-type text-gray">{{ typeLabel[q.type] || q.type }}</span>
        </div>
        <div class="quest-desc">{{ q.desc }}</div>
        <!-- 进度 -->
        <div class="quest-goals" v-if="!q.claimed">
          <div v-for="(goal, gi) in q.goals" :key="gi" class="goal-row">
            <span class="goal-target">{{ goal.target }}</span>
            <div class="goal-bar-wrap">
              <div class="bar-fill" :style="{ width: (goal.current / goal.count * 100) + '%', background: goal.completed ? 'var(--gold)' : 'var(--red)' }"></div>
            </div>
            <span class="goal-count" :class="goal.completed ? 'text-gold' : ''">{{ goal.current }}/{{ goal.count }}</span>
          </div>
        </div>
        <!-- 奖励 -->
        <div class="quest-rewards" v-if="!q.claimed">
          <span class="rewards-label">奖励：</span>
          <span v-for="r in q.rewards" :key="JSON.stringify(r)" class="reward-item">
            {{ r.type === 'gold' ? r.val + '两银子' : r.type === 'exp' ? r.val + '经验' : r.type === 'martial' ? '武学' : r.type === 'random_item' ? '随机物品' : r.type }}
          </span>
        </div>
        <!-- 操作 -->
        <div class="quest-actions">
          <button
            class="btn btn-red btn-sm"
            v-if="q.completed && !q.claimed"
            @click="game.claimQuestReward(q.id)"
          >领取奖励</button>
          <span class="claimed-text" v-if="q.claimed">✓ 已领取</span>
          <span class="done-text" v-if="q.completed && !q.claimed">✓ 可领取</span>
        </div>
      </div>

      <div class="empty-tip" v-if="filteredQuests.length === 0">
        {{ tab === 'active' ? '暂无进行中的任务，去告示栏看看吧。' : '暂无已完成的任务。' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGame } from '../composables/useGame'

const game = useGame()
const state = game.state
const tab = ref('active')

const typeLabel = {
  defeat: '击败',
  deliver: '传递',
  collect: '采集',
  explore: '探索',
  guard: '护送',
  hunt: '狩猎',
  talk: '打听',
  series: '连环',
}

const filteredQuests = computed(() => {
  const quests = state.quests || []
  return tab.value === 'active' ? quests.filter(q => !q.completed) : quests.filter(q => q.claimed)
})
</script>

<style scoped>
.quest-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
  gap: 10px;
}

.tabs {
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

.quest-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quest-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quest-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--white);
}

.quest-type { font-size: 12px; }

.quest-desc {
  font-size: 13px;
  color: var(--gray);
  line-height: 1.5;
}

.quest-goals {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.goal-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.goal-target { width: 60px; color: var(--white); flex-shrink: 0; }

.goal-bar-wrap {
  flex: 1;
  height: 4px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
}

.goal-count { width: 40px; text-align: right; font-size: 11px; }

.quest-rewards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  margin-top: 4px;
}

.rewards-label { color: var(--gray); }
.reward-item { color: var(--gold); }

.quest-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.claimed-text, .done-text {
  font-size: 13px;
  color: var(--gold);
  display: flex;
  align-items: center;
}

.empty-tip {
  text-align: center;
  color: var(--gray);
  font-size: 14px;
  padding: 32px;
}
</style>

<template>
  <div class="building-view">
    <div class="building-header">
      <div class="building-name">{{ buildingNames[state.building?.type] || '' }}</div>
    </div>

    <!-- 告示栏 -->
    <div v-if="state.building?.type === 'notice'" class="building-content">
      <div class="quest-offer" v-if="state.building.data">
        <div class="quest-offer-name">{{ state.building.data.name }}</div>
        <div class="quest-offer-desc">{{ state.building.data.desc }}</div>
        <div class="quest-offer-rewards">
          奖励：
          <span v-for="r in state.building.data.rewards" :key="JSON.stringify(r)" class="reward-item">
            {{ r.type === 'gold' ? r.val + '两' : r.type === 'exp' ? r.val + '经验' : '其他' }}
          </span>
        </div>
        <button class="btn btn-red" @click="acceptQuest">接受任务</button>
      </div>
      <div v-else class="empty-tip">告示栏空空如也。</div>
    </div>

    <!-- 铁匠铺 -->
    <div v-if="state.building?.type === 'blacksmith'" class="building-content">
      <div class="blacksmith-gold">💰 你有 <span class="text-gold">{{ state.player?.gold }}</span> 两银子</div>
      <div class="blacksmith-slot" v-for="slot in ['weapon', 'armor', 'accessory']" :key="slot">
        <div class="bslot-header">{{ slotNames[slot] }}</div>
        <div v-if="state.player?.equipment?.[slot]" class="bslot-item">
          <span :class="['rank-tag', 'rank-' + equipped[slot]?.rank]">{{ rankLabel[equipped[slot]?.rank] }}</span>
          <span class="bslot-name">{{ equipped[slot]?.name }}</span>
          <button class="btn btn-sm btn-red" @click="doUpgrade(slot)">强化</button>
        </div>
        <div v-else class="bslot-empty">空</div>
      </div>
    </div>

    <!-- 药铺 -->
    <div v-if="state.building?.type === 'pharmacy'" class="building-content">
      <div class="shop-item" v-if="state.building.data">
        <span :class="['rank-tag', 'rank-' + state.building.data.rank]">{{ rankLabel[state.building.data.rank] }}</span>
        <span class="item-name">{{ state.building.data.name }}</span>
        <span class="item-cost text-gold">{{ state.building.data.cost }}两</span>
        <button class="btn btn-sm btn-red" @click="buyDrug">购买</button>
      </div>
      <div class="shop-gold">你身上有：<span class="text-gold">{{ state.player?.gold }}</span> 两银子</div>
    </div>

    <!-- 酒馆 -->
    <div v-if="state.building?.type === 'tavern'" class="building-content">
      <div class="tavern-content" v-if="state.building.data">
        <div class="tavern-gossip" :class="state.building.data.type === 'hidden' ? 'hidden-hint' : ''">
          {{ state.building.data.type === 'hidden' ? '你听说了一处隐秘之地的线索：' : '' }}
          {{ state.building.data.type === 'hidden' ? state.building.data.location?.desc : state.building.data.text }}
        </div>
        <div class="hidden-location" v-if="state.building.data.type === 'hidden' && state.building.data.location">
          <span class="hl-name">📍 {{ state.building.data.location.name }}</span>
        </div>
      </div>
    </div>

    <!-- 武馆 -->
    <div v-if="state.building?.type === 'martialHall'" class="building-content">
      <div class="martial-teach" v-if="state.building.data">
        <div class="teach-title">
          <span :class="['rank-tag', 'rank-' + state.building.data.rank]">{{ rankLabel[state.building.data.rank] }}</span>
          {{ state.building.data.name }}
        </div>
        <div class="teach-desc">{{ state.building.data.desc }}</div>
        <button class="btn btn-red" @click="learnMartialHall">修习此招</button>
      </div>
    </div>

    <button class="btn btn-ghost back-btn" @click="back">返回</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { useRoute } from 'vue-router'
import { getItemById } from '../data/items.js'

const router = useRouter()
const route = useRoute()
const game = useGame()
const state = game.state

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }

const slotNames = { weapon: '武器', armor: '防具', accessory: '饰品' }

const equipped = computed(() => ({
  weapon: state.player?.equipment?.weapon ? getItemById(state.player.equipment.weapon) : null,
  armor: state.player?.equipment?.armor ? getItemById(state.player.equipment.armor) : null,
  accessory: state.player?.equipment?.accessory ? getItemById(state.player.equipment.accessory) : null,
}))

function doUpgrade (slot) {
  game.upgradeEquipment(slot)
}

const buildingNames = {
  notice: '📋 告示栏',
  blacksmith: '🔨 铁匠铺',
  pharmacy: '💊 药铺',
  tavern: '🍶 酒馆',
  martialHall: '⚔ 武馆',
}

function acceptQuest () {
  game.addLog(`你接受了任务「${state.building.data.name}」。`, 'event')
  state.building.data = null
}

function buyDrug () {
  if (state.building.data) {
    game.buyItem(state.building.data.id)
  }
}

function learnMartialHall () {
  game.learnAtMartialHall()
}

function back () {
  state.phase = 'main'
  state.building = null
  router.push('/game/location')
}
</script>

<style scoped>
.building-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 16px;
}

.building-header {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.building-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--white);
}

.building-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quest-offer {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quest-offer-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--white);
}

.quest-offer-desc {
  font-size: 13px;
  color: var(--gray);
  line-height: 1.5;
}

.quest-offer-rewards {
  font-size: 13px;
  color: var(--gray);
}

.reward-item { color: var(--gold); margin-left: 4px; }

.shop-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-name { flex: 1; font-size: 14px; color: var(--white); }
.item-cost { font-size: 14px; }

.shop-gold { font-size: 13px; color: var(--gray); }

.tavern-content {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 16px;
}

.tavern-gossip {
  font-size: 14px;
  color: var(--gray);
  line-height: 1.6;
  font-style: italic;
}

.tavern-gossip.hidden-hint {
  color: var(--gold);
  font-style: normal;
  font-weight: 600;
}

.hidden-location {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(194, 40, 40, 0.15);
  border: 1px solid var(--red-dark);
  border-radius: 3px;
}

.hl-name {
  font-size: 14px;
  color: var(--red);
  font-weight: 700;
}

.martial-teach {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.teach-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 8px;
}

.teach-desc {
  font-size: 13px;
  color: var(--gray);
  line-height: 1.5;
}

.empty-tip {
  text-align: center;
  color: var(--gray);
  font-size: 14px;
  padding: 32px;
}

.back-btn { margin-top: auto; }

/* 铁匠铺 */
.blacksmith-gold {
  font-size: 14px;
  color: var(--gray);
  margin-bottom: 8px;
}

.blacksmith-slot {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.bslot-header {
  font-size: 11px;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.bslot-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bslot-name { flex: 1; font-size: 14px; color: var(--white); }

.bslot-empty { font-size: 13px; color: var(--gray); font-style: italic; }
</style>

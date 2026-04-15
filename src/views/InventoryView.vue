<template>
  <div class="inventory-view">
    <!-- 装备栏 -->
    <div class="section-title">装备</div>
    <div class="equipment-slots">
      <div class="equip-slot" @click="selectEquip('weapon')">
        <span class="slot-label">武器</span>
        <span class="slot-item" v-if="equipped.weapon">{{ equipped.weapon.name }}</span>
        <span class="slot-empty" v-else>空</span>
      </div>
      <div class="equip-slot" @click="selectEquip('armor')">
        <span class="slot-label">防具</span>
        <span class="slot-item" v-if="equipped.armor">{{ equipped.armor.name }}</span>
        <span class="slot-empty" v-else>空</span>
      </div>
      <div class="equip-slot" @click="selectEquip('accessory')">
        <span class="slot-label">饰品</span>
        <span class="slot-item" v-if="equipped.accessory">{{ equipped.accessory.name }}</span>
        <span class="slot-empty" v-else>空</span>
      </div>
    </div>

    <!-- 负重 -->
    <div class="carry-bar">
      <span class="carry-label">负重</span>
      <div class="bar-wrap">
        <div class="bar-fill" :class="carryPct > 90 ? 'bar-hp' : 'bar-stamina'" :style="{ width: carryPct + '%' }"></div>
      </div>
      <span class="carry-val">{{ carryWeight }} / {{ maxCarry }}</span>
    </div>

    <!-- 标签切换 -->
    <div class="tab-bar">
      <button :class="['tab', tab === 'all' ? 'tab-active' : '']" @click="tab = 'all'">全部</button>
      <button :class="['tab', tab === 'weapon' ? 'tab-active' : '']" @click="tab = 'weapon'">武器</button>
      <button :class="['tab', tab === 'armor' ? 'tab-active' : '']" @click="tab = 'armor'">防具</button>
      <button :class="['tab', tab === 'consumable' ? 'tab-active' : '']" @click="tab = 'consumable'">消耗品</button>
      <button :class="['tab', tab === 'material' ? 'tab-active' : '']" @click="tab = 'material'">材料</button>
    </div>

    <!-- 物品列表 -->
    <div class="item-list">
      <div
        v-for="entry in filteredItems"
        :key="entry.item_id"
        class="item-row"
        @click="showItemDetail(entry)"
      >
        <span :class="['rank-tag', 'rank-' + entry.item.rank]">{{ rankLabel[entry.item.rank] }}</span>
        <span class="item-name">{{ entry.item.name }}</span>
        <span class="item-qty" v-if="entry.quantity > 1">×{{ entry.quantity }}</span>
        <button class="btn btn-sm" v-if="entry.item.type === 'consumable'" @click.stop="useItem(entry.item_id)">使用</button>
        <button class="btn btn-sm btn-red" v-if="entry.item.type === 'weapon' || entry.item.type === 'armor' || entry.item.type === 'accessory'" @click.stop="equipItem(entry.item_id)">装备</button>
      </div>
      <div class="empty-tip" v-if="filteredItems.length === 0">背包空空如也</div>
    </div>

    <!-- 物品详情弹窗 -->
    <div class="modal" v-if="detail" @click.self="detail = null">
      <div class="modal-content">
        <div class="modal-title">
          <span :class="['rank-tag', 'rank-' + detail.rank]">{{ rankLabel[detail.rank] }}</span>
          {{ detail.name }}
        </div>
        <div class="modal-desc">{{ detail.desc }}</div>
        <div class="modal-attrs" v-if="detail.attrs">
          <div v-for="(v, k) in detail.attrs" :key="k" class="attr-bonus">
            {{ attrNames[k] || k }}: +{{ v }}
          </div>
        </div>
        <div class="modal-btns">
          <button class="btn btn-sm" @click="detail = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGame } from '../composables/useGame'
import { getItemById } from '../data/items.js'

const game = useGame()
const state = game.state
const tab = ref('all')
const detail = ref(null)

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const attrNames = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性', hp: '生命', defense: '防御', dodge: '闪避', hp_regen: '生命回复', qi_regen: '内力回复' }

const inventory = computed(() => (state.player?.inventory || []).map(e => ({
  ...e,
  item: getItemById(e.item_id),
})).filter(e => e.item))

const equipped = computed(() => ({
  weapon: state.player?.equipment?.weapon ? getItemById(state.player.equipment.weapon) : null,
  armor: state.player?.equipment?.armor ? getItemById(state.player.equipment.armor) : null,
  accessory: state.player?.equipment?.accessory ? getItemById(state.player.equipment.accessory) : null,
}))

const filteredItems = computed(() => {
  if (tab.value === 'all') return inventory.value
  return inventory.value.filter(e => e.item.type === tab.value)
})

const carryWeight = computed(() => game.computed.carryWeight.value)
const maxCarry = computed(() => game.computed.maxCarry.value)
const carryPct = computed(() => maxCarry.value > 0 ? Math.min(100, carryWeight.value / maxCarry.value * 100) : 0)

function selectEquip (slot) {
  // 卸下装备
  if (slot === 'weapon' && state.player.equipment.weapon) {
    game.unequipItem('weapon')
  } else if (slot === 'armor' && state.player.equipment.armor) {
    game.unequipItem('armor')
  } else if (slot === 'accessory' && state.player.equipment.accessory) {
    game.unequipItem('accessory')
  }
}

function equipItem (itemId) {
  game.equipItem(itemId)
  game.addLog(`你装备了${getItemById(itemId)?.name}。`, 'system')
}

function useItem (itemId) {
  const item = getItemById(itemId)
  if (!item || item.type !== 'consumable') return
  const entry = state.player.inventory.find(e => e.item_id === itemId)
  if (!entry || entry.quantity <= 0) return
  if (item.effect.hp) state.player.current_hp = Math.min(state.player.max_hp, state.player.current_hp + item.effect.hp)
  if (item.effect.qi) state.player.current_qi = Math.min(state.player.max_qi, state.player.current_qi + item.effect.qi)
  if (item.effect.stamina) state.player.current_stamina = Math.min(state.player.max_stamina, state.player.current_stamina + item.effect.stamina)
  if (item.effect.cure === 'poison') {
    game.addLog('你解除了中毒状态。', 'system')
  }
  entry.quantity--
  if (entry.quantity <= 0) {
    state.player.inventory = state.player.inventory.filter(e => e.item_id !== itemId)
  }
  game.addLog(`你使用了${item.name}。`, 'system')
}

function showItemDetail (entry) {
  detail.value = entry.item
}
</script>

<style scoped>
.inventory-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
  gap: 10px;
}

.section-title {
  font-size: 13px;
  color: var(--gray);
  letter-spacing: 0.1em;
}

.equipment-slots {
  display: flex;
  gap: 8px;
}

.equip-slot {
  flex: 1;
  padding: 10px 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: border-color 0.15s;
}

.equip-slot:hover { border-color: var(--red); }

.slot-label {
  font-size: 11px;
  color: var(--gray);
}

.slot-item {
  font-size: 13px;
  color: var(--white);
  font-weight: 600;
}

.slot-empty {
  font-size: 13px;
  color: var(--gray);
  font-style: italic;
}

.tab-bar {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 6px;
}

.tab {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  color: var(--gray);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.tab-active {
  border-color: var(--red);
  color: var(--white);
}

.item-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-card);
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.15s;
}

.item-row:hover { background: var(--bg-card-hover); }

.item-name {
  flex: 1;
  font-size: 14px;
  color: var(--white);
}

.item-qty {
  font-size: 12px;
  color: var(--gray);
}

.empty-tip {
  text-align: center;
  color: var(--gray);
  font-size: 14px;
  padding: 32px;
}

.carry-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.carry-label {
  font-size: 12px;
  color: var(--gray);
  width: 32px;
  flex-shrink: 0;
}

.carry-val {
  font-size: 11px;
  color: var(--gray);
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}

.bar-wrap {
  flex: 1;
  height: 4px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
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
  gap: 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--white);
  display: flex;
  align-items: center;
  gap: 8px;
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

.attr-bonus {
  font-size: 13px;
  color: var(--gold);
}

.modal-btns {
  display: flex;
  gap: 8px;
}
</style>

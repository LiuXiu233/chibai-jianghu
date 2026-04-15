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
      <button :class="['tab', tab === 'scroll' ? 'tab-active' : '']" @click="tab = 'scroll'">残卷</button>
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
        <button class="btn btn-sm btn-gold" v-if="entry.item.type === 'martial_scroll' || entry.item.type === 'xinfa_scroll'" @click.stop="showScrollDetail(entry)">研习</button>
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
        <div class="modal-type">{{ typeLabel[detail.type] || detail.type }}</div>
        <div class="modal-desc">{{ detail.desc }}</div>
        <!-- 武学残卷信息 -->
        <div class="scroll-info" v-if="detail.type === 'martial_scroll' && detail.martial_id">
          <div class="scroll-target">可习得武学：{{ getMartialName(detail.martial_id) }}</div>
          <div class="scroll-req text-gray">悟性要求：{{ getMartialReq(detail.martial_id) }}（你 {{ state.player?.attrs?.悟性 }}）</div>
        </div>
        <!-- 心法残卷信息 -->
        <div class="scroll-info" v-if="detail.type === 'xinfa_scroll' && detail.xinfa_id">
          <div class="scroll-target">可修习心法：{{ getXinfaName(detail.xinfa_id) }}</div>
          <div class="scroll-req text-gray">悟性要求：{{ getXinfaReq(detail.xinfa_id) }}（你 {{ state.player?.attrs?.悟性 }}）</div>
        </div>
        <div class="modal-attrs" v-if="detail.attrs">
          <div v-for="(v, k) in detail.attrs" :key="k" class="attr-bonus">
            {{ attrNames[k] || k }}: +{{ v }}
          </div>
        </div>
        <div class="modal-btns">
          <button class="btn btn-sm btn-gold" v-if="detail.type === 'martial_scroll' || detail.type === 'xinfa_scroll'" @click="learnFromScroll(detail)">研习</button>
          <button class="btn btn-sm" v-if="detail.type === 'consumable'" @click="useItem(detail.id)">使用</button>
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
import { MARTIAL_ARTS, XINFA } from '../data/martialArts.js'
import { getMartialReq as getMartialReqByRank } from '../data/generator.js'

const game = useGame()
const state = game.state
const tab = ref('all')
const detail = ref(null)

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const attrNames = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性', hp: '生命', defense: '防御', dodge: '闪避', hp_regen: '生命回复', qi_regen: '内力回复' }
const typeLabel = { consumable: '消耗品', weapon: '武器', armor: '防具', accessory: '饰品', material: '材料', martial_scroll: '武学残卷', xinfa_scroll: '心法残卷' }

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
  if (tab.value === 'scroll') return inventory.value.filter(e => e.item.type === 'martial_scroll' || e.item.type === 'xinfa_scroll')
  return inventory.value.filter(e => e.item.type === tab.value)
})

const carryWeight = computed(() => game.computed.carryWeight.value)
const maxCarry = computed(() => game.computed.maxCarry.value)
const carryPct = computed(() => maxCarry.value > 0 ? Math.min(100, carryWeight.value / maxCarry.value * 100) : 0)

function selectEquip (slot) {
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
  game.useItem(itemId)
}

function learnFromScroll (item) {
  const result = game.useItem(item.id)
  if (!result.ok) {
    if (result.reason === 'already_known') game.addLog('你已经会这门武学/心法了。', 'system')
    else if (result.reason === 'comprehension') game.addLog(`悟性不足（需${result.required}，当前${result.current}）。`, 'system')
  }
  detail.value = null
}

function showItemDetail (entry) {
  detail.value = entry.item
}

function showScrollDetail (entry) {
  detail.value = entry.item
}

function getMartialName (martialId) {
  return MARTIAL_ARTS.find(m => m.id === martialId)?.name || martialId
}

function getXinfaName (xinfaId) {
  return XINFA.find(x => x.id === xinfaId)?.name || xinfaId
}

function getMartialReq (martialId) {
  const m = MARTIAL_ARTS.find(m => m.id === martialId)
  return m ? getMartialReqByRank(m.rank) : 0
}

function getXinfaReq (xinfaId) {
  const x = XINFA.find(x => x.id === xinfaId)
  return x?.learn_req?.comprehension ?? 0
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
  color: #1A1A1A;
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
  color: #1A1A1A;
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
  color: #1A1A1A;
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
  color: #1A1A1A;
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

.modal-type {
  font-size: 12px;
  color: var(--gray);
}

.scroll-info {
  background: rgba(255,200,0,0.08);
  border: 1px solid var(--gold);
  border-radius: 3px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scroll-target {
  font-size: 14px;
  color: #1A1A1A;
  font-weight: 600;
}

.scroll-req {
  font-size: 12px;
}

.btn-gold {
  background: var(--gold);
  color: #1A1A1A;
  border: none;
  border-radius: 3px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}

.btn-gold:hover {
  filter: brightness(0.9);
}
</style>

<template>
  <div class="blacksmith-view">
    <div class="view-header">
      <button class="back-btn" @click="back">← 返回</button>
      <span class="view-title">🔨 铁匠铺</span>
    </div>

    <div class="bs-content">
      <div class="bs-gold">💰 你有 <span class="text-red">{{ state.player?.gold }}</span> 两银子</div>

      <!-- 标签切换：购买 / 出售 -->
      <div class="tab-bar">
        <button :class="['tab', shopTab === 'buy' ? 'tab-active' : '']" @click="shopTab = 'buy'">购买装备</button>
        <button :class="['tab', shopTab === 'sell' ? 'tab-active' : '']" @click="shopTab = 'sell'">出售物品</button>
      </div>

      <!-- 购买 -->
      <div v-if="shopTab === 'buy'" class="shop-list">
        <div
          v-for="item in shopItems"
          :key="item.id"
          class="shop-item"
          :class="{ 'proc-item': item.proc || item._proc }"
        >
          <div class="si-left">
            <span :class="['rank-tag','rank-'+item.rank]">{{ rankLabel[item.rank] }}</span>
            <span class="si-name">{{ (item.proc || item._proc) ? '✨ ' : '' }}{{ item.name }}</span>
          </div>
          <div class="si-attrs" v-if="item.attrs">
            <span v-for="(v, k) in item.attrs" :key="k" class="attr-chip">
              {{ attrNames[k] || k }}+{{ v }}
            </span>
          </div>
          <div class="si-bottom">
            <span class="si-price text-gold">{{ item.cost }}两</span>
            <button
              class="btn btn-sm btn-red"
              @click="doBuy(item.id)"
              :disabled="(state.player?.gold || 0) < item.cost"
            >购买</button>
          </div>
        </div>
      </div>

      <!-- 出售 -->
      <div v-if="shopTab === 'sell'" class="sell-list">
        <!-- 已装备 -->
        <div class="sell-section" v-if="equippedAny">
          <div class="sell-label text-gray">已装备</div>
          <div v-for="(item, slot) in equipped" :key="slot" class="sell-item" v-if="item">
            <div class="sei-info">
              <span :class="['rank-tag','rank-'+item.rank]">{{ rankLabel[item.rank] }}</span>
              <span class="si-name">{{ item.name }}</span>
            </div>
            <div class="sei-price text-gold">估价 {{ getSellPrice(item) }}两</div>
            <button class="btn btn-sm" @click="doSell(item.id, slot)">出售</button>
          </div>
        </div>

        <div class="sell-section">
          <div class="sell-label text-gray">背包物品</div>
          <div v-for="entry in sellableItems" :key="entry.item_id" class="sell-item">
            <div class="sei-info">
              <span :class="['rank-tag','rank-'+entry.item.rank]">{{ rankLabel[entry.item.rank] }}</span>
              <span class="si-name">{{ entry.item.name }}</span>
              <span class="qty text-gray">×{{ entry.quantity }}</span>
            </div>
            <div class="sei-price text-gold">{{ getSellPrice(entry.item) }}两/个</div>
            <button class="btn btn-sm" @click="doSell(entry.item_id)">出售</button>
          </div>
        </div>
        <div class="empty-tip" v-if="!sellableItems.length && !equippedAny">背包空空，无物可售</div>
      </div>

      <!-- 强化装备 -->
      <div class="upgrade-section">
        <div class="section-title">强化装备</div>
        <div class="slot-list">
          <div v-for="slot in slots" :key="slot.key" class="equip-card">
            <div class="slot-label text-gray">{{ slot.label }}</div>
            <div v-if="equipped[slot.key]" class="equip-info">
              <div class="equip-row">
                <span :class="['rank-tag','rank-'+equipped[slot.key].rank]">{{ rankLabel[equipped[slot.key].rank] }}</span>
                <span class="equip-name">{{ equipped[slot.key].name }}</span>
              </div>
              <div class="equip-attrs" v-if="equipped[slot.key].attrs">
                <span v-for="(v, k) in equipped[slot.key].attrs" :key="k" class="attr-chip">
                  {{ attrNames[k] || k }}+{{ v }}
                </span>
              </div>
              <div class="equip-actions">
                <button class="btn btn-red btn-sm" @click="doUpgrade(slot.key)">
                  强化 ({{ getUpgradeCost(equipped[slot.key]) }}两)
                </button>
                <button class="btn btn-ghost btn-sm" @click="doUnequip(slot.key)">卸下</button>
              </div>
            </div>
            <div v-else class="equip-empty">空</div>
          </div>
        </div>
      </div>

      <div class="blacksmith-tip text-gray">
        强化随机提升属性，购买售价为原价，出售回收40%。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { ITEMS, getItemById } from '../data/items.js'
import { getBlacksmithShopItems } from '../data/generator.js'

const router = useRouter()
const game = useGame()
const state = game.state
const shopTab = ref('buy')

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const attrNames = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性', defense: '防御', dodge: '闪避', hp: '生命', hp_regen: '生命回复', qi_regen: '内力回复' }
const slots = [{ key: 'weapon', label: '武器' }, { key: 'armor', label: '防具' }, { key: 'accessory', label: '饰品' }]

// 商店出售的物品（静态 + 过程化装备）
const shopItems = computed(() => {
  const diff = game.computed.currentRegion.value?.difficulty || 1
  const seed = state.clock || Date.now()
  return getBlacksmithShopItems(diff, seed)
})

const equipped = computed(() => ({
  weapon: state.player?.equipment?.weapon ? getItemById(state.player.equipment.weapon) : null,
  armor: state.player?.equipment?.armor ? getItemById(state.player.equipment.armor) : null,
  accessory: state.player?.equipment?.accessory ? getItemById(state.player.equipment.accessory) : null,
}))

const equippedAny = computed(() => equipped.value.weapon || equipped.value.armor || equipped.value.accessory)

const sellableItems = computed(() =>
  (state.player?.inventory || [])
    .map(e => ({ ...e, item: getItemById(e.item_id) }))
    .filter(e => e.item && e.quantity > 0)
)

function getSellPrice (item) {
  return Math.floor((item.cost || 10) * 0.4)
}

function doBuy (itemId) {
  // 优先从商店列表中找到完整物品数据（含 proc 标记）
  const shopItem = shopItems.value.find(i => i.id === itemId)
  if (shopItem?.proc || shopItem?._proc) {
    const ok = game.buyProcItem(shopItem)
    if (ok && shopItem.type !== 'consumable') game.equipItem(itemId)
    return
  }
  const ok = game.buyItem(itemId)
  if (ok) {
    // 自动装备刚买的武器/防具/饰品
    const item = getItemById(itemId)
    if (item) game.equipItem(itemId)
  }
}

function doSell (itemId, equippedSlot) {
  if (equippedSlot) {
    game.unequipItem(equippedSlot)
    game.sellItem(itemId)
  } else {
    game.sellItem(itemId)
  }
}

function getUpgradeCost (item) {
  return item?.cost ? Math.max(50, Math.floor(item.cost / 3)) : 50
}

function doUpgrade (slot) { game.upgradeEquipment(slot) }
function doUnequip (slot) { game.unequipItem(slot) }
function back () { state.phase = 'main'; router.push('/game/explore') }
</script>

<style scoped>
.blacksmith-view {
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

.bs-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bs-gold { font-size: 14px; color: var(--gray); }

.tab-bar {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 6px;
}
.tab {
  padding: 4px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 2px;
  color: var(--gray);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.tab-active { border-color: var(--red); color: #1A1A1A; }

/* 购买列表 */
.shop-list { display: flex; flex-direction: column; gap: 6px; }
.shop-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.proc-item {
  border-color: var(--gold);
  background: rgba(197,146,10,0.05);
}
.si-left { display: flex; align-items: center; gap: 6px; }
.si-name { font-size: 14px; color: #1A1A1A; font-weight: 600; }
.si-attrs { display: flex; flex-wrap: wrap; gap: 3px; }
.attr-chip {
  font-size: 10px;
  color: var(--gold);
  background: rgba(255,215,0,0.1);
  border: 1px solid rgba(255,215,0,0.3);
  padding: 1px 5px;
  border-radius: 2px;
}
.si-bottom { display: flex; justify-content: space-between; align-items: center; }
.si-price { font-size: 13px; font-weight: 600; }

/* 出售列表 */
.sell-list { display: flex; flex-direction: column; gap: 10px; }
.sell-section { display: flex; flex-direction: column; gap: 4px; }
.sell-label { font-size: 11px; letter-spacing: 0.1em; margin-bottom: 2px; }
.sell-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
}
.sei-info { display: flex; align-items: center; gap: 6px; flex: 1; }
.sei-price { font-size: 12px; color: var(--gold); }
.qty { font-size: 11px; }

/* 强化 */
.upgrade-section { display: flex; flex-direction: column; gap: 8px; }
.section-title { font-size: 12px; color: var(--gray); letter-spacing: 0.1em; }
.slot-list { display: flex; flex-direction: column; gap: 10px; }
.equip-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.slot-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
.equip-row { display: flex; align-items: center; gap: 6px; }
.equip-name { font-size: 14px; color: #1A1A1A; font-weight: 600; }
.equip-attrs { display: flex; flex-wrap: wrap; gap: 4px; }
.equip-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.equip-empty { font-size: 13px; color: var(--gray); font-style: italic; }
.blacksmith-tip { font-size: 12px; line-height: 1.6; }
.empty-tip { color: var(--gray); font-size: 13px; text-align: center; padding: 16px; }
</style>

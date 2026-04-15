<template>
  <div class="blacksmith-view">
    <div class="view-header">
      <button class="back-btn" @click="back">← 返回</button>
      <span class="view-title">🔨 铁匠铺</span>
    </div>

    <div class="bs-content">
      <div class="bs-gold">💰 你有 <span class="text-gold">{{ state.player?.gold }}</span> 两银子</div>

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
                {{ attrNames[k] || k }} +{{ v }}
              </span>
            </div>
            <div class="equip-actions">
              <button class="btn btn-red btn-sm" @click="doUpgrade(slot.key)">
                强化 ({{ getCost(equipped[slot.key]) }}两)
              </button>
              <button class="btn btn-ghost btn-sm" @click="doUnequip(slot.key)">卸下</button>
            </div>
          </div>
          <div v-else class="equip-empty">空</div>
        </div>
      </div>

      <div class="blacksmith-tip text-gray">
        强化将随机提升装备属性，每次强化消耗银子。
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { getItemById } from '../data/items.js'

const router = useRouter()
const game = useGame()
const state = game.state

const rankLabel = { tian: '天', di: '地', xuan: '玄', huang: '黄', wu: '无' }
const attrNames = { power: '力量', qi: '气海', agility: '身法', constitution: '根骨', luck: '幸运', comprehension: '悟性', defense: '防御', dodge: '闪避', hp: '生命', hp_regen: '生命回复', qi_regen: '内力回复' }
const slots = [{ key: 'weapon', label: '武器' }, { key: 'armor', label: '防具' }, { key: 'accessory', label: '饰品' }]

const equipped = computed(() => ({
  weapon: state.player?.equipment?.weapon ? getItemById(state.player.equipment.weapon) : null,
  armor: state.player?.equipment?.armor ? getItemById(state.player.equipment.armor) : null,
  accessory: state.player?.equipment?.accessory ? getItemById(state.player.equipment.accessory) : null,
}))

function getCost (item) {
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
}

.view-title { font-size: 16px; font-weight: 700; color: var(--white); }

.bs-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bs-gold { font-size: 14px; color: var(--gray); }

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
.equip-name { font-size: 14px; color: var(--white); font-weight: 600; }

.equip-attrs { display: flex; flex-wrap: wrap; gap: 4px; }
.attr-chip {
  font-size: 11px;
  color: var(--gold);
  background: rgba(255,215,0,0.1);
  border: 1px solid rgba(255,215,0,0.3);
  padding: 1px 6px;
  border-radius: 2px;
}

.equip-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.equip-empty { font-size: 13px; color: var(--gray); font-style: italic; }

.blacksmith-tip { font-size: 12px; line-height: 1.6; }
</style>

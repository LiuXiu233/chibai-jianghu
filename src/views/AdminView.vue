<template>
  <div class="admin-view">
    <div class="admin-header">
      <div class="admin-title">内容管理器</div>
      <button class="btn btn-ghost btn-sm" @click="router.push('/game/location')">返回游戏</button>
    </div>

    <!-- 标签页 -->
    <div class="tab-bar">
      <button v-for="t in tabs" :key="t.id" :class="['tab', tab === t.id ? 'tab-active' : '']" @click="tab = t.id">{{ t.label }}</button>
    </div>

    <!-- 添加武学 -->
    <div v-if="tab === 'martial'" class="admin-content">
      <div class="form-title">添加自定义武学</div>
      <div class="form-grid">
        <div class="form-field">
          <label>名称</label>
          <input v-model="martialForm.name" class="input" placeholder="武学名称" />
        </div>
        <div class="form-field">
          <label>等级</label>
          <select v-model="martialForm.rank" class="input">
            <option value="wu">无</option>
            <option value="huang">黄</option>
            <option value="xuan">玄</option>
            <option value="di">地</option>
            <option value="tian">天</option>
          </select>
        </div>
        <div class="form-field">
          <label>类型</label>
          <select v-model="martialForm.type" class="input">
            <option value="external">外功</option>
            <option value="internal">内功</option>
            <option value="unarmed">空手</option>
          </select>
        </div>
        <div class="form-field">
          <label>武器类型</label>
          <input v-model="martialForm.weapon" class="input" placeholder="dao/jian/qiang等或留空" />
        </div>
        <div class="form-field full">
          <label>描述</label>
          <input v-model="martialForm.desc" class="input" placeholder="武学描述" />
        </div>
        <div class="form-field">
          <label>威力</label>
          <input v-model="martialForm.power" type="number" class="input" placeholder="基础威力" />
        </div>
        <div class="form-field">
          <label>消耗（体力）</label>
          <input v-model="martialForm.stamina" type="number" class="input" placeholder="体力消耗" />
        </div>
      </div>
      <button class="btn btn-red" @click="addMartial">添加武学</button>
      <div class="added-list" v-if="adminMartials.length">
        <div class="list-title">已添加（仅本次会话）：</div>
        <div v-for="m in adminMartials" :key="m.id" class="added-item">
          <span :class="['rank-tag', 'rank-' + m.rank]">{{ m.rank }}</span>
          {{ m.name }}
        </div>
      </div>
    </div>

    <!-- 添加物品 -->
    <div v-if="tab === 'item'" class="admin-content">
      <div class="form-title">添加自定义物品</div>
      <div class="form-grid">
        <div class="form-field">
          <label>名称</label>
          <input v-model="itemForm.name" class="input" placeholder="物品名称" />
        </div>
        <div class="form-field">
          <label>类型</label>
          <select v-model="itemForm.type" class="input">
            <option value="weapon">武器</option>
            <option value="armor">防具</option>
            <option value="accessory">饰品</option>
            <option value="consumable">消耗品</option>
            <option value="material">材料</option>
          </select>
        </div>
        <div class="form-field">
          <label>等级</label>
          <select v-model="itemForm.rank" class="input">
            <option value="wu">无</option>
            <option value="huang">黄</option>
            <option value="xuan">玄</option>
            <option value="di">地</option>
            <option value="tian">天</option>
          </select>
        </div>
        <div class="form-field">
          <label>价格</label>
          <input v-model="itemForm.cost" type="number" class="input" placeholder="售价" />
        </div>
        <div class="form-field full">
          <label>描述</label>
          <input v-model="itemForm.desc" class="input" placeholder="物品描述" />
        </div>
      </div>
      <button class="btn btn-red" @click="addItem">添加物品</button>
    </div>

    <!-- 添加敌人 -->
    <div v-if="tab === 'enemy'" class="admin-content">
      <div class="form-title">添加自定义敌人</div>
      <div class="form-grid">
        <div class="form-field">
          <label>名称</label>
          <input v-model="enemyForm.name" class="input" placeholder="敌人名称" />
        </div>
        <div class="form-field">
          <label>等级</label>
          <select v-model="enemyForm.rank" class="input">
            <option value="wu">无</option>
            <option value="huang">黄</option>
            <option value="xuan">玄</option>
            <option value="di">地</option>
            <option value="tian">天</option>
          </select>
        </div>
        <div class="form-field">
          <label>生命值</label>
          <input v-model="enemyForm.hp" type="number" class="input" />
        </div>
        <div class="form-field">
          <label>外功威力</label>
          <input v-model="enemyForm.power" type="number" class="input" />
        </div>
        <div class="form-field">
          <label>身法</label>
          <input v-model="enemyForm.agility" type="number" class="input" />
        </div>
        <div class="form-field full">
          <label>描述</label>
          <input v-model="enemyForm.desc" class="input" placeholder="敌人描述" />
        </div>
      </div>
      <button class="btn btn-red" @click="addEnemy">添加敌人</button>
    </div>

    <!-- 全局操作 -->
    <div v-if="tab === 'global'" class="admin-content">
      <div class="form-title">全局操作</div>
      <div class="global-ops">
        <button class="btn btn-red" @click="giveGold">获得500两银子</button>
        <button class="btn btn-red" @click="giveLevel">升1级</button>
        <button class="btn btn-red" @click="healAll">满血满内</button>
        <button class="btn btn-red" @click="learnRandom">随机武学</button>
        <button class="btn btn-ghost" @click="clearSave">清除存档</button>
      </div>
      <div class="save-section">
        <div class="form-title">存档码导出</div>
        <div class="save-code" v-if="saveCode">{{ saveCode }}</div>
        <button class="btn btn-sm" @click="exportSave">导出存档码</button>
        <div class="import-section">
          <div class="form-title">存档码导入</div>
          <input v-model="importCode" class="input" placeholder="粘贴存档码" />
          <button class="btn btn-sm" @click="importSave">导入</button>
        </div>
      </div>
    </div>

    <div class="admin-note">管理员模式 — 所有更改仅在本地生效</div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'
import { MARTIAL_ARTS, getRandomMartial } from '../data/martialArts.js'

const router = useRouter()
const game = useGame()
const state = game.state

const tab = ref('martial')
const tabs = [
  { id: 'martial', label: '武学' },
  { id: 'item', label: '物品' },
  { id: 'enemy', label: '敌人' },
  { id: 'global', label: '全局' },
]

const martialForm = reactive({ name: '', rank: 'huang', type: 'external', weapon: '', desc: '', power: 10, stamina: 10 })
const itemForm = reactive({ name: '', type: 'weapon', rank: 'huang', cost: 100, desc: '' })
const enemyForm = reactive({ name: '', rank: 'huang', hp: 50, power: 10, agility: 10, desc: '' })

const adminMartials = ref([])
const saveCode = ref('')
const importCode = ref('')

function addMartial () {
  if (!martialForm.name) return
  const martial = {
    id: 'admin_' + Date.now(),
    name: martialForm.name,
    rank: martialForm.rank,
    type: martialForm.type,
    weapon: martialForm.weapon || null,
    desc: martialForm.desc,
    attrs: { power: parseInt(martialForm.power) || 10 },
    masteryBonus: {},
    effects: [{ type: 'damage', attr: martialForm.type === 'internal' ? 'qi' : 'power', mult: 1.5, consume: { stamina: parseInt(martialForm.stamina) || 10 } }],
  }
  MARTIAL_ARTS.push(martial)
  adminMartials.value.push(martial)
  martialForm.name = ''
  martialForm.desc = ''
}

function addItem () {
  if (!itemForm.name) return
  const item = {
    id: 'admin_' + Date.now(),
    name: itemForm.name,
    type: itemForm.type,
    rank: itemForm.rank,
    cost: parseInt(itemForm.cost) || 100,
    desc: itemForm.desc,
    attrs: {},
  }
  game.addAdminItem(item)
  itemForm.name = ''
  itemForm.desc = ''
}

function addEnemy () {
  if (!enemyForm.name) return
  // 敌人数据仅在会话内有效
  const enemy = {
    id: 'admin_enemy_' + Date.now(),
    name: enemyForm.name,
    rank: enemyForm.rank,
    hp: parseInt(enemyForm.hp) || 50,
    power: parseInt(enemyForm.power) || 10,
    qi: 0,
    agility: parseInt(enemyForm.agility) || 10,
    constitution: 10,
    luck: 5,
    reward_gold: 50,
    reward_exp: 30,
    martial_id: null,
    desc: enemyForm.desc,
  }
  // 放入玩家遭遇池（通过修改游戏数据）
  game.addLog(`管理员添加了敌人：${enemy.name}`, 'system')
  enemyForm.name = ''
  enemyForm.desc = ''
}

function giveGold () {
  state.player.gold += 500
  game.addLog('管理员：获得500两银子。', 'system')
}

function giveLevel () {
  game.levelUp()
  game.addLog('管理员：提升1级。', 'system')
}

function healAll () {
  state.player.current_hp = state.player.max_hp
  state.player.current_qi = state.player.max_qi
  state.player.current_stamina = state.player.max_stamina
  game.addLog('管理员：生命、内力、体力全满。', 'system')
}

function learnRandom () {
  const m = getRandomMartial()
  if (m) {
    game.learnMartial(m.id)
    game.addLog(`管理员：学会了「${m.name}」。`, 'system')
  }
}

function exportSave () {
  saveCode.value = game.exportSaveCode()
}

function importSave () {
  if (!importCode.value) return
  const ok = game.importSaveCode(importCode.value.trim())
  if (ok) {
    router.push('/game/location')
  }
  importCode.value = ''
}

function clearSave () {
  if (confirm('确定清除所有存档数据？')) {
    localStorage.clear()
    router.push('/')
  }
}
</script>

<style scoped>
.admin-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
  gap: 10px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.admin-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--red);
}

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

.tab-active {
  border-color: var(--red);
  color: var(--white);
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-field.full { grid-column: 1 / -1; }

.form-field label {
  font-size: 12px;
  color: var(--gray);
}

.global-ops {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.save-section {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-code {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 2px;
  padding: 8px;
  font-size: 11px;
  color: var(--gold);
  word-break: break-all;
  font-family: monospace;
}

.import-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.added-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-title {
  font-size: 12px;
  color: var(--gray);
}

.added-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--white);
}

.admin-note {
  font-size: 11px;
  color: var(--gray);
  text-align: center;
  padding: 8px;
}
</style>

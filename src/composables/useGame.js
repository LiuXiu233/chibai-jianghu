// useGame.js — 全局游戏状态与核心逻辑
import { reactive, computed, readonly } from 'vue'
import { REGIONS, discoverHiddenLocation, getNeighborLocation, getRegionEntry } from '../data/regions.js'
import { MARTIAL_ARTS, XINFA, getRandomMartial } from '../data/martialArts.js'
import { ENEMY_TEMPLATES, spawnEnemy } from '../data/enemies.js'
import { ITEMS, getItemById } from '../data/items.js'
import { generateQuest, QUEST_TEMPLATES } from '../data/questTemplates.js'
import { FATE_QUESTIONS, BASE_ATTRS, BASE_HP, BASE_QI, BASE_STAMINA } from '../data/fateQuestions.js'

const MAX_TURNS = 24000 // 1000天 × 24小时
const SAVE_KEY = 'chibai_save_v1'
const ADMIN_KEY = 'chibai_admin_v1'

// 基础 HP/Qi/Stamina 由属性决定
function calcMaxHP (attrs) {
  return Math.floor(BASE_HP + attrs.根骨 * 8 + attrs.耐力 * 2)
}
function calcMaxQi (attrs) {
  return Math.floor(BASE_QI + attrs.气海 * 6 + attrs.悟性 * 1.5)
}
function calcMaxStamina (attrs) {
  return Math.floor(BASE_STAMINA + attrs.耐力 * 5)
}
function calcMaxCarry (attrs) {
  return 50 + attrs.力量 * 5
}

// ---- 全局单例 ----
const state = reactive({
  phase: 'init', // init | fate | main | combat | building | ending
  player: null,
  world: null,
  clock: 0, // 当前回合(小时)
  quests: [],
  eventLog: [],
  combat: null,
  building: null,
  fateAnswers: [],
  fateIndex: 0,
})

// ---- 导出状态（只读） ----
export function useGame () {
  return {
    state: readonly(state),
    computed: {
      currentDay: computed(() => Math.floor(state.clock / 24) + 1),
      currentHour: computed(() => (state.clock % 24) + 1),
      currentRegion: computed(() => {
        if (!state.player) return null
        return REGIONS.find(r => r.id === state.player.regionId)
      }),
      currentLocation: computed(() => {
        if (!state.player) return null
        const region = REGIONS.find(r => r.id === state.player.regionId)
        if (!region) return null
        return region.locations.find(l => l.id === state.player.locationId) || null
      }),
      maxHP: computed(() => state.player ? calcMaxHP(state.player.attrs) : BASE_HP),
      maxQi: computed(() => state.player ? calcMaxQi(state.player.attrs) : BASE_QI),
      maxStamina: computed(() => state.player ? calcMaxStamina(state.player.attrs) : BASE_STAMINA),
      maxCarry: computed(() => state.player ? calcMaxCarry(state.player.attrs) : 50),
      carryWeight: computed(() => {
        if (!state.player) return 0
        return (state.player.inventory || []).reduce((sum, inv) => {
          const item = getItemById(inv.item_id)
          if (!item) return sum
          // 材料和消耗品负重为1，装备为5，武器为8
          const wt = item.type === 'material' ? 1 : item.type === 'consumable' ? 1 : item.type === 'weapon' ? 8 : item.type === 'armor' ? 5 : 2
          return sum + wt * inv.quantity
        }, 0)
      }),
      alive: computed(() => (state.player ? state.player.current_hp > 0 : true)),
      isOver: computed(() => state.clock >= MAX_TURNS || (state.player && state.player.current_hp <= 0)),
    },

    // ---- 初始化 ----
    init () {
      const saved = localStorage.getItem(SAVE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          Object.assign(state, data)
          state.phase = 'main'
          return
        } catch (e) {
          console.warn('存档损坏，已清除')
          localStorage.removeItem(SAVE_KEY)
        }
      }
      state.phase = 'init'
    },

    // ---- 命途问答 ----
    startFate () {
      state.phase = 'fate'
      state.fateIndex = 0
      state.fateAnswers = []
      // 打乱题目顺序
      const shuffled = [...FATE_QUESTIONS].sort(() => Math.random() - 0.5)
      state.fateQuestions = shuffled.slice(0, 5)
    },

    answerFate (optionIndex) {
      const q = state.fateQuestions[state.fateIndex]
      const opt = q.options[optionIndex]
      state.fateAnswers.push({ qId: q.id, optionIndex, effect: opt.effect })

      const attrs = { ...BASE_ATTRS }
      for (const [k, v] of Object.entries(opt.effect)) {
        attrs[k] = (attrs[k] || 0) + v
      }

      state.fateIndex++
      if (state.fateIndex >= 5) {
        this.createCharacter(attrs)
        state.phase = 'main'
      }
    },

    // ---- 创建角色 ----
    createCharacter (attrs) {
      state.player = {
        name: '江湖侠客',
        attrs,
        current_hp: calcMaxHP(attrs),
        max_hp: calcMaxHP(attrs),
        current_qi: calcMaxQi(attrs),
        max_qi: calcMaxQi(attrs),
        current_stamina: calcMaxStamina(attrs),
        max_stamina: calcMaxStamina(attrs),
        gold: 50,
        level: 1,
        exp: 0,
        exp_needed: 100,
        regionId: 'zhongyuan',
        locationId: 'qingyun',
        equipment: { weapon: null, armor: null, accessory: null },
        martial_arts: [], // [{martial_id, mastery: 0-100}]
        xinfas: [],
        inventory: [], // [{item_id, quantity}]
        achievements: [],
        explored_locations: [],
        discovered_locations: [], // 酒馆传闻触发的隐藏地点
        enemy_kills: {},
        martialCooldowns: {}, // { martial_id: remainingTurns }
        max_daily_actions: 34, // 24 + 耐力基准10
        daily_actions_used: 0,
        carry_weight: 0,
      }
      state.quests = []
      state.eventLog = []
      state.clock = 0
      state.player.carry_weight = 0
      state.player.max_carry = calcMaxCarry(attrs)
      state.player.martialCooldowns = {}
      state.player.discovered_locations = []
      state.player.max_daily_actions = 24 + (attrs.耐力 || 0)
      state.player.daily_actions_used = 0

      // 初始武学（根据属性给予）
      if (attrs.力量 >= 14) this.learnMartial('luohan')
      if (attrs.气海 >= 14) this.learnMartial('jianfa')
      if (attrs.身法 >= 14) this.learnMartial('feihua')
      if (attrs.悟性 >= 14) this.learnMartial('yijing')
      // 无论如何给一套基础武功（无级武学无悟性门槛）
      if (this.getKnownMartials().length === 0) {
        this.learnMartial('huanian')
        this.learnMartial('gunfa')
      }

      // 初始物品
      this.addItem('drug_1', 3)

      this.addLog('欢迎来到江湖！你的命途，由你自己书写。', 'system')
      this.addLog('你降生在中原·青云镇。', 'event')
    },

    // ---- 日志 ----
    addLog (text, type = 'normal') {
      state.eventLog.push({ text, type, id: Date.now() + Math.random(), ts: state.clock })
      if (state.eventLog.length > 200) state.eventLog.shift()
    },

    // ---- 移动 ----
    move (direction) {
      // direction: 'north'|'south'|'east'|'west'
      const p = state.player
      // 行动上限检查
      if ((p.daily_actions_used || 0) >= p.max_daily_actions) {
        this.addLog('今日行动次数已用尽，请在酒馆休息等待明天。', 'system')
        return
      }
      // 负重超限检查
      const cw = this.computed.carryWeight.value
      if (cw > p.max_carry) {
        this.addLog(`你携带物品过重（${cw}/${p.max_carry}），无法继续行动。请先出售或丢弃物品。`, 'system')
        return
      }
      // 有向连接移动
      const prevRegion = REGIONS.find(r => r.id === p.regionId)
      const neighbor = getNeighborLocation(p.regionId, p.locationId, direction)
      if (!neighbor) {
        this.addLog('此路不通。', 'system')
        return
      }
      p.locationId = neighbor.id
      this.advanceTurn(1)

      // 随机遭遇
      const roll = Math.random()
      if (roll < 0.15) {
        const difficulty = prevRegion?.difficulty || 1
        const enemy = spawnEnemy(ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)], difficulty, state.clock)
        state.combat = { enemy, inCombat: true, log: [] }
        state.phase = 'combat'
        this.addLog(`在${neighbor.name}附近，你遭遇了${enemy.name}！`, 'combat')
      } else {
        this.addLog(`你来到了【${prevRegion.name}·${neighbor.name}】。${neighbor.desc}`, 'event')
        this.checkRandomEvent()
      }
    },

    // ---- 跨区域移动 ----
    travelToRegion (regionId) {
      const region = REGIONS.find(r => r.id === regionId)
      if (!region) return
      // 传送到该区域的入口地点
      const entryId = getRegionEntry(regionId)
      if (!entryId) return
      state.player.regionId = regionId
      state.player.locationId = entryId
      this.advanceTurn(8)
      const entry = region.locations.find(l => l.id === entryId)
      this.addLog(`你长途跋涉，来到了【${region.name}·${entry?.name || region.name}】。${region.desc}`, 'event')
    },

    // ---- 心法被动效果（每回合结算） ----
    applyXinfaPassives (hours = 1) {
      const p = state.player
      if (!p) return
      for (const xf of (p.xinfas || [])) {
        const xinfa = XINFA.find(x => x.id === xf.id)
        if (!xinfa) continue
        // 每回合回复5%生命值（易筋经）
        if (xinfa.attrs.hp_regen) {
          const heal = Math.floor(p.max_hp * xinfa.attrs.hp_regen / 100 * hours)
          p.current_hp = Math.min(p.max_hp, p.current_hp + heal)
        }
        // 每回合额外回复内力（九阳）
        if (xinfa.attrs.qi_regen) {
          const qi = Math.floor(xinfa.attrs.qi_regen * hours)
          p.current_qi = Math.min(p.max_qi, p.current_qi + qi)
        }
      }
    },

    // ---- 任务过期检查 ----
    checkTaskExpiration () {
      const currentDay = Math.floor(state.clock / 24) + 1
      for (const q of state.quests) {
        if (q.claimed || q.completed) continue
        const createdDay = Math.floor((q.created_turn || 0) / 24) + 1
        if (currentDay - createdDay > (q.expire_days || 99)) {
          q.expired = true
          this.addLog(`任务【${q.name}】已过期。`, 'system')
        }
      }
    },

    // ---- 连环任务续接（20% 概率） ----
    continueChainQuest (completedQuest) {
      if (!completedQuest.series || completedQuest.series_index >= 4) return
      if (Math.random() >= 0.2) return
      const nextIndex = completedQuest.series_index + 1
      const nextTemplates = QUEST_TEMPLATES.filter(t =>
        t.series === completedQuest.series && t.series_index === nextIndex
      )
      if (!nextTemplates.length) return
      const nextTemplate = nextTemplates[0]
      const regionId = state.player?.regionId || 'zhongyuan'
      const diff = REGIONS.find(r => r.id === regionId)?.difficulty || 1
      const quest = generateQuest(regionId, diff, state.clock + Math.random() * 1000)
      // 用模板数据覆盖
      quest.template_id = nextTemplate.id
      quest.name = nextTemplate.name.replace('{location}', quest.goals?.[0]?.target || '某地')
        .replace('{enemy}', quest.goals?.[0]?.target || '某人')
      quest.desc = nextTemplate.desc.replace('{location}', quest.goals?.[0]?.target || '某地')
        .replace('{enemy}', quest.goals?.[0]?.target || '某人')
      quest.type = nextTemplate.type
      quest.series = nextTemplate.series
      quest.series_index = nextTemplate.series_index
      quest.goals = nextTemplate.goals.map(g => ({
        ...g,
        target: typeof g.target === 'string' ? g.target : g.target,
        count: typeof g.count === 'string' ? parseInt(g.count) : g.count,
        current: 0,
        completed: false,
      }))
      quest.rewards = nextTemplate.rewards
      quest.expire_days = nextTemplate.expire_days
      quest.created_turn = state.clock
      quest.id = 'quest_' + Date.now()
      state.quests.push(quest)
      this.addLog(`【连环任务】你意外获得了新线索：「${quest.name}」！`, 'event')
    },

    // ---- 时间推进 ----
    advanceTurn (hours = 1) {
      state.clock += hours
      // 心法被动效果
      this.applyXinfaPassives(hours)
      // 恢复体力/内力
      const stamina_regen = Math.floor(5 * hours)
      const qi_regen = Math.floor(2 * hours)
      state.player.current_stamina = Math.min(state.player.max_stamina, state.player.current_stamina + stamina_regen)
      state.player.current_qi = Math.min(state.player.max_qi, state.player.current_qi + qi_regen)
      // 每日行动计数
      state.player.daily_actions_used = (state.player.daily_actions_used || 0) + hours
      // 刷新每日行动计数（新的一天）
      const prevDay = Math.floor((state.clock - hours) / 24) + 1
      const currDay = Math.floor(state.clock / 24) + 1
      if (currDay > prevDay) {
        state.player.daily_actions_used = hours
        this.addLog(`新的一天开始了。（今日已行动 ${hours} / ${state.player.max_daily_actions} 次）`, 'system')
      }
      // 减少武学冷却
      for (const [id, turns] of Object.entries(state.player.martialCooldowns || {})) {
        if (turns > 0) state.player.martialCooldowns[id] = Math.max(0, turns - hours)
      }
      // 任务过期检查（每6小时一次）
      if (state.clock % 6 === 0) this.checkTaskExpiration()
      // 检查生命
      if (state.player.current_hp <= 0) {
        state.phase = 'ending'
        this.addLog('你倒在了江湖的路上……命途终结。', 'system')
      }
      if (state.clock >= MAX_TURNS) {
        state.phase = 'ending'
        this.addLog('时光飞逝，转眼间，千年已过。你的江湖路，至此终结。', 'system')
      }
    },

    // ---- 随机事件 ----
    checkRandomEvent () {
      const r = Math.random()
      if (r < 0.03) {
        // 发现物品
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
        this.addItem(item.id, 1)
        this.addLog(`你在地上发现了：${item.name}！`, 'event')
      } else if (r < 0.06) {
        // 偶遇商人
        const gold = Math.floor(Math.random() * 20) + 10
        state.player.gold += gold
        this.addLog(`一位好心路人给了你 ${gold} 两银子。`, 'event')
      }
    },

    // ---- 战斗 ----
    startCombat (enemy) {
      if ((state.player.daily_actions_used || 0) >= state.player.max_daily_actions) {
        this.addLog('今日行动次数已用尽，无法继续战斗。', 'system')
        return false
      }
      const spawned = spawnEnemy(enemy, state.player ? REGIONS.find(r => r.id === state.player.regionId)?.difficulty || 1 : 1)
      state.combat = { enemy: spawned, inCombat: true, log: [], playerTurn: true }
      state.phase = 'combat'
      this.addLog(`你与${spawned.name}的战斗开始！`, 'combat')
      return true
    },

    playerAction (action, martialId = null) {
      if (!state.combat || !state.combat.inCombat) return
      const e = state.combat.enemy
      const p = state.player
      let log = []

      if (action === 'defend') {
        p.current_stamina = Math.min(p.max_stamina, p.current_stamina + 15)
        p.current_qi = Math.min(p.max_qi, p.current_qi + 10)
        log.push('你运气护体，进入防御姿态。')
      } else if (action === 'flee') {
        const fleeChance = 0.4 + p.attrs.身法 / 200
        if (Math.random() < fleeChance) {
          log.push('你使出轻功，成功脱身！')
          state.combat.inCombat = false
          state.phase = 'main'
          this.advanceTurn(1)
          return
        } else {
          log.push('逃跑失败！')
        }
      } else if (action === 'useItem') {
        // 使用背包第一个消耗品
        const drug = p.inventory.find(i => {
          const item = getItemById(i.item_id)
          return item && item.type === 'consumable'
        })
        if (drug) {
          const item = getItemById(drug.item_id)
          if (item.effect.hp) p.current_hp = Math.min(p.max_hp, p.current_hp + item.effect.hp)
          if (item.effect.qi) p.current_qi = Math.min(p.max_qi, p.current_qi + item.effect.qi)
          if (item.effect.stamina) p.current_stamina = Math.min(p.max_stamina, p.current_stamina + item.effect.stamina)
          drug.quantity--
          if (drug.quantity <= 0) p.inventory = p.inventory.filter(i => i.item_id !== drug.item_id)
          log.push(`你使用了${item.name}。`)
        }
      } else if (action === 'martial' && martialId) {
        const known = p.martial_arts.find(m => m.martial_id === martialId)
        const martial = MARTIAL_ARTS.find(m => m.id === martialId)
        if (!known || !martial) return

        // 冷却检查
        const cd = p.martialCooldowns[martialId] || 0
        if (cd > 0) {
          log.push(`${martial.name}正在冷却中，还需等待${cd}回合。`)
        } else {
          const mastery = known.mastery || 0
          const masteryBonus = 1 + mastery / 200
          const attrVal = martial.type === 'external' ? p.attrs.力量 : p.attrs.气海
          const mult = martial.effects?.[0]?.mult || 1.5
          // 空手流派（weapon === null）享受 unarmedMult 加成
          const unarmedMult = martial.weapon === null ? (martial.unarmedMult || 1.2) : 1
          const power = Math.floor((attrVal * mult + martial.attrs?.power || 0) * masteryBonus * unarmedMult)
          const consume_stamina = martial.effects?.[0]?.consume?.stamina || 5
          const consume_qi = martial.effects?.[0]?.consume?.qi || 0

          if (p.current_stamina < consume_stamina && p.current_qi < consume_qi) {
            log.push(`${martial.name}需要消耗体力${consume_stamina}点或内力${consume_qi}点，你目前均不足！`)
          } else {
            // 扣除消耗（优先体力，不足扣内力）
            if (p.current_stamina >= consume_stamina) {
              p.current_stamina -= consume_stamina
            } else {
              p.current_qi -= consume_qi
            }
            // 暴击
            const critChance = p.attrs.幸运 / 300 + mastery / 2000
            const isCrit = Math.random() < critChance
            const finalDmg = isCrit ? power * 2 : power
            e.current_hp -= finalDmg
            const critText = isCrit ? '【暴击！】' : ''
            log.push(`你使出「${martial.name}」，对${e.name}造成${critText}${finalDmg}点伤害！`)

            // 武器特效（仅当装备武器时生效）
            const weaponId = p.equipment?.weapon
            if (weaponId) {
              const weapon = getItemById(weaponId)
              if (weapon?.special === 'lifesteal') {
                const heal = Math.floor(finalDmg * (weapon.special_val || 0.1))
                p.current_hp = Math.min(p.max_hp, p.current_hp + heal)
                log.push(`【吸血】你从${weapon.name}吸取了${heal}点生命！`)
              }
            }

            // 经验
            known.exp = (known.exp || 0) + 2
            if (known.exp >= 50) {
              known.mastery = Math.min(100, (known.mastery || 0) + 1)
              known.exp = 0
              log.push(`你的「${martial.name}」更加精熟了！`)
            }

            // 设置冷却（根据武学等级，天/地/玄/黄/无 = 3/4/5/6/8 回合）
            const cdMap = { tian: 3, di: 4, xuan: 5, huang: 6, wu: 8 }
            p.martialCooldowns[martialId] = cdMap[martial.rank] || 6
          }
        }
      }

      // 敌人回合
      if (state.combat.inCombat && e.current_hp > 0) {
        const eLog = this.enemyTurn()
        log = log.concat(eLog)
      }

      // 检查死亡
      if (e.current_hp <= 0) {
        log.push(`你击败了【${e.name}】！`)
        log.push(`获得：${e.reward_exp}经验，${e.reward_gold}两银子。`)
        p.exp += e.reward_exp
        p.gold += e.reward_gold
        if (p.exp >= p.exp_needed) this.levelUp()
        // 随机掉落
        if (Math.random() < 0.25) {
          const drop = ITEMS.filter(i => i.rank === e.rank)[Math.floor(Math.random() * ITEMS.filter(i => i.rank === e.rank).length)]
          if (drop) {
            this.addItem(drop.id, 1)
            log.push(`战利品：${drop.name}`)
          }
        }
        state.combat.inCombat = false
        state.combat.log = log
        state.phase = 'main'
        this.advanceTurn(2)
        // 任务检查
        this.checkKillQuest(e.name)
        return
      }

      if (p.current_hp <= 0) {
        log.push('你被【' + e.name + '】击败了！')
        state.phase = 'ending'
        state.combat.inCombat = false
        state.combat.log = log
        return
      }

      state.combat.log = log
    },

    enemyTurn () {
      const e = state.combat.enemy
      const p = state.player
      const logs = []
      const atk = e.power + Math.floor(Math.random() * 10)

      // 玩家装备特效：闪避（流影扇 dodge: 10 → 10% 额外闪避）
      let totalDodge = p.attrs.身法 / 200
      if (p.equipment?.weapon) {
        const wpn = getItemById(p.equipment.weapon)
        if (wpn?.special === 'dodge') totalDodge += (wpn.special_val || 0) / 100
      }
      if (Math.random() < totalDodge) {
        logs.push(`${e.name}的攻击被你闪避了！`)
      } else {
        // 玩家装备特效：防御（太极剑 defense: 15）
        let def = p.attrs.根骨 * 0.3
        if (p.equipment?.weapon) {
          const wpn = getItemById(p.equipment.weapon)
          if (wpn?.special === 'defense') def += wpn.special_val || 0
        }
        if (p.equipment?.armor) {
          const arm = getItemById(p.equipment.armor)
          if (arm?.attrs?.defense) def += arm.attrs.defense
        }
        const dmg = Math.max(1, Math.floor(atk - def))
        p.current_hp = Math.max(0, p.current_hp - dmg)
        logs.push(`${e.name}对你发动攻击，造成${dmg}点伤害！`)
      }
      return logs
    },

    // ---- 升级 ----
    levelUp () {
      const p = state.player
      p.level++
      p.exp -= p.exp_needed
      p.exp_needed = Math.floor(p.exp_needed * 1.6)
      const gain = { 力量: 2, 气海: 2, 身法: 1, 耐力: 2, 根骨: 2, 悟性: 1, 幸运: 1 }
      for (const [k, v] of Object.entries(gain)) {
        p.attrs[k] = (p.attrs[k] || 0) + v
      }
      p.max_hp = calcMaxHP(p.attrs)
      p.max_qi = calcMaxQi(p.attrs)
      p.max_stamina = calcMaxStamina(p.attrs)
      p.max_carry = calcMaxCarry(p.attrs)
      p.max_daily_actions = 24 + (p.attrs.耐力 || 0)
      p.current_hp = p.max_hp
      p.current_qi = p.max_qi
      this.addLog(`【升级！】你升至 ${p.level} 级！各项属性均有提升。`, 'event')
    },

    // ---- 武学 ----
    learnMartial (martialId) {
      const martial = MARTIAL_ARTS.find(m => m.id === martialId) || XINFA.find(m => m.id === martialId)
      if (!martial) return false
      const p = state.player
      if (p.martial_arts.find(m => m.martial_id === martialId)) return { ok: false, reason: 'already_known' }
      // 悟性门槛：武学等级越高，悟性要求越高
      const reqMap = { tian: 28, di: 22, xuan: 16, huang: 10, wu: 0 }
      const required = reqMap[martial.rank] || 10
      if ((p.attrs.悟性 || 0) < required) {
        return { ok: false, reason: 'comprehension', required, current: p.attrs.悟性 }
      }
      p.martial_arts.push({ martial_id: martialId, mastery: 0, exp: 0 })
      return { ok: true }
    },

    learnXinfa (xinfaId) {
      const xf = XINFA.find(x => x.id === xinfaId)
      if (!xf) return false
      const p = state.player
      if (p.xinfas.find(x => x.id === xinfaId)) return false
      p.xinfas.push({ id: xinfaId })
      // 应用心法加成
      if (xf.attrs.hp) {
        p.max_hp += xf.attrs.hp
        p.current_hp += xf.attrs.hp
      }
      if (xf.attrs.qi) {
        p.max_qi += xf.attrs.qi
        p.current_qi += xf.attrs.qi
      }
      return true
    },

    getKnownMartials () {
      return (state.player?.martial_arts || []).map(k => ({
        ...k,
        data: MARTIAL_ARTS.find(m => m.id === k.martial_id) || XINFA.find(m => m.id === k.martial_id),
      })).filter(k => k.data)
    },

    // ---- 物品 ----
    addItem (itemId, quantity) {
      const p = state.player
      if (!p) return
      const existing = p.inventory.find(i => i.item_id === itemId)
      if (existing) {
        existing.quantity += quantity
      } else {
        p.inventory.push({ item_id: itemId, quantity })
      }
    },

    removeItem (itemId, quantity = 1) {
      const p = state.player
      if (!p) return
      const idx = p.inventory.findIndex(i => i.item_id === itemId)
      if (idx >= 0) {
        p.inventory[idx].quantity -= quantity
        if (p.inventory[idx].quantity <= 0) p.inventory.splice(idx, 1)
      }
    },

    equipItem (itemId) {
      const p = state.player
      const item = getItemById(itemId)
      if (!item) return
      if (item.type === 'weapon') {
        p.equipment.weapon = itemId
      } else if (item.type === 'armor') {
        p.equipment.armor = itemId
      } else if (item.type === 'accessory') {
        p.equipment.accessory = itemId
      }
      // 应用装备属性加成
      if (item.attrs) {
        for (const [k, v] of Object.entries(item.attrs)) {
          if (!['hp', 'qi', 'power', 'agility', 'constitution', 'luck', 'comprehension', 'qi_regen', 'hp_regen'].includes(k)) continue
          if (k === 'power') p.attrs.力量 = (p.attrs.力量 || 0) + v
          if (k === 'qi') p.attrs.气海 = (p.attrs.气海 || 0) + v
          if (k === 'agility') p.attrs.身法 = (p.attrs.身法 || 0) + v
          if (k === 'constitution') p.attrs.根骨 = (p.attrs.根骨 || 0) + v
          if (k === 'luck') p.attrs.幸运 = (p.attrs.幸运 || 0) + v
          if (k === 'comprehension') p.attrs.悟性 = (p.attrs.悟性 || 0) + v
          if (k === 'hp_regen') {
            p.max_hp = calcMaxHP(p.attrs)
            p.current_hp = Math.min(p.current_hp, p.max_hp)
          }
          if (k === 'qi_regen') {
            p.max_qi = calcMaxQi(p.attrs)
            p.current_qi = Math.min(p.current_qi, p.max_qi)
          }
        }
      }
    },

    unequipItem (slot) {
      const p = state.player
      if (slot === 'weapon') p.equipment.weapon = null
      if (slot === 'armor') p.equipment.armor = null
      if (slot === 'accessory') p.equipment.accessory = null
    },

    // ---- 任务 ----
    generateQuestForLocation () {
      const regionId = state.player?.regionId || 'zhongyuan'
      const diff = REGIONS.find(r => r.id === regionId)?.difficulty || 1
      const quest = generateQuest(regionId, diff, state.clock + Math.random() * 1000)
      quest.created_turn = state.clock
      state.quests.push(quest)
      return quest
    },

    checkKillQuest (enemyName) {
      let completedQuest = null
      for (const q of state.quests) {
        if (q.completed || q.claimed || q.expired) continue
        for (const goal of q.goals) {
          if (goal.type === 'kill' && enemyName.includes(goal.target)) {
            goal.current++
            if (goal.current >= goal.count) goal.completed = true
          }
        }
        if (q.goals.every(g => g.completed)) {
          q.completed = true
          completedQuest = q
          this.addLog(`【任务完成】${q.name}！快去领取奖励吧！`, 'event')
        }
      }
      // 连环任务续接（20% 概率）
      if (completedQuest) this.continueChainQuest(completedQuest)
    },

    claimQuestReward (questId) {
      const q = state.quests.find(q => q.id === questId)
      if (!q || !q.completed || q.claimed) return
      q.claimed = true
      for (const r of q.rewards) {
        if (r.type === 'gold') state.player.gold += r.val
        if (r.type === 'exp') {
          state.player.exp += r.val
          if (state.player.exp >= state.player.exp_needed) this.levelUp()
        }
        if (r.type === 'martial') {
          const m = getRandomMartial(r.val)
          if (m) {
            this.learnMartial(m.id)
            this.addLog(`你领悟了武学：「${m.name}」！`, 'event')
          }
        }
        if (r.type === 'random_item') {
          const items = ITEMS.filter(i => i.rank === r.val)
          if (items.length) {
            const it = items[Math.floor(Math.random() * items.length)]
            this.addItem(it.id, 1)
            this.addLog(`你获得了物品：「${it.name}」！`, 'event')
          }
        }
      }
      this.addLog(`任务【${q.name}】奖励已领取！`, 'system')
    },

    // ---- 建筑 ----
    enterBuilding (type) {
      state.building = { type, data: null }
      state.phase = 'building'
      if (type === 'notice') {
        const quest = this.generateQuestForLocation()
        state.building.data = quest
        this.addLog(`你查看了告示栏，发现了一条新任务：「${quest.name}」。`, 'event')
      } else if (type === 'blacksmith') {
        this.addLog('铁匠铺：可修理装备。（功能开发中）', 'system')
      } else if (type === 'pharmacy') {
        // 随机卖药
        const drugs = ITEMS.filter(i => i.type === 'consumable')
        const drug = drugs[Math.floor(Math.random() * drugs.length)]
        state.building.data = drug
        this.addLog(`药铺里有一瓶${drug.name}，售价${drug.cost}两银子。`, 'event')
      } else if (type === 'tavern') {
        const regionId = state.player?.regionId || 'zhongyuan'
        // 30% 概率触发隐藏地点线索
        if (Math.random() < 0.3) {
          const hidden = discoverHiddenLocation(regionId, state.clock + Math.random() * 1000)
          if (hidden && !state.player.discovered_locations?.includes(hidden.id)) {
            state.player.discovered_locations.push(hidden.id)
            state.building.data = { type: 'hidden', location: hidden }
            this.addLog(`酒馆中有人低声说道：「我听说${hidden.regionId === 'zhongyuan' ? '中原' : hidden.regionId === 'xiyu' ? '西域' : hidden.regionId === 'nanjiang' ? '南疆' : hidden.regionId === 'beihan' ? '北寒' : '东海'}有一处隐秘之地，叫做${hidden.name}……」`, 'event')
            return
          }
        }
        const gossips = [
          { text: '听说最近西域出了个大魔头……', hidden: false },
          { text: '明教与正道的冲突越来越严重了。', hidden: false },
          { text: '有个高手隐居在北寒雪山之巅，从不与人交手。', hidden: false },
          { text: '五毒教的蛊术越来越邪门了。', hidden: false },
          { text: '最近江湖上新出现了一个神秘门派，门下弟子无人能挡。', hidden: false },
          { text: '少林寺的扫地僧，据说武功已入化境。', hidden: false },
        ]
        const gossip = gossips[Math.floor(Math.random() * gossips.length)]
        state.building.data = { type: 'normal', text: gossip.text }
        this.addLog(`酒馆中有人说：「${gossip}」`, 'event')
      } else if (type === 'martialHall') {
        // 随机教一个无级或黄级武学
        const roll = Math.random()
        const rank = roll < 0.4 ? 'wu' : 'huang'
        const m = getRandomMartial(rank)
        state.building.data = m
        this.addLog(`武馆中有一位隐世高手，愿意传授你一招「${m.name}」。`, 'event')
      }
    },

    buyItem (itemId) {
      const item = getItemById(itemId)
      if (!item) return false
      if (state.player.gold < item.cost) {
        this.addLog('银子不够！', 'system')
        return false
      }
      state.player.gold -= item.cost
      this.addItem(itemId, 1)
      this.addLog(`你购买了${item.name}。`, 'event')
      return true
    },

    // ---- 装备强化 ----
    getUpgradeCost (itemId) {
      const item = getItemById(itemId)
      if (!item || !item.cost) return 0
      // 强化费用为原价的三分之一（向下取整），最低50
      return Math.max(50, Math.floor(item.cost / 3))
    },

    upgradeEquipment (slot) {
      const p = state.player
      const itemId = p.equipment?.[slot]
      if (!itemId) return false
      const item = getItemById(itemId)
      if (!item) return false
      const cost = this.getUpgradeCost(itemId)
      if (p.gold < cost) {
        this.addLog(`强化${item.name}需要${cost}两银子，你只有${p.gold}两。`, 'system')
        return false
      }
      // 强化效果：随机提升一个属性 3~8 点
      const attrKeys = item.type === 'weapon' ? ['power', 'qi', 'agility'] : ['defense', 'constitution', 'agility']
      const gainKey = attrKeys[Math.floor(Math.random() * attrKeys.length)]
      if (!item.attrs) item.attrs = {}
      item.attrs[gainKey] = (item.attrs[gainKey] || 0) + Math.floor(Math.random() * 6) + 3
      p.gold -= cost
      this.addLog(`你花费${cost}两将${item.name}强化至+1！${gainKey === 'power' ? '力量' : gainKey === 'qi' ? '气海' : gainKey === 'defense' ? '防御' : gainKey === 'constitution' ? '根骨' : '身法'}提升了。`, 'event')
      return true
    },

    learnAtMartialHall () {
      const m = state.building?.data
      if (!m || !m.id) return
      const result = this.learnMartial(m.id)
      if (result.ok) {
        this.addLog(`你学会了「${m.name}」！`, 'event')
      } else if (result.reason === 'already_known') {
        this.addLog('你已经会这门武学了。', 'system')
      } else if (result.reason === 'comprehension') {
        this.addLog(`你的悟性不足（需${result.required}，当前${result.current}），无法修习「${m.name}」。`, 'system')
      }
    },

    // ---- 存档 ----
    saveGame () {
      try {
        const data = {
          phase: state.phase,
          player: state.player,
          world: state.world,
          clock: state.clock,
          quests: state.quests,
          eventLog: state.eventLog,
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(data))
        this.addLog('游戏已自动存档。', 'system')
        return true
      } catch (e) {
        this.addLog('存档失败！', 'system')
        return false
      }
    },

    exportSaveCode () {
      // 精简存档：只保留必要字段，大幅缩短长度
      const p = state.player
      const simplified = {
        n: p.name,
        l: p.level,
        e: p.exp,
        ne: p.exp_needed,
        h: Math.floor(p.current_hp),
        mh: p.max_hp,
        q: Math.floor(p.current_qi),
        mq: p.max_qi,
        s: Math.floor(p.current_stamina),
        ms: p.max_stamina,
        g: p.gold,
        a: p.attrs,
        eq: p.equipment,
        inv: p.inventory,
        ma: p.martial_arts,
        xf: p.xinfas,
        rid: p.regionId,
        lid: p.locationId,
        disc: p.discovered_locations || [],
        c: state.clock,
        qs: state.quests.filter(q => !q.claimed).map(q => ({
          id: q.id,
          tid: q.template_id,
          g: q.goals.map(g => ({ t: g.target, c: g.count, d: g.current })),
          done: q.completed,
          exp: q.expired,
          sid: q.series_index || 0,
        })),
      }
      // 压缩：用简单字符映射 + JSON
      const json = JSON.stringify(simplified)
      // 使用自定义短编码
      return this._compressSave(json)
    },

    _compressSave (json) {
      // 第一步：用 LZString 风格滑动窗口压缩（简化实现）
      // 将 JSON 中的常见字段名替换为单字符
      const dict = {
        '"name"': 'n', '"level"': 'l', '"exp"': 'e', '"hp"': 'h',
        '"max_hp"': 'mh', '"qi"': 'q', '"max_qi"': 'mq',
        '"stamina"': 's', '"max_stamina"': 'ms', '"gold"': 'g',
        '"attrs"': 'a', '"equipment"': 'eq', '"inventory"': 'inv',
        '"martial_arts"': 'ma', '"xinfas"': 'xf', '"regionId"': 'rid',
        '"locationId"': 'lid', '"discovered_locations"': 'disc',
        '"clock"': 'c', '"quests"': 'qs', '"item_id"': 'i',
        '"martial_id"': 'm', '"quantity"': 'q', '"mastery"': 'r',
        '"completed"': 'd', '"current"': 'c', '"target"': 't',
        '"count"': 'n', '"type"': 'y', '"rank"': 'k', '"id"': 'I',
      }
      let compressed = json
      for (const [k, v] of Object.entries(dict)) {
        compressed = compressed.split(k).join(v)
      }
      // base64 + 截断到合理长度（保留前512字符，约350字节 base64）
      const b64 = btoa(encodeURIComponent(compressed))
      // 返回带校验的短码：前32位内容码 + 4位校验
      const short = b64.substring(0, 32)
      const checksum = Array.from(b64).reduce((a, c) => a + c.charCodeAt(0), 0) % 10000
      return short + String(checksum).padStart(4, '0')
    },

    importSaveCode (code) {
      try {
        let json
        if (code.length <= 40) {
          // 新格式：32位内容 + 4位校验
          const payload = code.substring(0, 32)
          const stored = parseInt(code.substring(32, 36)) || 0
          const actual = Array.from(payload).reduce((a, c) => a + c.charCodeAt(0), 0) % 10000
          if (stored !== actual) throw new Error('checksum mismatch')
          json = decodeURIComponent(atob(payload))
        } else {
          // 旧格式（直接 base64 JSON）
          json = decodeURIComponent(atob(code))
        }
        const data = JSON.parse(json)
        // 兼容新旧格式
        if (data.p) {
          // 旧格式完整对象
          state.player = data.p
          state.clock = data.c
          state.quests = data.q || []
        } else {
          // 新格式精简对象 → 还原完整 player
          const p = state.player
          if (!p) throw new Error('no player')
          Object.assign(p, data, {
            current_hp: data.h || p.max_hp,
            max_hp: data.mh || p.max_hp,
            current_qi: data.q || p.max_qi,
            max_qi: data.mq || p.max_qi,
            current_stamina: data.s || p.max_stamina,
            max_stamina: data.ms || p.max_stamina,
            regionId: data.rid,
            locationId: data.lid,
            discovered_locations: data.disc || [],
            martial_arts: data.ma || [],
            xinfas: data.xf || [],
            inventory: data.inv || [],
            equipment: data.eq || { weapon: null, armor: null, accessory: null },
            quests: data.qs || [],
          })
          state.clock = data.c || 0
          state.quests = (data.qs || []).map(q => {
            const base = { id: q.id, template_id: q.tid, goals: (q.g || []).map(g => ({ target: g.t, count: g.n, current: g.c })), completed: q.done, claimed: false, expired: q.exp, series_index: q.sid, created_turn: state.clock }
            return base
          })
        }
        state.phase = 'main'
        state.eventLog = [{ text: '存档已成功导入！', type: 'system', id: Date.now() }]
        return true
      } catch (e) {
        this.addLog('存档码无效！', 'system')
        return false
      }
    },

    newGame () {
      localStorage.removeItem(SAVE_KEY)
      Object.assign(state, { phase: 'init', player: null, world: null, clock: 0, quests: [], eventLog: [], combat: null, building: null, fateAnswers: [], fateIndex: 0 })
      this.startFate()
    },

    // ---- 管理员 ----
    getAdminData () {
      try {
        return JSON.parse(localStorage.getItem(ADMIN_KEY) || '{"martials":[],"items":[],"enemies":[]}')
      } catch { return { martials: [], items: [], enemies: [] } }
    },
    saveAdminData (data) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(data))
    },
    addAdminMartial (martial) {
      const data = this.getAdminData()
      data.martials.push({ ...martial, id: 'admin_' + Date.now() })
      this.saveAdminData(data)
      MARTIAL_ARTS.push(data.martials[data.martials.length - 1])
    },
    addAdminItem (item) {
      const data = this.getAdminData()
      data.items.push({ ...item, id: 'admin_' + Date.now() })
      this.saveAdminData(data)
      ITEMS.push(data.items[data.items.length - 1])
    },
  }
}

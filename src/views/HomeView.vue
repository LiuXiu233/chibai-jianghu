<template>
  <div class="home-view">
    <div class="title-area">
      <div class="title-red pulse-red">赤</div>
      <div class="title-white">白</div>
      <div class="title-sub">江 湖</div>
    </div>
    <div class="subtitle">文字流 · 回合制 · 武侠开放世界</div>
    <div class="menu">
      <button class="btn btn-red btn-lg" @click="startGame">踏入江湖</button>
      <button class="btn btn-ghost" @click="loadGame" v-if="hasSave">继续游戏</button>
    </div>
    <div class="footer-hint">
      1000天寿命 · 5大区域 · 无限江湖
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGame } from '../composables/useGame'

const router = useRouter()
const game = useGame()
const hasSave = ref(false)

onMounted(() => {
  hasSave.value = !!localStorage.getItem('chibai_save_v1')
})

function startGame () {
  game.newGame()
  router.push('/fate')
}

function loadGame () {
  game.init()
  router.push('/game/location')
}
</script>

<style scoped>
.home-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background: radial-gradient(ellipse at 50% 30%, #1a0505 0%, #0D0D0D 70%);
  min-height: 100vh;
}

.title-area {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.title-red {
  font-size: 80px;
  font-weight: 900;
  color: var(--red);
  line-height: 1;
  text-shadow: 0 0 30px rgba(194,40,40,0.5);
  animation: pulse-red 3s ease-in-out infinite;
}

.title-white {
  font-size: 80px;
  font-weight: 900;
  color: var(--white);
  line-height: 1;
  text-shadow: 0 0 20px rgba(255,255,255,0.2);
}

.title-sub {
  font-size: 32px;
  font-weight: 700;
  color: var(--white);
  letter-spacing: 0.3em;
  margin-left: 8px;
}

.subtitle {
  color: var(--gray);
  font-size: 14px;
  letter-spacing: 0.15em;
  margin-bottom: 60px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 260px;
}

.footer-hint {
  position: fixed;
  bottom: 24px;
  color: var(--gray);
  font-size: 12px;
  letter-spacing: 0.1em;
}
</style>

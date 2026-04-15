<template>
  <div class="fate-view">
    <div class="fate-header">
      <div class="fate-title">命 途</div>
      <div class="progress-dots">
        <span v-for="i in 5" :key="i" :class="['dot', i <= state.fateIndex + 1 ? 'dot-done' : '']">○</span>
      </div>
    </div>

    <div class="fate-content" v-if="currentQuestion">
      <div class="q-number">第 {{ state.fateIndex + 1 }} 题</div>
      <div class="q-text">{{ currentQuestion.question }}</div>
      <div class="options">
        <button
          v-for="(opt, idx) in currentQuestion.options"
          :key="idx"
          class="option-btn"
          @click="answer(idx)"
        >
          <span class="opt-letter">{{ ['甲', '乙', '丙', '丁'][idx] }}</span>
          <span class="opt-text">{{ opt.text }}</span>
          <span class="opt-hint">{{ opt.hint }}</span>
        </button>
      </div>
    </div>

    <div class="fate-result" v-if="state.player">
      <div class="result-title">命途已定</div>
      <div class="result-attrs">
        <div v-for="(val, key) in state.player.attrs" :key="key" class="attr-row">
          <span class="attr-name">{{ key }}</span>
          <span class="attr-val">{{ val }}</span>
        </div>
      </div>
      <button class="btn btn-red btn-lg" @click="enterGame">踏入江湖</button>
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

const currentQuestion = computed(() => state.fateQuestions?.[state.fateIndex] || null)

function answer (idx) {
  game.answerFate(idx)
}

function enterGame () {
  router.push('/game/explore')
}
</script>

<style scoped>
.fate-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  min-height: 100vh;
  padding: 24px 16px;
}

.fate-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.fate-title {
  font-size: 28px;
  font-weight: 900;
  color: var(--red);
  letter-spacing: 0.3em;
  margin-bottom: 16px;
}

.progress-dots {
  display: flex;
  gap: 12px;
  font-size: 20px;
  color: var(--gray);
}
.dot-done { color: var(--red); }

.fate-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.q-number {
  font-size: 13px;
  color: var(--gray);
  letter-spacing: 0.2em;
  margin-bottom: 12px;
}

.q-text {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 36px;
}

.options {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  color: #1A1A1A;
  font-family: inherit;
  font-size: 15px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.option-btn:hover {
  border-color: var(--red);
  background: rgba(194,40,40,0.1);
}

.opt-letter {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--red);
  border-radius: 50%;
  color: var(--red);
  font-size: 13px;
  font-weight: 700;
}

.opt-text {
  flex: 1;
  font-size: 15px;
}

.opt-hint {
  font-size: 12px;
  color: var(--gray);
  flex-shrink: 0;
}

.fate-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--red);
  letter-spacing: 0.2em;
}

.result-attrs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 240px;
}

.attr-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 2px;
  font-size: 15px;
}

.attr-name { color: var(--gray); }
.attr-val { color: #1A1A1A; font-weight: 700; }
</style>

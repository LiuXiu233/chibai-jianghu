<template>
  <div class="login-view">
    <div class="login-title">管理员登录</div>
    <div class="login-hint">请输入管理员密码</div>
    <input
      v-model="password"
      type="password"
      class="input"
      placeholder="密码"
      @keyup.enter="login"
    />
    <button class="btn btn-red" @click="login">登录</button>
    <div class="error" v-if="error">{{ error }}</div>
    <button class="btn btn-ghost" @click="router.push('/game/location')">返回游戏</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const password = ref('')
const error = ref('')
const ADMIN_PASS = 'admin123'

function login () {
  if (password.value === ADMIN_PASS) {
    router.push('/admin')
  } else {
    error.value = '密码错误'
    password.value = ''
  }
}
</script>

<style scoped>
.login-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  gap: 16px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--red);
}

.login-hint {
  font-size: 14px;
  color: var(--gray);
}

.error {
  color: var(--red);
  font-size: 13px;
}
</style>

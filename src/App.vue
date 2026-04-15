<template>
  <div id="app-root">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGame } from './composables/useGame'

const game = useGame()
onMounted(() => {
  game.init()
})
</script>

<style scoped>
#app-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

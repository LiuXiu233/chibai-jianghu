<template>
  <div class="game-view">
    <!-- 顶部状态栏 -->
    <StatusBar />

    <!-- 路由内容区 -->
    <div class="content-area">
      <router-view />
    </div>

    <!-- 底部导航 -->
    <BottomNav />
  </div>
</template>

<script setup>
import StatusBar from '../components/StatusBar.vue'
import BottomNav from '../components/BottomNav.vue'
</script>

<style scoped>
.game-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  overflow: hidden;
}

.content-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>

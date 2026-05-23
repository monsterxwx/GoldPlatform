<template>
  <div class="w-full h-full flex flex-col bg-[#f2f2f6]">
    <div class="flex-1 overflow-y-auto">
      <RouterView />
    </div>
    
    <!-- Bottom Tab Bar -->
    <nav class="bg-white border-t border-gray-200 px-6 py-2 pb-safe flex justify-around items-center">
      <router-link to="/" custom v-slot="{ navigate, isExactActive }">
        <div @click="navigate" :class="['flex flex-col items-center p-2 cursor-pointer transition-colors', isExactActive ? 'text-[#007aff]' : 'text-gray-400']">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="text-xs font-medium">我的持仓</span>
        </div>
      </router-link>
      <router-link to="/chat" custom v-slot="{ navigate, isExactActive }">
        <div @click="navigate" :class="['flex flex-col items-center p-2 cursor-pointer transition-colors', isExactActive ? 'text-[#007aff]' : 'text-gray-400']">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 mb-1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="text-xs font-medium">智能分析</span>
        </div>
      </router-link>
    </nav>
  </div>
</template>
<script setup>
import { RouterView } from 'vue-router'
</script>
<style>
* {
  box-sizing: border-box;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
}
a {
  text-decoration: none;
}
</style>

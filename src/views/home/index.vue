<template>
  <div class="min-h-screen bg-[#f2f2f6] pb-10 font-sans text-[#1c1c1e]">
    <!-- Header: Gold Price -->
    <header class=" pb-6 px-6 bg-white shadow-sm rounded-b-3xl">
      <div class="flex justify-between items-center mb-2">
        <h1 class="text-2xl font-bold tracking-tight">
          实时金价
        </h1>
        <button
          @click="handleRefresh"
          class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
        >
          <svg
            :class="['w-4 h-4 text-gray-600', isRefreshing ? 'animate-spin' : '']"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
        </button>
      </div>
      <div class="flex items-baseline">
        <span class="text-4xl font-extrabold text-[#ff3b30]" v-if="goldStore.currentPrice">
          {{ goldStore.currentPrice.toFixed(2) }}
        </span>
        <span class="text-4xl font-extrabold text-gray-300" v-else>--.--</span>
        <span class="ml-2 text-sm text-gray-500 font-medium">元/克</span>
      </div>
      <div class="mt-2 text-xs text-gray-400">
        最近更新: {{ lastUpdateTimeStr }}
      </div>
    </header>

    <!-- Main Content -->
    <main class="px-4 mt-6 space-y-4">
      <!-- Core Asset Card -->
      <section class="bg-white rounded-3xl p-6 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold">
            我的持仓
          </h2>
          <button @click="showInitModal = true" class="text-sm text-blue-500 font-medium active:opacity-70">
            初始配置
          </button>
        </div>

        <!-- Profit -->
        <div class="mb-6">
          <div class="text-sm text-gray-500 mb-1">
            总计收益 (历史+当前)
          </div>
          <div
            :class="[
              'text-3xl font-bold',
              goldStore.totalAccumulatedProfit >= 0 ? 'text-[#ff3b30]' : 'text-[#34c759]'
            ]"
          >
            {{ goldStore.totalAccumulatedProfit >= 0 ? '+' : '' }}{{ goldStore.totalAccumulatedProfit.toFixed(2) }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-[#f2f2f6] rounded-2xl p-4">
            <div class="text-xs text-gray-500 mb-1">
              当前持仓收益
            </div>
            <div
              :class="[
                'text-lg font-bold',
                goldStore.holdingProfit >= 0 ? 'text-[#ff3b30]' : 'text-[#34c759]'
              ]"
            >
              {{ goldStore.holdingProfit >= 0 ? '+' : '' }}{{ goldStore.holdingProfit.toFixed(2) }}
            </div>
          </div>
          <div class="bg-[#f2f2f6] rounded-2xl p-4">
            <div class="text-xs text-gray-500 mb-1">
              历史累计收益
            </div>
            <div
              :class="[
                'text-lg font-bold',
                goldStore.baseAccumulatedProfit >= 0 ? 'text-[#ff3b30]' : 'text-[#34c759]'
              ]"
            >
              {{ goldStore.baseAccumulatedProfit >= 0 ? '+' : '' }}{{ goldStore.baseAccumulatedProfit.toFixed(2) }}
            </div>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
          <div>
            <div class="text-xs text-gray-400 mb-1">
              持仓均价
            </div>
            <div class="text-sm font-semibold">
              {{ goldStore.averagePrice.toFixed(2) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">
              持仓克数
            </div>
            <div class="text-sm font-semibold">
              {{ goldStore.totalGrams.toFixed(2) }}
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-400 mb-1">
              持仓总额
            </div>
            <div class="text-sm font-semibold">
              {{ goldStore.totalAmount.toFixed(2) }}
            </div>
          </div>
        </div>
      </section>

      <!-- Key Indicators -->
      <section class="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 class="text-sm text-gray-500 mb-1">
            回本保本金价
          </h2>
          <div class="text-xl font-bold">
            {{ goldStore.breakEvenPrice > 0 ? goldStore.breakEvenPrice.toFixed(2) : '--' }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-gray-400 mb-1">
            距当前金价差额
          </div>
          <div class="text-sm font-semibold" v-if="goldStore.currentPrice && goldStore.breakEvenPrice">
            {{ (goldStore.currentPrice - goldStore.breakEvenPrice).toFixed(2) }}
          </div>
          <div class="text-sm font-semibold text-gray-300" v-else>
            --
          </div>
        </div>
      </section>

      <!-- Simulator / Add Position -->
      <section class="bg-white rounded-3xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold mb-4">
          交易计算与操作
        </h2>

        <!-- Segment Control -->
        <div class="flex bg-[#f2f2f6] rounded-xl p-1 mb-4">
          <button
            @click="tradeType = 'buy'"
            :class="['flex-1 py-2 text-sm font-medium rounded-lg transition-colors', tradeType === 'buy' ? 'bg-white shadow-sm text-black' : 'text-gray-500']"
          >
            买入(加仓)
          </button>
          <button
            @click="tradeType = 'sell'"
            :class="['flex-1 py-2 text-sm font-medium rounded-lg transition-colors', tradeType === 'sell' ? 'bg-white shadow-sm text-black' : 'text-gray-500']"
          >
            卖出(减仓)
          </button>
        </div>

        <div class="space-y-4">
          <div class="flex items-center bg-[#f2f2f6] rounded-xl px-4 py-3">
            <span class="text-gray-500 text-sm w-20">克数(g)</span>
            <input
              type="number"
              v-model="addForm.grams"
              class="bg-transparent flex-1 outline-none border-none ring-0 text-right font-medium text-lg w-full m-0 p-0"
              placeholder="0.00"
            >
          </div>
          <div class="flex items-center bg-[#f2f2f6] rounded-xl px-4 py-3">
            <span class="text-gray-500 text-sm w-20">单价(元)</span>
            <input
              type="number"
              v-model="addForm.price"
              class="bg-transparent flex-1 outline-none border-none ring-0 text-right font-medium text-lg w-full m-0 p-0"
              placeholder="0.00"
            >
          </div>
        </div>

        <div class="mt-4 p-4 bg-blue-50 rounded-2xl" v-if="tradeType === 'buy'">
          <div class="text-xs text-blue-600 mb-1">
            模拟加仓后均价将变为:
          </div>
          <div class="text-xl font-bold text-blue-600">
            {{ simulatedAveragePrice.toFixed(2) }}
          </div>
        </div>

        <div class="mt-4 p-4 bg-orange-50 rounded-2xl" v-if="tradeType === 'sell'">
          <div class="text-xs text-orange-600 mb-1">
            模拟减仓将实现收益:
          </div>
          <div class="text-xl font-bold text-orange-600">
            {{ simulatedRealizedProfit > 0 ? '+' : '' }}{{ simulatedRealizedProfit.toFixed(2) }}
          </div>
        </div>

        <button
          @click="handleAddTransaction"
          class="w-full mt-6 bg-[#007aff] text-white font-semibold py-3.5 rounded-xl shadow-sm shadow-blue-200 active:bg-blue-600 transition-colors disabled:opacity-50"
          :disabled="!isValidAdd"
        >
          确认{{ tradeType === 'buy' ? '加仓' : '减仓' }}
        </button>
      </section>
    </main>

    <!-- Init Setup Modal -->
    <div v-if="showInitModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 class="text-xl font-bold text-center mb-6">
          初始配置
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">初始持仓克数 (g)</label>
            <input type="number" v-model="initForm.grams" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0">
          </div>
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">初始持仓总金额 (元)</label>
            <input type="number" v-model="initForm.amount" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0">
          </div>
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">历史累计收益 (元)</label>
            <input type="number" v-model="initForm.accumulatedProfit" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0">
          </div>
        </div>
        <div class="mt-8 flex gap-3">
          <button @click="showInitModal = false" class="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl">
            取消
          </button>
          <button @click="handleSaveInit" class="flex-1 py-3.5 bg-[#007aff] text-white font-semibold rounded-xl shadow-sm">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGoldStore } from '@/store/modules/gold'

const goldStore = useGoldStore()

const isRefreshing = ref(false)
const showInitModal = ref(false)
const tradeType = ref<'buy' | 'sell'>('buy')

const initForm = ref({
  grams: goldStore.baseGrams,
  amount: goldStore.baseAmount,
  accumulatedProfit: goldStore.baseAccumulatedProfit
})

const addForm = ref({
  grams: '' as string | number,
  price: '' as string | number
})

const lastUpdateTimeStr = computed(() => {
  if (!goldStore.lastUpdateTime) return '--'
  const d = new Date(goldStore.lastUpdateTime)
  return d.toLocaleTimeString('zh-CN', { hour12: false })
})

const handleRefresh = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  await goldStore.refreshPrice()
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

const handleSaveInit = () => {
  goldStore.initBaseData(
    Number(initForm.value.grams) || 0,
    Number(initForm.value.amount) || 0,
    Number(initForm.value.accumulatedProfit) || 0
  )
  showInitModal.value = false
}

const isValidAdd = computed(() => {
  const g = Number(addForm.value.grams)
  const p = Number(addForm.value.price)
  if (g <= 0 || p <= 0) return false
  if (tradeType.value === 'sell' && g > goldStore.totalGrams) return false
  return true
})

const simulatedAveragePrice = computed(() => {
  const g = Number(addForm.value.grams) || 0
  const p = Number(addForm.value.price) || 0
  if (g === 0 || p === 0) return goldStore.averagePrice

  if (tradeType.value === 'buy') {
    const newTotalGrams = goldStore.totalGrams + g
    const newTotalAmount = goldStore.totalAmount + (g * p)
    return newTotalAmount / newTotalGrams
  }
  return goldStore.averagePrice
})

const simulatedRealizedProfit = computed(() => {
  const g = Number(addForm.value.grams) || 0
  const p = Number(addForm.value.price) || 0
  if (g === 0 || p === 0) return 0
  return (p - goldStore.averagePrice) * g
})

const handleAddTransaction = () => {
  if (!isValidAdd.value) return

  goldStore.addTransaction(
    tradeType.value,
    Number(addForm.value.grams),
    Number(addForm.value.price)
  )

  // reset form
  addForm.value.grams = ''
  addForm.value.price = ''
}

onMounted(() => {
  goldStore.startPolling()
})

onUnmounted(() => {
  goldStore.stopPolling()
})
</script>

<style scoped>
/* 隐藏 input type=number 的上下箭头 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}
input[type="number"] {
  appearance: textfield;
}
</style>

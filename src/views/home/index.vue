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
      <!-- Top Section (Assets / Add Position) -->
      <section class="bg-white rounded-3xl p-6 shadow-sm">
        <!-- Tabs Header -->
        <div class="flex bg-[#f2f2f6] rounded-xl p-1 mb-6">
          <button
            @click="topTab = 'assets'"
            :class="['flex-1 py-2.5 text-[15px] font-semibold rounded-lg transition-all duration-200', topTab === 'assets' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700']"
          >
            我的持仓
          </button>
          <button
            @click="topTab = 'add'"
            :class="['flex-1 py-2.5 text-[15px] font-semibold rounded-lg transition-all duration-200', topTab === 'add' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700']"
          >
            记录买入
          </button>
        </div>

        <!-- Assets View -->
        <div v-if="topTab === 'assets'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold">
              资产总览
            </h2>
            <button @click="openInitModal" class="text-sm text-blue-500 font-medium active:opacity-70">
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
                已实现收益(清仓)
              </div>
              <div
                :class="[
                  'text-lg font-bold',
                  goldStore.baseAccumulatedProfitState >= 0 ? 'text-[#ff3b30]' : 'text-[#34c759]'
                ]"
              >
                {{ goldStore.baseAccumulatedProfitState >= 0 ? '+' : '' }}{{ goldStore.baseAccumulatedProfitState.toFixed(2) }}
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
        </div>

        <!-- Add Position View -->
        <div v-if="topTab === 'add'">
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

          <div class="mt-4 p-4 bg-blue-50 rounded-2xl" v-if="simulatedAveragePrice !== goldStore.averagePrice">
            <div class="text-xs text-blue-600 mb-1">
              模拟加仓后均价将变为:
            </div>
            <div class="text-xl font-bold text-blue-600">
              {{ simulatedAveragePrice.toFixed(2) }}
            </div>
          </div>

          <button
            @click="handleAddTransaction"
            class="w-full mt-6 bg-[#007aff] text-white font-semibold py-3.5 rounded-xl shadow-sm shadow-blue-200 active:bg-blue-600 transition-colors disabled:opacity-50"
            :disabled="!isValidAdd"
          >
            确认买入
          </button>
        </div>
      </section>

      <!-- Key Indicators -->
      <section class="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between" v-if="topTab === 'assets'">
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
          <div class="text-sm font-semibold" v-if="goldStore.currentPrice && goldStore.breakEvenPrice > 0">
            {{ (goldStore.currentPrice - goldStore.breakEvenPrice).toFixed(2) }}
          </div>
          <div class="text-sm font-semibold text-gray-300" v-else>
            --
          </div>
        </div>
      </section>

      <!-- Records Tabs -->
      <section class="bg-white rounded-3xl p-6 shadow-sm" v-if="goldStore.activeLots.length > 0 || goldStore.sellHistory.length > 0">
        <!-- Tabs Header -->
        <div class="flex bg-[#f2f2f6] rounded-xl p-1 mb-6">
          <button
            @click="activeTab = 'active'"
            :class="['flex-1 py-2.5 text-[15px] font-semibold rounded-lg transition-all duration-200', activeTab === 'active' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700']"
          >
            当前持仓
          </button>
          <button
            @click="activeTab = 'history'"
            :class="['flex-1 py-2.5 text-[15px] font-semibold rounded-lg transition-all duration-200', activeTab === 'history' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700']"
          >
            历史清仓
          </button>
        </div>

        <!-- Active Lots List -->
        <div v-if="activeTab === 'active'">
          <div v-if="goldStore.activeLots.length > 0" class="space-y-3">
            <div v-for="lot in reversedActiveLots" :key="lot.id" class="bg-[#f2f2f6] rounded-2xl p-4 flex flex-col">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium">{{ lot.type === 'base' ? '初始配置' : '买入记录' }}</span>
                <span class="text-xs text-gray-400">{{ formatDate(lot.timestamp) }}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center mt-2">
                <div>
                  <div class="text-xs text-gray-400 mb-1">买入均价</div>
                  <div class="text-sm font-semibold">{{ lot.price.toFixed(2) }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-400 mb-1">克数</div>
                  <div class="text-sm font-semibold">{{ lot.remainGrams.toFixed(2) }}g</div>
                </div>
                <div>
                  <div class="text-xs text-gray-400 mb-1">剩余成本</div>
                  <div class="text-sm font-semibold">{{ (lot.remainGrams * lot.price).toFixed(2) }}</div>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <button @click="openSellModal(lot)" class="px-4 py-1.5 bg-orange-100 text-orange-600 font-medium text-sm rounded-lg active:bg-orange-200 transition-colors">
                  卖出 (减仓)
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-400 py-8 text-sm">
            暂无持仓批次
          </div>
        </div>

        <!-- History Records -->
        <div v-if="activeTab === 'history'">
          <div v-if="goldStore.sellHistory.length > 0" class="space-y-3">
            <div v-for="rec in reversedHistory" :key="rec.id" class="bg-[#f2f2f6] rounded-2xl p-4 flex flex-col">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium">清仓/卖出</span>
                <span class="text-xs text-gray-400">{{ formatDate(rec.timestamp) }}</span>
              </div>
              <div class="flex justify-between items-center mt-1">
                <div class="text-xs text-gray-500">
                  卖出 {{ rec.sellGrams.toFixed(2) }}g / {{ rec.sellPrice.toFixed(2) }} <br>
                  <span class="text-[10px] text-gray-400">(成本: {{ rec.buyPrice.toFixed(2) }})</span>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-gray-500 mb-0.5">当笔盈亏</div>
                  <div :class="['font-bold', rec.realizedProfit >= 0 ? 'text-[#ff3b30]' : 'text-[#34c759]']">
                    {{ rec.realizedProfit >= 0 ? '+' : '' }}{{ rec.realizedProfit.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-gray-400 py-8 text-sm">
            暂无历史清仓记录
          </div>
        </div>
      </section>
    </main>

    <!-- Init Setup Modal -->
    <div v-if="showInitModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 class="text-xl font-bold text-center mb-6">
          初始配置
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">初始持仓克数 (g)</label>
            <input type="number" v-model="initForm.grams" @input="onInitGramsChange" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0">
          </div>
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">初始持仓均价 (元)</label>
            <input type="number" v-model="initForm.price" @input="onInitPriceChange" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0">
          </div>
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">初始持仓总金额 (元)</label>
            <input type="number" v-model="initForm.amount" @input="onInitAmountChange" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0">
            <p class="text-[10px] text-gray-400 mt-1 pl-1">填入总金额和克数可自动计算均价</p>
          </div>
          <hr class="border-gray-100 my-4">
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">初始累计总收益 (含持仓盈亏)</label>
            <input type="number" v-model="initForm.accumulatedProfit" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0">
          </div>
        </div>
        <div class="mt-8 flex flex-col gap-3">
          <div class="flex gap-3">
            <button @click="showInitModal = false" class="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl">
              取消
            </button>
            <button @click="handleSaveInit" class="flex-1 py-3.5 bg-[#007aff] text-white font-semibold rounded-xl shadow-sm">
              保存
            </button>
          </div>
          <button @click="handleReset" class="w-full py-3.5 bg-red-50 text-red-500 font-semibold rounded-xl">
            重置并清空所有数据
          </button>
        </div>
      </div>
    </div>

    <!-- Sell Modal -->
    <div v-if="sellModal.show" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 class="text-xl font-bold text-center mb-6">
          卖出 / 减仓
        </h2>
        <div class="space-y-4">
          <div class="text-sm text-gray-500 text-center mb-4">
            该批次剩余: <span class="font-bold text-black">{{ sellModal.remainGrams }}g</span>，成本: <span class="font-bold text-black">{{ sellModal.buyPrice.toFixed(2) }}</span>
          </div>
          <div class="flex items-center bg-[#f2f2f6] rounded-xl px-4 py-3">
            <span class="text-gray-500 text-sm w-20">卖出(g)</span>
            <input
              type="number"
              v-model="sellModal.grams"
              class="bg-transparent flex-1 outline-none border-none ring-0 text-right font-medium text-lg w-full m-0 p-0"
              placeholder="0.00"
            >
          </div>
          <div class="flex items-center bg-[#f2f2f6] rounded-xl px-4 py-3">
            <span class="text-gray-500 text-sm w-20">卖出单价</span>
            <input
              type="number"
              v-model="sellModal.price"
              class="bg-transparent flex-1 outline-none border-none ring-0 text-right font-medium text-lg w-full m-0 p-0"
              placeholder="0.00"
            >
          </div>
        </div>

        <div class="mt-4 p-4 bg-orange-50 rounded-2xl text-center">
          <div class="text-xs text-orange-600 mb-1">
            本次卖出预计盈亏:
          </div>
          <div :class="['text-xl font-bold', simulatedRealizedProfit >= 0 ? 'text-orange-600' : 'text-green-600']">
            {{ simulatedRealizedProfit > 0 ? '+' : '' }}{{ simulatedRealizedProfit.toFixed(2) }}
          </div>
        </div>

        <div class="mt-8 flex gap-3">
          <button @click="sellModal.show = false" class="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl">
            取消
          </button>
          <button @click="handleConfirmSell" :disabled="!isValidSell" class="flex-1 py-3.5 bg-orange-500 text-white font-semibold rounded-xl shadow-sm disabled:opacity-50">
            确认卖出
          </button>
        </div>
      </div>
    </div>
    <!-- Reset Confirm Modal -->
    <ConfirmModal
      v-model="showResetConfirm"
      title="确认重置数据？"
      iconType="danger"
      confirmText="确认清空"
      @confirm="executeReset"
    >
      <template #content>
        此操作将清空所有的持仓和历史清仓记录，且<span class="text-red-500 font-medium">无法撤销</span>。
      </template>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGoldStore } from '@/store/modules/gold'
import ConfirmModal from '@/components/ConfirmModal.vue'

const goldStore = useGoldStore()

const isRefreshing = ref(false)
const showInitModal = ref(false)
const showResetConfirm = ref(false)
const activeTab = ref<'active' | 'history'>('active')
const topTab = ref<'assets' | 'add'>('assets')

const initForm = ref({
  grams: '',
  price: '',
  amount: '',
  accumulatedProfit: ''
})

const addForm = ref({
  grams: '' as string | number,
  price: '' as string | number
})

const sellModal = ref({
  show: false,
  lotId: '',
  remainGrams: 0,
  buyPrice: 0,
  grams: '',
  price: ''
})

const lastUpdateTimeStr = computed(() => {
  if (!goldStore.lastUpdateTime) return '--'
  const d = new Date(goldStore.lastUpdateTime)
  return d.toLocaleTimeString('zh-CN', { hour12: false })
})

const reversedHistory = computed(() => {
  return [...goldStore.sellHistory].reverse()
})

const reversedActiveLots = computed(() => {
  return [...goldStore.activeLots].reverse()
})

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp)
  return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const handleRefresh = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  await goldStore.refreshPrice()
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

// === 初始配置逻辑 ===

const openInitModal = () => {
  const baseLot = goldStore.activeLots.find(l => l.type === 'base')
  if (baseLot) {
    initForm.value.grams = baseLot.remainGrams.toString()
    initForm.value.price = baseLot.price.toString()
    initForm.value.amount = (baseLot.remainGrams * baseLot.price).toFixed(2)
  } else {
    initForm.value.grams = ''
    initForm.value.price = ''
    initForm.value.amount = ''
  }
  initForm.value.accumulatedProfit = goldStore.totalAccumulatedProfit.toFixed(2)
  showInitModal.value = true
}

const onInitGramsChange = () => {
  const g = Number(initForm.value.grams) || 0
  const p = Number(initForm.value.price) || 0
  if (g > 0 && p > 0) {
    initForm.value.amount = (g * p).toFixed(2)
  }
}
const onInitPriceChange = () => {
  const g = Number(initForm.value.grams) || 0
  const p = Number(initForm.value.price) || 0
  if (g > 0 && p > 0) {
    initForm.value.amount = (g * p).toFixed(2)
  }
}
const onInitAmountChange = () => {
  const g = Number(initForm.value.grams) || 0
  const a = Number(initForm.value.amount) || 0
  if (g > 0 && a > 0) {
    initForm.value.price = (a / g).toFixed(2)
  } else if (a > 0 && Number(initForm.value.price) > 0) {
    initForm.value.grams = (a / Number(initForm.value.price)).toFixed(4)
  }
}

const handleSaveInit = () => {
  const grams = Number(initForm.value.grams) || 0
  const amount = Number(initForm.value.amount) || 0
  const inputTotalProfit = Number(initForm.value.accumulatedProfit) || 0
  
  const currentHoldingProfit = (goldStore.currentPrice * grams) - amount
  const baseRealizedProfit = inputTotalProfit - currentHoldingProfit

  goldStore.initBaseData(
    grams,
    Number(initForm.value.price) || 0,
    amount,
    baseRealizedProfit
  )
  showInitModal.value = false
}

const handleReset = () => {
  showResetConfirm.value = true
}

const executeReset = () => {
  goldStore.resetData()
  showResetConfirm.value = false
  showInitModal.value = false
}

// === 买入(加仓)逻辑 ===

const isValidAdd = computed(() => {
  const g = Number(addForm.value.grams)
  const p = Number(addForm.value.price)
  return g > 0 && p > 0
})

const simulatedAveragePrice = computed(() => {
  const g = Number(addForm.value.grams) || 0
  const p = Number(addForm.value.price) || 0
  if (g === 0 || p === 0) return goldStore.averagePrice

  const newTotalGrams = goldStore.totalGrams + g
  const newTotalAmount = goldStore.totalAmount + (g * p)
  return newTotalAmount / newTotalGrams
})

const handleAddTransaction = () => {
  if (!isValidAdd.value) return
  goldStore.addTransaction(
    Number(addForm.value.grams),
    Number(addForm.value.price)
  )
  addForm.value.grams = ''
  addForm.value.price = ''
  topTab.value = 'assets' // Switch back to assets view after adding
}

// === 卖出(单批次)逻辑 ===

const openSellModal = (lot: any) => {
  sellModal.value.lotId = lot.id
  sellModal.value.remainGrams = lot.remainGrams
  sellModal.value.buyPrice = lot.price
  sellModal.value.grams = lot.remainGrams.toString()
  sellModal.value.price = goldStore.currentPrice > 0 ? goldStore.currentPrice.toString() : ''
  sellModal.value.show = true
}

const isValidSell = computed(() => {
  const g = Number(sellModal.value.grams)
  const p = Number(sellModal.value.price)
  return g > 0 && g <= sellModal.value.remainGrams && p > 0
})

const simulatedRealizedProfit = computed(() => {
  if (!sellModal.value.show) return 0
  const g = Number(sellModal.value.grams) || 0
  const p = Number(sellModal.value.price) || 0
  if (g <= 0 || p <= 0) return 0
  return (p - sellModal.value.buyPrice) * g
})

const handleConfirmSell = () => {
  if (!isValidSell.value) return
  goldStore.sellLot(
    sellModal.value.lotId,
    Number(sellModal.value.grams),
    Number(sellModal.value.price)
  )
  sellModal.value.show = false
}

// === 生命周期 ===

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

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchLatestGoldPrice } from '@/api/gold';

export interface GoldTransaction {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell';
  grams: number;
  price: number;
  amount: number;
}

export const useGoldStore = defineStore('gold', () => {
  // === State ===
  const currentPrice = ref(0);
  const lastUpdateTime = ref(0);
  
  // 基础配置
  const baseGrams = ref(0);
  const baseAmount = ref(0);
  const baseAccumulatedProfit = ref(0);

  // 交易记录（仅用于加仓）
  const transactions = ref<GoldTransaction[]>([]);

  // === Getters ===
  
  const computedState = computed(() => {
    let currentGrams = baseGrams.value;
    let currentAmount = baseAmount.value;
    let accProfit = baseAccumulatedProfit.value;

    for (const tx of transactions.value) {
      if (tx.type === 'buy') {
        currentGrams += tx.grams;
        currentAmount += (tx.grams * tx.price);
      } else if (tx.type === 'sell') {
        const avgPrice = currentGrams > 0 ? currentAmount / currentGrams : 0;
        const cost = tx.grams * avgPrice;
        const realizedProfit = (tx.price - avgPrice) * tx.grams;
        
        currentGrams -= tx.grams;
        currentAmount -= cost;
        accProfit += realizedProfit;
        
        if (currentGrams <= 0) {
          currentGrams = 0;
          currentAmount = 0;
        }
      }
    }

    return {
      totalGrams: currentGrams,
      totalAmount: currentAmount,
      accumulatedProfit: accProfit,
      averagePrice: currentGrams > 0 ? currentAmount / currentGrams : 0
    };
  });

  const totalGrams = computed(() => computedState.value.totalGrams);
  const totalAmount = computed(() => computedState.value.totalAmount);
  const averagePrice = computed(() => computedState.value.averagePrice);
  const baseAccumulatedProfitState = computed(() => computedState.value.accumulatedProfit);

  // 4. 持仓收益 = (总克数 * 当前金价) - 总金额
  const holdingProfit = computed(() => {
    if (currentPrice.value === 0 || totalGrams.value === 0) return 0;
    return (totalGrams.value * currentPrice.value) - totalAmount.value;
  });

  // 5. 累计收益 = 历史基础累计收益 + 卖出已实现收益 + 持仓收益
  const totalAccumulatedProfit = computed(() => {
    return baseAccumulatedProfitState.value + holdingProfit.value;
  });

  // 6. 回本/保本金价 = (总金额 - (历史累计收益 + 已实现收益)) / 总克数
  const breakEvenPrice = computed(() => {
    if (totalGrams.value === 0) return 0;
    return (totalAmount.value - baseAccumulatedProfitState.value) / totalGrams.value;
  });

  // === Actions ===

  let pollingTimer: number | null = null;

  const refreshPrice = async () => {
    try {
      const price = await fetchLatestGoldPrice();
      currentPrice.value = price;
      lastUpdateTime.value = Date.now();
    } catch (error) {
      console.error('Failed to refresh gold price', error);
    }
  };

  const startPolling = () => {
    refreshPrice();
    if (pollingTimer === null) {
      pollingTimer = window.setInterval(refreshPrice, 30000);
    }
  };

  const stopPolling = () => {
    if (pollingTimer !== null) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  };

  // 初始化基础数据
  const initBaseData = (grams: number, amount: number, accumulatedProfit: number) => {
    baseGrams.value = grams;
    baseAmount.value = amount;
    baseAccumulatedProfit.value = accumulatedProfit;
  };

  // 添加交易记录
  const addTransaction = (type: 'buy' | 'sell', grams: number, price: number) => {
    const amount = grams * price;
    transactions.value.push({
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      grams,
      price,
      amount
    });
  };

  return {
    // state
    currentPrice,
    lastUpdateTime,
    baseGrams,
    baseAmount,
    baseAccumulatedProfit,
    baseAccumulatedProfitState,
    transactions,
    // getters
    totalGrams,
    totalAmount,
    averagePrice,
    holdingProfit,
    totalAccumulatedProfit,
    breakEvenPrice,
    // actions
    refreshPrice,
    startPolling,
    stopPolling,
    initBaseData,
    addTransaction
  };
}, {
  persist: true
});

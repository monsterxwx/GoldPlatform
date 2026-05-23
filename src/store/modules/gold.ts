import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fetchLatestGoldPrice } from '@/api/gold';

export interface GoldLot {
  id: string;
  timestamp: number;
  type: 'buy' | 'base';
  grams: number;       // original grams
  price: number;       // average price per gram
  amount: number;      // total cost
  remainGrams: number; // remaining grams
}

export interface SellRecord {
  id: string;
  timestamp: number;
  lotId: string;       // which lot was sold
  sellGrams: number;
  sellPrice: number;
  buyPrice: number;    // cost basis of that lot
  realizedProfit: number;
}

export const useGoldStore = defineStore('gold', () => {
  // === State ===
  const currentPrice = ref(0);
  const lastUpdateTime = ref(0);
  
  // 用户手动输入的额外历史利润（初始配置中录入）
  const baseAccumulatedProfit = ref(0); 
  
  // 所有的持仓批次
  const activeLots = ref<GoldLot[]>([]);
  // 所有的卖出历史
  const sellHistory = ref<SellRecord[]>([]);

  // === Getters ===
  
  // 当前总克数
  const totalGrams = computed(() => {
    return activeLots.value.reduce((sum, lot) => sum + lot.remainGrams, 0);
  });

  // 当前总金额(成本)
  const totalAmount = computed(() => {
    return activeLots.value.reduce((sum, lot) => sum + (lot.remainGrams * lot.price), 0);
  });

  // 当前持仓均价
  const averagePrice = computed(() => {
    return totalGrams.value > 0 ? totalAmount.value / totalGrams.value : 0;
  });

  // 历史清仓产生的总收益
  const totalRealizedProfitFromHistory = computed(() => {
    return sellHistory.value.reduce((sum, record) => sum + record.realizedProfit, 0);
  });

  // 基础历史收益 + 卖出总收益
  const baseAccumulatedProfitState = computed(() => {
    return baseAccumulatedProfit.value + totalRealizedProfitFromHistory.value;
  });

  // 持仓收益 = (总克数 * 当前金价) - 总金额
  const holdingProfit = computed(() => {
    if (currentPrice.value === 0 || totalGrams.value === 0) return 0;
    return (totalGrams.value * currentPrice.value) - totalAmount.value;
  });

  // 累计总收益 = 已实现的总历史收益 + 持仓收益
  const totalAccumulatedProfit = computed(() => {
    return baseAccumulatedProfitState.value + holdingProfit.value;
  });

  // 回本/保本金价 = (总金额 - 历史已实现收益) / 总克数
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
  const initBaseData = (grams: number, price: number, amount: number, accumulatedProfit: number) => {
    baseAccumulatedProfit.value = accumulatedProfit;
    
    const existingBaseIndex = activeLots.value.findIndex(lot => lot.type === 'base');
    if (grams > 0) {
      if (existingBaseIndex !== -1) {
        // 更新存在的 base lot
        activeLots.value[existingBaseIndex].grams = grams;
        activeLots.value[existingBaseIndex].remainGrams = grams;
        activeLots.value[existingBaseIndex].price = price;
        activeLots.value[existingBaseIndex].amount = amount;
      } else {
        // 新增 base lot
        activeLots.value.unshift({
          id: 'base_' + Date.now(),
          timestamp: Date.now(),
          type: 'base',
          grams,
          price,
          amount,
          remainGrams: grams
        });
      }
    } else {
      // 归零 base lot
      if (existingBaseIndex !== -1) {
        activeLots.value.splice(existingBaseIndex, 1);
      }
    }
  };

  // 彻底重置系统
  const resetData = () => {
    activeLots.value = [];
    sellHistory.value = [];
    baseAccumulatedProfit.value = 0;
    // 不重置 currentPrice 等
  };

  // 添加买入记录
  const addTransaction = (grams: number, price: number) => {
    activeLots.value.push({
      id: 'buy_' + Date.now(),
      timestamp: Date.now(),
      type: 'buy',
      grams,
      price,
      amount: grams * price,
      remainGrams: grams
    });
  };

  // 单批次卖出
  const sellLot = (lotId: string, sellGrams: number, sellPrice: number) => {
    const lotIndex = activeLots.value.findIndex(l => l.id === lotId);
    if (lotIndex === -1) return;

    const lot = activeLots.value[lotIndex];
    if (sellGrams <= 0 || sellGrams > lot.remainGrams) return;

    const realizedProfit = (sellPrice - lot.price) * sellGrams;

    // 添加到历史记录
    sellHistory.value.push({
      id: 'sell_' + Date.now(),
      timestamp: Date.now(),
      lotId: lot.id,
      sellGrams,
      sellPrice,
      buyPrice: lot.price,
      realizedProfit
    });

    // 扣减持仓
    lot.remainGrams -= sellGrams;
    
    // 如果完全清空，可以直接保留或者移除。为保持整洁这里直接移除
    if (lot.remainGrams <= 0) {
      activeLots.value.splice(lotIndex, 1);
    }
  };

  return {
    // state
    currentPrice,
    lastUpdateTime,
    baseAccumulatedProfit,
    activeLots,
    sellHistory,
    // getters
    totalGrams,
    totalAmount,
    averagePrice,
    holdingProfit,
    baseAccumulatedProfitState,
    totalAccumulatedProfit,
    breakEvenPrice,
    // actions
    refreshPrice,
    startPolling,
    stopPolling,
    initBaseData,
    resetData,
    addTransaction,
    sellLot
  };
}, {
  persist: true
});

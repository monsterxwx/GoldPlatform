<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity">
    <div class="bg-white rounded-3xl p-6 w-full max-w-[320px] shadow-2xl text-center transform transition-all">
      <div v-if="iconType === 'danger'" class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div v-else-if="iconType === 'warning'" class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div v-else class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 class="text-lg font-bold mb-2 text-gray-900">{{ title }}</h3>
      <div class="text-sm text-gray-500 mb-8 leading-relaxed">
        <slot name="content">{{ content }}</slot>
      </div>
      <div class="flex gap-3">
        <button @click="handleCancel" class="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl active:bg-gray-200 transition-colors">
          {{ cancelText }}
        </button>
        <button @click="handleConfirm" :class="[
          'flex-1 py-3.5 text-white font-semibold rounded-xl shadow-sm transition-colors',
          confirmBtnClass
        ]">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  iconType: {
    type: String, // 'danger', 'warning', 'info'
    default: 'danger'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirmBtnClass = computed(() => {
  if (props.iconType === 'danger') {
    return 'bg-red-500 shadow-red-200 active:bg-red-600'
  }
  if (props.iconType === 'warning') {
    return 'bg-orange-500 shadow-orange-200 active:bg-orange-600'
  }
  return 'bg-[#007aff] shadow-blue-200 active:bg-blue-600'
})

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

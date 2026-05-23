<template>
  <div class="h-full flex flex-col bg-[#f2f2f6] font-sans">
    <!-- Header -->
    <header class="pt-4 pb-3 px-4 bg-white/80 backdrop-blur-md border-b border-gray-100 shrink-0 flex justify-between items-center z-10 sticky top-0">
      <div class="text-lg font-semibold tracking-tight text-gray-800">智能分析</div>
      <div class="flex items-center space-x-1">
        <button @click="handleNewChat" class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 active:bg-gray-200 transition-colors" title="新开会话">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6"/><path d="M9 10h6"/></svg>
        </button>
        <button @click="showConfig = true" class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 active:bg-gray-200 transition-colors" title="配置">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
    </header>

    <!-- Config Modal -->
    <div v-if="showConfig" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <h2 class="text-xl font-bold text-center mb-6">模型配置</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">Base URL</label>
            <input type="text" v-model="configForm.url" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0 text-sm" placeholder="https://api.openai.com/v1" />
          </div>
          <div>
            <label class="block text-sm text-gray-500 mb-1 pl-1">API Key</label>
            <input type="password" v-model="configForm.key" class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0 text-sm" placeholder="sk-..." />
          </div>
          <div class="relative">
            <label class="block text-sm text-gray-500 mb-1 pl-1">Model</label>
            <div class="relative">
              <input 
                type="text" 
                v-model="configForm.model" 
                @mousedown="toggleModelList" 
                @blur="handleBlur"
                class="w-full bg-[#f2f2f6] rounded-xl px-4 py-3 outline-none border-none ring-0 text-sm focus:ring-2 focus:ring-[#007aff]/20 transition-all cursor-text" 
                placeholder="deepseek-v4-flash" 
              />
              <div class="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-400 cursor-pointer" @mousedown.prevent="showModelList = !showModelList">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', showModelList ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            
            <div 
              v-if="showModelList && chatStore.modelHistory.length > 0" 
              class="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 z-50 overflow-hidden py-1 max-h-48 overflow-y-auto"
            >
              <div 
                v-for="m in chatStore.modelHistory" 
                :key="m" 
                @mousedown.prevent="selectModel(m)" 
                class="px-4 py-3 text-sm text-gray-700 hover:bg-[#f2f2f6] cursor-pointer flex justify-between items-center transition-colors"
              >
                <span>{{ m }}</span>
                <button @mousedown.prevent.stop="removeModel(m)" class="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors" title="删除">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-8 flex gap-3">
          <button @click="showConfig = false" class="flex-1 py-3.5 bg-gray-100 text-gray-700 font-semibold rounded-xl">取消</button>
          <button @click="saveConfig" class="flex-1 py-3.5 bg-[#007aff] text-white font-semibold rounded-xl shadow-sm">保存</button>
        </div>
      </div>
    </div>

    <!-- Clear Confirm Modal -->
    <div v-if="showClearConfirm" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity">
      <div class="bg-white rounded-3xl p-6 w-full max-w-[300px] shadow-2xl flex flex-col items-center">
        <div class="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </div>
        <h2 class="text-lg font-bold text-gray-800 text-center mb-2">清空会话记录？</h2>
        <p class="text-sm text-gray-500 text-center mb-6 leading-relaxed">清空后将开启新一轮分析，当前所有聊天记录将丢失且不可恢复。</p>
        <div class="flex gap-3 w-full">
          <button @click="showClearConfirm = false" class="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-[15px] active:bg-gray-200 transition-colors">取消</button>
          <button @click="confirmClearChat" class="flex-1 py-3 bg-[#ff3b30] text-white font-semibold rounded-xl shadow-sm text-[15px] active:bg-red-600 transition-colors">清空</button>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <main class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatContainer">
      <div v-if="chatStore.messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-30"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        <p class="text-sm">在此输入问题，开始与大模型进行分析对话吧</p>
        <p class="text-xs mt-2 text-gray-300">请先确保右上角配置正确</p>
      </div>

      <div 
        v-for="msg in chatStore.messages" 
        :key="msg.id" 
        :class="['flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start']"
      >
        <!-- AI Avatar -->
        <div v-if="msg.role === 'assistant'" class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0 text-[#007aff]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>

        <div 
          :class="[
            'max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed break-words',
            msg.role === 'user' ? 'bg-[#007aff] text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
          ]"
        >
          <div v-if="msg.role === 'user'">{{ msg.content }}</div>
          <div v-else class="markdown-body text-[15px]" v-html="renderMarkdown(msg.content)"></div>
        </div>
      </div>

      <div v-if="isTyping" class="flex w-full justify-start">
        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0 text-[#007aff]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
        <div class="bg-white rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 flex items-center space-x-1">
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
          <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
        </div>
      </div>
    </main>

    <!-- Input Area -->
    <footer class="bg-white px-4 py-3 pb-safe shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-end bg-[#f2f2f6] rounded-2xl p-1 relative">
        <textarea 
          v-model="inputMsg" 
          rows="1"
          @keydown.enter.prevent="sendMessage"
          class="flex-1 bg-transparent px-3 py-2 outline-none border-none ring-0 resize-none max-h-32 text-[15px]"
          placeholder="问点什么..."
          ref="textareaRef"
          @input="adjustTextareaHeight"
        ></textarea>
        <button 
          @click="sendMessage"
          :disabled="!inputMsg.trim() || isTyping"
          class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-1 mr-1 transition-colors disabled:opacity-30"
          :class="inputMsg.trim() ? 'bg-[#007aff] text-white' : 'bg-gray-200 text-gray-400'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue';
import { useChatStore } from '@/store/modules/chat';
import { streamChatCompletion, type ChatMessageParam } from '@/api/chat';
import { marked } from 'marked';

const chatStore = useChatStore();

const showConfig = ref(false);
const showClearConfirm = ref(false);
const showModelList = ref(false);
const configForm = ref({
  url: chatStore.apiBaseUrl,
  key: chatStore.apiKey,
  model: chatStore.modelName
});

const inputMsg = ref('');
const isTyping = ref(false);
const chatContainer = ref<HTMLElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const adjustTextareaHeight = () => {
  const ta = textareaRef.value;
  if (!ta) return;
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
};

const renderMarkdown = (text: string) => {
  if (!text) return '';
  return marked.parse(text) as string;
};

const saveConfig = () => {
  if (configForm.value.model && !chatStore.modelHistory.includes(configForm.value.model)) {
    chatStore.modelHistory.unshift(configForm.value.model);
  }
  chatStore.setConfig(configForm.value.key, configForm.value.url, configForm.value.model);
  showConfig.value = false;
};

const toggleModelList = (e: MouseEvent) => {
  if (document.activeElement === e.target) {
    showModelList.value = !showModelList.value;
  } else {
    showModelList.value = true;
  }
};

const handleBlur = () => {
  setTimeout(() => {
    showModelList.value = false;
  }, 150);
};

const selectModel = (m: string) => {
  configForm.value.model = m;
  showModelList.value = false;
};

const removeModel = (m: string) => {
  chatStore.removeModel(m);
};

const handleNewChat = () => {
  if (chatStore.messages.length > 0) {
    showClearConfirm.value = true;
  }
};

const confirmClearChat = () => {
  chatStore.clearMessages();
  showClearConfirm.value = false;
};

const sendMessage = async () => {
  if (!inputMsg.value.trim() || isTyping.value) return;

  if (!chatStore.apiKey) {
    alert('请先配置 API Key');
    showConfig.value = true;
    return;
  }

  const userText = inputMsg.value.trim();
  inputMsg.value = '';
  adjustTextareaHeight();

  // Add user message
  chatStore.addMessage('user', userText);
  scrollToBottom();

  isTyping.value = true;

  // Prepare context
  const context: ChatMessageParam[] = chatStore.messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  let assistantMsgId = '';
  try {
    let currentResponse = '';
    await streamChatCompletion(
      context,
      chatStore.apiKey,
      chatStore.apiBaseUrl,
      chatStore.modelName,
      (chunk: string) => {
        if (!assistantMsgId) {
          isTyping.value = false; // stop typing indicator on first chunk
          assistantMsgId = chatStore.addMessage('assistant', '');
        }
        currentResponse += chunk;
        chatStore.updateMessageContent(assistantMsgId, currentResponse);
        scrollToBottom();
      }
    );
  } catch (error: any) {
    console.error('Chat error:', error);
    if (!assistantMsgId) {
      assistantMsgId = chatStore.addMessage('assistant', '');
    }
    chatStore.updateMessageContent(assistantMsgId, `[请求失败]: ${error.message}`);
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
};

watch(() => chatStore.messages, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  scrollToBottom();
  // Sync form if state changes
  configForm.value.url = chatStore.apiBaseUrl;
  configForm.value.key = chatStore.apiKey;
  configForm.value.model = chatStore.modelName;
});
</script>

<style>
.markdown-body p { margin-bottom: 0.5em; }
.markdown-body p:last-child { margin-bottom: 0; }
.markdown-body pre { background: #f6f8fa; padding: 12px; border-radius: 8px; overflow-x: auto; margin: 0.5em 0; }
.markdown-body code { background: #f6f8fa; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
.markdown-body ul { list-style-type: disc; padding-left: 20px; margin-bottom: 0.5em; }
.markdown-body ol { list-style-type: decimal; padding-left: 20px; margin-bottom: 0.5em; }
</style>

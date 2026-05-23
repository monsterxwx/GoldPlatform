import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export const useChatStore = defineStore('chat', () => {
  // === State ===
  const apiKey = ref('');
  const apiBaseUrl = ref('https://api.deepseek.com'); // default to openai compatible
  const modelName = ref('deepseek-v4-flash');
  const modelHistory = ref<string[]>(['deepseek-v4-flash', 'deepseek-v4-pro']);
  const messages = ref<ChatMessage[]>([]);

  // === Actions ===
  const setConfig = (key: string, url: string, model: string) => {
    apiKey.value = key;
    if (url) apiBaseUrl.value = url;
    if (model) {
      modelName.value = model;
      if (!modelHistory.value.includes(model)) {
        modelHistory.value.unshift(model);
      }
    }
  };

  const removeModel = (model: string) => {
    modelHistory.value = modelHistory.value.filter(m => m !== model);
  };

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(7);
    messages.value.push({
      id,
      role,
      content,
      timestamp: Date.now()
    });
    return id;
  };

  const updateMessageContent = (id: string, newContent: string) => {
    const msg = messages.value.find(m => m.id === id);
    if (msg) {
      msg.content = newContent;
    }
  };

  const clearMessages = () => {
    messages.value = [];
  };

  return {
    apiKey,
    apiBaseUrl,
    modelName,
    modelHistory,
    messages,
    setConfig,
    addMessage,
    updateMessageContent,
    clearMessages,
    removeModel
  };
}, {
  persist: true
});

<template>
<div class="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">RAGFlow 聊天演示</h1>
    
    <!-- Chat messages container -->
    <div class="bg-gray-100 border border-gray-300 rounded p-4 text-sm text-gray-800 h-96 overflow-auto mb-4">
      <div v-if="messages.length === 0" class="text-gray-500 italic">
        开始新的对话...
      </div>
      
      <div v-for="(message, index) in messages" :key="index" class="mb-3">
        <!-- User message -->
        <div v-if="message.role === 'user'" class="flex justify-end">
          <div class="bg-blue-600 text-white rounded-lg py-2 px-4 max-w-[80%]">
            {{ message.content }}
          </div>
        </div>
        
        <!-- Assistant message -->
        <div v-else class="flex justify-start">
          <div class="bg-gray-200 text-gray-800 rounded-lg py-2 px-4 max-w-[80%]">
            <div v-if="message.isStreaming" class="flex items-center">
              <div class="animate-pulse">正在输入</div>
              <div class="flex space-x-1 ml-2">
                <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
            </div>
            <div v-else class="whitespace-pre-wrap">{{ message.content }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Input area -->
    <div class="flex">
      <input 
        v-model="userInput" 
        @keyup.enter="sendMessage"
        type="text" 
        placeholder="输入您的问题..."
        class="flex-grow border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        @click="sendMessage"
        class="px-6 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition disabled:bg-blue-400"
        :disabled="isLoading || !userInput.trim()"
      >
        <span v-if="isLoading" class="inline-block animate-spin mr-1">⏳</span>
        <span v-else>发送</span>
      </button>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  isStreaming?: boolean;
}

const userInput = ref('');
const isLoading = ref(false);
const messages = reactive<Message[]>([]);

async function sendMessage() {
  if (!userInput.value.trim() || isLoading.value) return;
  
  // Add user message to chat
  const userMessage = {
    content: userInput.value,
    role: 'user' as const
  };
  messages.push(userMessage);
  
  // Clear input and set loading state
  const userQuestion = userInput.value;
  userInput.value = '';
  isLoading.value = true;
  
  // Add placeholder for assistant response
  const assistantMessageIndex = messages.length;
  messages.push({
    content: '',
    role: 'assistant',
    isStreaming: true
  });
  
  try {
    const response = await fetch('https://ragflow.operatornext.cn/v1/conversation/completion', {
      method: 'POST',
      headers: {
        'authorization': 'IjlmMTk4ZTk0NDlmMjExZjA4M2Q3MDI0MmMwYThkMDA2Ig.aE7UjA.mxB5nShI8Vg14xHoIEhjWXecrdw',
        'content-type': 'application/json',
        'accept': 'text/event-stream'
      },
      body: JSON.stringify({
        conversation_id: 'b41b5dbbe20b477c9f208cf1238dc51d',
        messages: [
          {
            content: '你好！ 我是你的助理，有什么可以帮到你的吗？',
            role: 'assistant'
          },
          {
            content: userQuestion,
            role: 'user',
            doc_ids: []
          }
        ]
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 留下不完整的一行

      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.slice(5).trim();
            const payload = JSON.parse(jsonStr);
            const current = payload.data?.answer;
            
            if (current) {
              // Update the assistant's message with the current response
              fullResponse = current;
              messages[assistantMessageIndex].content = fullResponse;
            }
          } catch (e) {
            console.warn('JSON 解析错误：', e);
          }
        }
      }
    }
    
    // Remove streaming status when done
    messages[assistantMessageIndex].isStreaming = false;
    
  } catch (error) {
    console.error('API 调用出错:', error);
    messages[assistantMessageIndex].content = '抱歉，发生了错误，请稍后再试。';
    messages[assistantMessageIndex].isStreaming = false;
  } finally {
    isLoading.value = false;
  }
}
</script>
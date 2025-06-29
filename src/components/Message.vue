<template>
  <div class="message-container">
    <div class="layout-container">
      <!-- 左侧会话列表 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <img src="../assets/tsoai-logo.png" alt="TSOai" class="logo-img" />
            <!-- <span class="logo-text">TSOai</span> -->
          </div>
          <el-button 
            class="new-chat-btn"
            @click="createNewConversation"
          >
            + 新建聊天
          </el-button>
        </div>
        
        <div class="conversation-list">
          <div 
            v-for="conv in conversations" 
            :key="conv.id" 
            class="conversation-item"
            :class="{ 'active': currentConversationId === conv.id }"
            @click="switchConversation(conv.id)"
          >
            <div class="conversation-title">{{ conv.title }}</div>
            <div class="conversation-time">{{ formatTime(conv.lastUpdateTime) }}</div>
            <el-button 
              class="delete-btn"
              @click.stop="deleteConversation(conv.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="sidebar-footer">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ username.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="username">{{ username }}</span>
          </div>
          <el-button 
            class="logout-btn"
            @click="handleLogout"
          >
            退出
          </el-button>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="main-content">
        <!-- 消息列表 -->
        <div class="message-list" ref="messageList">
          <!-- 空状态 -->
          <div v-if="messages.length === 0" class="empty-state">
            <img src="../assets/input_logo.png" alt="开始聊天" class="empty-icon" />
            <p class="empty-text">输入问题，开始你的搜索之旅</p>
          </div>

          <!-- 消息列表 -->
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            class="message-item"
            :class="[msg.type, msg.type === 'system' ? 'ai-message' : 'user-message']"
          >
            <div class="message-avatar">
              <el-avatar 
                :size="36" 
                :src="msg.type === 'system' ? '../assets/ai-avatar.png' : ''"
              >
                {{ msg.type === 'user' ? username.charAt(0).toUpperCase() : 'AI' }}
              </el-avatar>
            </div>

            <div class="message-content">
              <div class="message-info">
                <span class="sender-name">
                  {{ msg.type === 'user' ? username : '搜索助手' }}
                </span>
                <span class="message-time">{{ msg.time }}</span>
              </div>

              <!-- 用户消息 -->
              <div v-if="msg.type === 'user'" class="message-text">
                {{ msg.content }}
              </div>

              <!-- AI 回复 -->
              <div v-else class="ai-response">
                <!-- 修改搜索过程显示 -->
                <div class="search-process-wrapper">
                  <div v-if="msg.thinkingSteps?.length" class="search-process">
                    <div class="process-header" @click="toggleSearchProcess(msg.id)">
                      <div class="header-content">
                        <div class="process-icon">
                          <el-icon><Search /></el-icon>
                        </div>
                        <span class="process-title">搜索过程</span>
                        <el-icon :class="{ 'collapse-icon': true }">
                          <component :is="isSearchProcessCollapsed(msg.id) ? ArrowDown : ArrowUp" />
                        </el-icon>
                      </div>
                    </div>
                    
                    <div class="process-steps">
                      <div 
                        v-for="(step, stepIndex) in getVisibleSteps(msg.thinkingSteps, msg.id)"
                        :key="stepIndex"
                        class="process-step"
                        :class="{'completed': step.completed, 'active': step.completed && stepIndex === msg.thinkingSteps.length - 1, 'in-progress': !step.completed}"
                        :id="`step-${msg.id}-${stepIndex}`"
                      >
                        <div class="timeline">
                          <div class="timeline-line"></div>
                          <div class="step-indicator" :class="{'completed': step.completed, 'loading': !step.completed}">
                            <div v-if="!step.completed" class="step-loading-spinner"></div>
                            <el-icon v-else><Check /></el-icon>
                          </div>
                        </div>
                        <div class="step-content">
                          <div class="step-title">
                            {{ step.title }}
                            <span v-if="!step.completed" class="step-loading-text">处理中...</span>
                          </div>
                          <div v-if="step.description" class="step-desc">
                            {{ step.description }}
                          </div>
                          <div v-if="step.details" class="step-details">
                            <div v-html="getStepMarkdownContent(step)"></div>
                          </div>
                          <div v-if="step.results && step.results.length > 0" class="step-results">
                            <div class="step-results-header">搜索结果:</div>
                            <div v-for="(result, resultIndex) in step.results.slice(0, 3)" :key="resultIndex" class="step-result-item">
                              <a :href="result.link" target="_blank" rel="noopener noreferrer">{{ result.title }}</a>
                              <div class="step-result-snippet-wrapper">
                                <p class="step-result-snippet" :class="{ 'collapsed': !expandedSnippets[`${step.type}-${resultIndex}`] }">
                                  {{ result.snippet }}
                                  <button 
                                    v-if="shouldShowExpandButton(result.snippet)"
                                    class="expand-snippet-btn inline-btn" 
                                    @click.stop="toggleSnippet(`${step.type}-${resultIndex}`)"
                                  >
                                    {{ expandedSnippets[`${step.type}-${resultIndex}`] ? '[收起]' : '[展开]' }}
                                  </button>
                                </p>
                              </div>
                            </div>
                            <div v-if="step.results.length > 3" class="step-results-more">
                              +{{ step.results.length - 3 }} 更多结果...
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="isSearchProcessPartiallyCollapsed(msg.id) && msg.thinkingSteps.length > 2" class="collapsed-indicator">
                        <div class="collapsed-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <div class="collapsed-text" @click="toggleSearchProcess(msg.id)">点击展开更多步骤</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 搜索结果 -->
                <div v-if="false && msg.results?.length" class="search-results">
                  <div class="results-header">
                    <i class="el-icon-document"></i>
                    <span>搜索结果</span>
                  </div>
                  <div class="results-content">
                    <div v-for="(result, index) in msg.results" :key="index" class="result-item">
                      <h3 class="result-title">
                        <a :href="result.link" target="_blank" rel="noopener noreferrer">
                          {{ result.title }}
                        </a>
                      </h3>
                      <p class="result-snippet">{{ result.snippet }}</p>
                    </div>
                  </div>
                </div>

                <!-- 分析报告 -->
                <div v-if="msg.summary" class="analysis-report" :id="`report-${msg.id}`">
                  <div class="report-header" @click="(e) => toggleReport(msg.id, e)">
                    <div class="header-content">
                      <div class="report-icon">
                        <el-icon><Document /></el-icon>
                      </div>
                      <span class="report-title">搜索分析报告</span>
                      <el-icon :class="[isReportCollapsed(msg.id) ? 'collapse-icon' : 'collapse-icon']">
                        <component :is="isReportCollapsed(msg.id) ? ArrowDown : ArrowUp" />
                      </el-icon>
                    </div>
                  </div>
                  <div v-show="!isReportCollapsed(msg.id)" class="report-content markdown-body" v-html="getMarkdownContent(msg)"></div>
                  
                  <!-- 报告底部操作按钮 -->
                  <div class="report-footer" v-show="!isReportCollapsed(msg.id)">
                    <div class="report-decoration">
                      <el-icon><DocumentChecked /></el-icon>
                    </div>
                    <div class="report-tip">
                      AI分析报告已生成完毕
                    </div>
                    <div class="report-actions">
                      <button v-if="msg.documentId" class="action-btn download-btn" @click="downloadReport(msg.documentId)">
                        <el-icon><Download /></el-icon>
                        <span>下载报告</span>
                      </button>
                      <button class="action-btn copy-btn" @click="copyReportContent(msg.summary)">
                        <el-icon><DocumentCopy /></el-icon>
                        <span>复制内容</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 错误信息 -->
                <div v-if="msg.content && msg.content.includes('错误')" class="error-message">
                  {{ msg.content }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-selectors">
            <div class="model-selector" @click.stop="modelDropdownVisible = !modelDropdownVisible">
              <span class="selector-label">AI模型</span>
              <div class="selector-value">
                {{ selectedModel === 'gpt-4' ? 'GPT-4' : selectedModel }}
                <i class="dropdown-icon" :class="{ 'active': modelDropdownVisible }"></i>
              </div>
              
              <!-- 模型下拉菜单 -->
              <div v-if="modelDropdownVisible" class="dropdown-menu" @click.stop>
                <div 
                  v-for="model in availableModels" 
                  :key="model.id" 
                  class="dropdown-item"
                  :class="{ 'active': selectedModel === model.id }"
                  @click="selectModel(model.id)"
                >
                  {{ model.name }}
                </div>
              </div>
            </div>

            <div class="search-selector" @click.stop="searchEngineDropdownVisible = !searchEngineDropdownVisible">
              <span class="selector-label">搜索引擎</span>
              <div class="selector-value">
                {{ getSearchEngineName(selectedSearchEngine) }}
                <i class="dropdown-icon" :class="{ 'active': searchEngineDropdownVisible }"></i>
              </div>
              
              <!-- 搜索引擎下拉菜单 -->
              <div v-if="searchEngineDropdownVisible" class="dropdown-menu" @click.stop>
                <div 
                  class="dropdown-item" 
                  :class="{ 'active': selectedSearchEngine === 'tavily' }"
                  @click="selectSearchEngine('tavily')"
                >
                  Tavily AI搜索
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'active': selectedSearchEngine === 'default-search' }"
                  @click="selectSearchEngine('default-search')"
                >
                  默认搜索
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'active': selectedSearchEngine === 'google' }"
                  @click="selectSearchEngine('google')"
                >
                  Google
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'active': selectedSearchEngine === 'bing' }"
                  @click="selectSearchEngine('bing')"
                >
                  Bing
                </div>
              </div>
            </div>
          </div>
          
          <div class="input-box">
            <div class="textarea-container">
              <el-input
                v-model="messageInput"
                type="textarea"
                :rows="4"
                class="message-input"
                placeholder="请输入搜索关键词，开启智能旅程"
                resize="none"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.shift.enter.prevent="messageInput += '\n'"
              />
              <el-button 
                class="send-button"
                :disabled="!messageInput.trim()"
                @click="sendMessage"
              >
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { Marked } from 'marked'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import 'highlight.js/styles/github.css'
import 'github-markdown-css/github-markdown.css'
import { 
  Document, 
  DocumentChecked, 
  Download, 
  DocumentCopy,
  ArrowDown,
  ArrowUp,
  Search,
  Delete,
  Check,
  InfoFilled
} from '@element-plus/icons-vue'

interface Conversation {
  id: string
  title: string
  lastUpdateTime: string
  messages: Message[]
}

interface Message {
  id: string
  type: 'user' | 'system'
  content: string
  time: string
  loading: boolean
  thinkingSteps: {
    type: string
    title: string
    description: string
    details?: string
    results?: SearchResult[]
    completed: boolean
  }[]
  summary: string
  documentId: string | null
  intent?: string
  results?: SearchResult[]
}

interface ThinkingStep {
  type: string
  title: string
  description: string
  details?: string
  results?: SearchResult[]
  completed: boolean
}

interface AIModel {
  id: string
  name: string
}

interface SearchResult {
  title: string
  link: string
  snippet: string
}

// 路由
const router = useRouter()

// 状态
const username = ref(localStorage.getItem('username') || 'User')
const conversations: Ref<Conversation[]> = ref([])
const currentConversationId = ref('')
const messages: Ref<Message[]> = ref([])
const messageInput = ref('')
const selectedModel = ref('deepseek-v3-250324')
const selectedSearchEngine = ref('tavily')
const renderedMarkdown = ref<{ [key: string]: string }>({})
const modelDropdownVisible = ref(false)
const searchEngineDropdownVisible = ref(false)
const availableModels: Ref<AIModel[]> = ref([
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5' },
  { id: 'deepseek', name: 'DeepSeek V3' }
])

// 折叠相关状态
const collapsedSearchProcesses = ref<Record<string, boolean>>({})
const collapsedReports = ref<Record<string, boolean>>({})
const expandedSnippets = ref<Record<string, boolean>>({})

// 创建 marked 实例
const marked = new Marked({
  breaks: true,
  gfm: true,
})

// API请求
const fetchAvailableModels = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return
    
    const response = await axios.get('/api/models', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data && response.data.models) {
      availableModels.value = response.data.models
    }
    
    // // 使用模拟数据
    // availableModels.value = [
    //   { id: 'gpt-4', name: 'GPT-4' },
    //   { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    //   { id: 'claude-3', name: 'Claude 3' }
    // ]
  } catch (error) {
    console.error('获取AI模型列表失败:', error)
  }
}

// 选择模型
const selectModel = (modelId: string) => {
  selectedModel.value = modelId
  modelDropdownVisible.value = false
}

// 选择搜索引擎
const selectSearchEngine = (engineId: string) => {
  selectedSearchEngine.value = engineId
  searchEngineDropdownVisible.value = false
}

// 方法
const createNewConversation = () => {
  const newId = `conv-${Date.now()}`
  const newConversation: Conversation = {
    id: newId,
    title: `新聊天 ${new Date().toLocaleString()}`,
    lastUpdateTime: new Date().toISOString(),
    messages: []
  }
  
  conversations.value.push(newConversation)
  currentConversationId.value = newId
  messages.value = []
}

const switchConversation = (id: string) => {
  currentConversationId.value = id
  const conversation = conversations.value.find(c => c.id === id)
  if (conversation) {
    messages.value = conversation.messages
  }
}

const deleteConversation = (id: string) => {
  const index = conversations.value.findIndex(c => c.id === id)
  if (index > -1) {
    conversations.value.splice(index, 1)
    if (id === currentConversationId.value) {
      if (conversations.value.length > 0) {
        switchConversation(conversations.value[0].id)
      } else {
        createNewConversation()
      }
    }
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  // 创建用户消息
  const userMessage: Message = {
    id: `msg-${Date.now()}`,
    type: 'user' as const,
    content: messageInput.value,
    time: formatTime(new Date().toISOString()),
    loading: false,
    thinkingSteps: [],
    summary: '',
    documentId: null
  }
  
  messages.value.push(userMessage)
  
  // 创建系统响应消息
  const systemMessage = {
    id: `msg-${Date.now()}-system`,
    type: 'system' as const,
    content: '',
    time: formatTime(new Date().toISOString()),
    loading: true,
    thinkingSteps: [],
    summary: '',
    documentId: null,
    intent: '',
    results: [] as SearchResult[]
  }
  
  messages.value.push(systemMessage)
  messageInput.value = ''
  
  // 及时更新会话记录
  updateConversation()
  
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // 发送请求到后端
    const response = await fetch('/api/stream-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: userMessage.content,
        model: selectedModel.value,
        searchEngine: selectedSearchEngine.value
      })
    })

    if (!response.ok) {
      throw new Error('搜索请求失败')
    }

    // 处理流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            console.log('接收到的事件数据:', data)
            switch (data.eventType) {
              case 'thinking':
                if (data.step) {
                  // 更新或添加思考步骤
                  const stepIndex = systemMessage.thinkingSteps.findIndex(s => s.type === data.step.type)
                  let newStepAdded = false;
                  
                  if (stepIndex >= 0) {
                    systemMessage.thinkingSteps[stepIndex] = data.step
                  } else {
                    systemMessage.thinkingSteps.push(data.step)
                    newStepAdded = true;
                  }
                  
                  // 实时更新界面
                  messages.value = [...messages.value]
                  
                  // 如果包含搜索结果，也更新结果显示
                  if (data.step.results && data.step.results.length > 0) {
                    systemMessage.results = data.step.results
                  }
                  
                  // 等待DOM更新后滚动到当前步骤
                  setTimeout(() => {
                    const stepElements = document.querySelectorAll(`.process-step${newStepAdded ? ':last-child' : '.in-progress'}`)
                    if (stepElements.length > 0) {
                      const activeStep = newStepAdded ? stepElements[stepElements.length - 1] : stepElements[0]
                      activeStep.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                  }, 100)
                }
                break

              case 'result':
                if (data.results) {
                  // 更新搜索结果
                  systemMessage.results = data.results
                  console.log('更新搜索结果:', data.results)
                }
                if (data.intent) {
                  systemMessage.intent = data.intent
                }
                break

              case 'document':
                if (data.documentId) {
                  systemMessage.documentId = data.documentId
                }
                break

              case 'complete':
                systemMessage.loading = false
                if (data.summary) {
                  systemMessage.summary = data.summary
                  // 调用渲染函数
                  await renderMarkdown(data.summary, systemMessage.id)
                  // 报告生成后部分折叠搜索过程
                  collapsedSearchProcesses.value[systemMessage.id] = true
                  
                  // 等待 DOM 更新后滚动到报告位置
                  setTimeout(() => {
                    const reportElement = document.getElementById(`report-${systemMessage.id}`)
                    if (reportElement) {
                      reportElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }, 100)
                }
                if (data.documentId) {
                  systemMessage.documentId = data.documentId
                }
                
                // 通知 Vue 更新渲染
                messages.value = [...messages.value]
                break

              case 'error':
                systemMessage.loading = false
                systemMessage.content = `搜索过程中发生错误: ${data.error}`
                break
            }
          } catch (e) {
            console.error('解析响应数据失败:', e)
          }
        }
      }
    }

    // 确保所有数据都被处理
    if (buffer) {
      try {
        const data = JSON.parse(buffer.slice(6))
        if (data.eventType === 'complete') {
          systemMessage.loading = false
          if (data.summary) {
            systemMessage.summary = data.summary
            // 调用渲染函数
            await renderMarkdown(data.summary, systemMessage.id)
            // 报告生成后部分折叠搜索过程
            collapsedSearchProcesses.value[systemMessage.id] = true
            
            // 等待 DOM 更新后滚动到报告位置
            setTimeout(() => {
              const reportElement = document.getElementById(`report-${systemMessage.id}`)
              if (reportElement) {
                reportElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }, 100)
          }
          if (data.documentId) {
            systemMessage.documentId = data.documentId
          }
        }
      } catch (e) {
        console.error('解析最后的响应数据失败:', e)
      }
    }

    // 确保在捕获完所有数据后更新 loading 状态
    if (systemMessage.loading) {
      systemMessage.loading = false
    }

    // 通知 Vue 更新渲染
    messages.value = [...messages.value]

    // 处理完成后再次更新会话记录
    updateConversation()

  } catch (error) {
    console.error('发送消息失败:', error)
    systemMessage.loading = false
    systemMessage.content = '发送消息失败，请重试'
    
    // 即使出错也要更新会话
    updateConversation()
  }
}

// 修改渲染Markdown的函数，使用新的API
const renderMarkdown = async (text: string, key: string): Promise<void> => {
  if (!text) {
    renderedMarkdown.value[key] = '';
    return;
  }
  
  try {
    console.log('尝试渲染Markdown:', key.slice(0, 8));
    // 使用 marked.parse 异步渲染
    const rendered = await marked.parse(text);
    renderedMarkdown.value[key] = rendered;
  } catch (error) {
    console.error('Markdown解析错误:', error);
    // 如果解析失败，至少显示纯文本
    renderedMarkdown.value[key] = `<div style="white-space: pre-wrap;">${text}</div>`;
  }
};

// 添加下载报告方法
const downloadReport = async (documentId: string) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await fetch(`/api/documents/${documentId}?download=true`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('下载报告失败')
    }

    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = 'search-report.md'
    if (contentDisposition) {
      const matches = /filename="(.+)"/.exec(contentDisposition)
      if (matches && matches[1]) {
        filename = matches[1]
      }
    }

    // 下载文件
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('下载报告失败:', error)
    ElMessage.error('下载报告失败，请重试')
  }
}

// 添加获取搜索引擎名称的方法
const getSearchEngineName = (engineId: string): string => {
  switch(engineId) {
    case 'tavily':
      return 'Tavily AI搜索';
    case 'default-search':
      return '默认搜索';
    case 'google':
      return 'Google';
    case 'bing':
      return 'Bing';
    default:
      return engineId;
  }
}

// 添加会话更新函数
const updateConversation = () => {
  if (currentConversationId.value) {
    const conversation = conversations.value.find(c => c.id === currentConversationId.value)
    if (conversation) {
      conversation.messages = [...messages.value]
      conversation.lastUpdateTime = new Date().toISOString()
      
      // 如果是首条消息，更新会话标题
      if (conversation.title.startsWith('新聊天') && messages.value.length > 0) {
        const firstUserMsg = messages.value.find(m => m.type === 'user')
        if (firstUserMsg) {
          conversation.title = firstUserMsg.content.substring(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '')
        }
      }
      
      // 保存到本地存储
      saveConversations()
    }
  }
}

// 添加保存和加载会话的函数
const saveConversations = () => {
  try {
    localStorage.setItem('conversations', JSON.stringify(conversations.value))
  } catch (e) {
    console.error('保存会话失败:', e)
  }
}

const loadConversations = () => {
  try {
    const savedConversations = localStorage.getItem('conversations')
    if (savedConversations) {
      conversations.value = JSON.parse(savedConversations)
    }
  } catch (e) {
    console.error('加载会话失败:', e)
  }
}

// 计算已完成的步骤数量
const computeCompletedSteps = (steps: ThinkingStep[]) => {
  if (!steps || steps.length === 0) return '0/0';
  const completed = steps.filter(step => step.completed).length;
  return `${completed}/${steps.length}`;
}

// 修改折叠逻辑
const isSearchProcessCollapsed = (msgId: string) => {
  return collapsedSearchProcesses.value[msgId] === true;
}

const isSearchProcessPartiallyCollapsed = (msgId: string) => {
  return collapsedSearchProcesses.value[msgId] === true;
}

const toggleSearchProcess = (msgId: string) => {
  collapsedSearchProcesses.value[msgId] = !collapsedSearchProcesses.value[msgId];
  
  // 展开时，滚动到最新的步骤
  if (!collapsedSearchProcesses.value[msgId]) {
    scrollToLatestStep(msgId);
  }
}

// 获取可见的步骤
const getVisibleSteps = (steps: ThinkingStep[], msgId: string) => {
  if (!steps) return [];
  if (!isSearchProcessCollapsed(msgId)) {
    return steps;
  }
  // 当折叠时，只显示前两个步骤
  return steps.slice(0, 2);
}

// 添加滚动到最新步骤的辅助函数
const scrollToLatestStep = (messageId: string) => {
  setTimeout(() => {
    const message = messages.value.find(m => m.id === messageId);
    if (!message || !message.thinkingSteps || message.thinkingSteps.length === 0) return;
    
    // 查找进行中的步骤
    const inProgressIndex = message.thinkingSteps.findIndex(step => !step.completed);
    
    if (inProgressIndex >= 0) {
      // 如果有进行中的步骤，滚动到该步骤
      const inProgressStep = document.querySelector(`#step-${messageId}-${inProgressIndex}`);
      if (inProgressStep) {
        inProgressStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // 如果所有步骤都已完成，滚动到最后一个步骤
      const lastStepIndex = message.thinkingSteps.length - 1;
      const lastStep = document.querySelector(`#step-${messageId}-${lastStepIndex}`);
      if (lastStep) {
        lastStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, 100);
}

// 添加报告折叠功能
const isReportCollapsed = (msgId: string) => {
  return collapsedReports.value[msgId] === true
}

const toggleReport = (msgId: string, e?: Event) => {
  // 如果报告点击的是下载按钮，不触发折叠
  if (e && (e.target as HTMLElement).closest('.download-btn')) {
    return
  }
  collapsedReports.value[msgId] = !collapsedReports.value[msgId]
}

// 复制报告内容
const copyReportContent = (content: string) => {
  if (!content) return;
  
  navigator.clipboard.writeText(content)
    .then(() => {
      ElMessage.success('报告内容已复制到剪贴板');
    })
    .catch((err) => {
      console.error('复制失败:', err);
      // 尝试备用复制方法
      try {
        const tempElement = document.createElement('textarea');
        tempElement.value = content;
        document.body.appendChild(tempElement);
        tempElement.select();
        document.execCommand('copy');
        document.body.removeChild(tempElement);
        ElMessage.success('报告内容已复制到剪贴板');
      } catch (fallbackError) {
        console.error('备用复制方法也失败:', fallbackError);
        ElMessage.error('复制失败，请手动选择内容并复制');
      }
    });
};

// 获取预处理后的Markdown内容
const getMarkdownContent = (msg: Message): string => {
  // 如果已经渲染，返回渲染结果
  if (renderedMarkdown.value[msg.id]) {
    return renderedMarkdown.value[msg.id];
  }
  
  // 如果尚未渲染，但有内容，则触发渲染
  if (msg.summary && !renderedMarkdown.value[msg.id]) {
    // 立即返回带有样式的原始内容，以防渲染尚未完成
    const safeContent = msg.summary
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    
    // 异步触发渲染
    renderMarkdown(msg.summary, msg.id);
    
    // 返回带有样式的文本
    return `<div style="white-space: pre-wrap;">${safeContent}</div>`;
  }
  
  return '';
};

// 预渲染所有报告内容
const preRenderAllReports = () => {
  messages.value.forEach(msg => {
    if (msg.type === 'system' && msg.summary && !renderedMarkdown.value[msg.id]) {
      renderMarkdown(msg.summary, msg.id);
    }
  });
};

// 获取步骤详情的Markdown内容
const getStepMarkdownContent = (step: ThinkingStep): string => {
  if (!step || !step.details) return '';
  
  // 为每个步骤生成一个稳定的唯一键
  const stepKey = `step-${step.type}-${step.title ? step.title.slice(0, 10) : ''}`;
  
  // 如果已经渲染过，直接返回缓存的结果
  if (renderedMarkdown.value[stepKey]) {
    return renderedMarkdown.value[stepKey];
  }
  
  // 否则触发异步渲染
  renderStepMarkdown(step, stepKey);
  
  // 同时返回简单格式化的内容用于立即显示
  const safeContent = step.details
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
  
  return `<div style="white-space: pre-wrap;">${safeContent}</div>`;
};

// 渲染步骤详情的Markdown
const renderStepMarkdown = async (step: ThinkingStep, key: string): Promise<void> => {
  if (!step.details) return;
  
  try {
    console.log('渲染步骤Markdown:', step.type);
    // 使用 marked.parse 异步渲染
    const rendered = await marked.parse(step.details);
    renderedMarkdown.value[key] = rendered;
    // 强制更新视图
    messages.value = [...messages.value];
  } catch (error) {
    console.error('步骤Markdown解析错误:', error);
    renderedMarkdown.value[key] = `<div style="white-space: pre-wrap;">${step.details}</div>`;
  }
};

// 检查是否应该显示展开按钮
const shouldShowExpandButton = (snippet: string): boolean => {
  if (!snippet) return false;
  // 检查文本行数是否超过3行
  return snippet.split('\n').length > 3 || snippet.length > 200;
}

// 切换片段的展开/收起状态
const toggleSnippet = (snippetId: string): void => {
  expandedSnippets.value[snippetId] = !expandedSnippets.value[snippetId];
}

// 生命周期钩子
onMounted(() => {
  // 加载保存的会话
  loadConversations()
  
  // 确保创建新会话
  if (conversations.value.length === 0) {
    createNewConversation()
  }
  
  // 加载模型数据
  fetchAvailableModels()
  
  // 点击外部关闭下拉菜单
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.model-selector') && !target.closest('.search-selector')) {
      modelDropdownVisible.value = false
      searchEngineDropdownVisible.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  // 组件卸载时移除事件监听
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
  
  // 预渲染所有报告
  preRenderAllReports();
})
</script>

<style scoped>
.message-container {
  height: 100vh;
  background: #f5f7fa;
}

.layout-container {
  display: flex;
  height: 100%;
}

/* 侧边栏样式 */
.sidebar {
  width: 260px;
  background: #F7FBFE;
  border-right: 1px solid #e6e8eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e6e8eb;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.logo-img {
  width: 190px;
  height: 32px;
}

.logo-text {
  margin-left: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.new-chat-btn {
  width: 100%;
  height: 36px;
  border-radius: 8px;
  background: #f2f3f5;
  color: #1a1a1a;
  border: none;
}

.new-chat-btn:hover {
  background: #e6e8eb;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  margin-bottom: 4px;
}

.conversation-item:hover {
  background: #f2f3f5;
}

.conversation-item.active {
  background: #e6e8eb;
}

.conversation-title {
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.conversation-time {
  font-size: 12px;
  color: #999;
}

.delete-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  border: none;
  background: transparent;
  opacity: 0;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e6e8eb;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #1a1a1a;
}

.logout-btn {
  width: 100%;
  height: 36px;
  border-radius: 8px;
  background: #f2f3f5;
  color: #1a1a1a;
  border: none;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.message-item {
  display: flex;
  margin-bottom: 24px;
  width: 100%;
}

.user-message {
  justify-content: flex-start;
}

.ai-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  border-radius: 12px;
}

.user-message .message-content {
  margin-right: auto;
}

.ai-message .message-content {
  margin-left: 0;
}

.message-text {
  padding: 12px 16px;
  background: #f2f3f5;
  border-radius: 12px;
  font-size: 14px;
  color: #1a1a1a;
}

.ai-message .ai-response {
  background: #e6f4ff;
  border-radius: 12px;
  padding: 12px 16px;
}

.message-avatar {
  margin-right: 12px;
}

.message-info {
  margin-bottom: 4px;
}

.sender-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.message-time {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}

.loading-state {
  display: flex;
  align-items: center;
  color: #999;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  margin: 0 2px;
  background: #999;
  border-radius: 50%;
  display: inline-block;
  animation: loading 1s infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loading {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* 搜索过程样式优化 */
.search-process-wrapper {
  margin: 16px 0;
}

.search-process {
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.process-header {
  padding: 10px 16px;
  background: #f7f9fc;
  border-bottom: 1px solid #e6e8eb;
  cursor: pointer;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
}

.process-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  font-size: 16px;
  margin-right: 12px;
}

.process-icon .el-icon {
  font-size: 16px;
}

.process-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.process-progress {
  margin-left: auto;
  margin-right: 12px;
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
}

.collapse-icon {
  margin-left: 8px;
  font-size: 16px;
  color: #999;
  transition: transform 0.3s;
}

.process-step-count {
  display: none; /* 隐藏原来的步骤计数 */
}

.process-steps {
  padding: 8px 16px;
}

.timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  margin-right: 8px;
}

.timeline-line {
  position: absolute;
  top: 20px;
  bottom: -20px;
  width: 2px;
  background: #e6e8eb;
  z-index: 1;
}

.process-step:last-child .timeline-line {
  display: none;
}

.step-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e6e8eb;
  background: #fff;
  position: relative;
  z-index: 2;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-indicator .el-icon {
  font-size: 14px;
  color: white;
}

.process-step {
  display: flex;
  margin-bottom: 20px;
  position: relative;
}

.process-step:last-child {
  margin-bottom: 0;
}

.process-step.completed .step-title {
  color: #000;
}

.process-step.active .step-title {
  color: #1a73e8;
  font-weight: bold;
}

.step-content {
  flex: 1;
  padding-bottom: 8px;
}

.step-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #666;
}

.step-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.step-details {
  margin-top: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  border-left: 3px solid #e6e8eb;
}

.step-details :deep(p) {
  margin-bottom: 10px;
}

.step-details :deep(ul), 
.step-details :deep(ol) {
  padding-left: 20px;
  margin-bottom: 10px;
}

.step-details :deep(li) {
  margin-bottom: 5px;
}

.step-details :deep(h1), 
.step-details :deep(h2), 
.step-details :deep(h3), 
.step-details :deep(h4), 
.step-details :deep(h5) {
  margin-top: 16px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
}

.step-details :deep(code) {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.step-details :deep(pre) {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  margin-bottom: 10px;
}

.step-details :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 10px;
  color: #666;
  margin: 10px 0;
}

.step-results {
  margin-top: 8px;
  padding: 8px;
  background: #f0f7ff;
  border-radius: 4px;
}

.search-results {
  margin: 16px 0;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  overflow: hidden;
}

.results-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e6e8eb;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-content {
  padding: 16px;
}

.results-content :deep(h3) {
  margin: 16px 0 8px;
  font-size: 16px;
  color: #1a1a1a;
}

.results-content :deep(p) {
  margin: 8px 0;
  color: #666;
  line-height: 1.6;
}

.results-content :deep(a) {
  color: #1a73e8;
  text-decoration: none;
}

.results-content :deep(a:hover) {
  text-decoration: underline;
}

.download-btn {
  margin-left: auto;
  font-size: 12px;
  padding: 4px 12px;
  height: 28px;
  background: #6366f1;
  border-color: #6366f1;
}

.download-btn:hover {
  background: #5253cc;
  border-color: #5253cc;
}

.analysis-report {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.report-header {
  padding: 14px 20px;
  background: #fff;
  border-bottom: 1px solid #eaeaea;
  position: relative;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.report-content {
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background: #fff;
}

.report-content :deep(h1) {
  font-size: 1.6em;
  margin-top: 0.8em;
  margin-bottom: 0.5em;
}

.report-content :deep(h2) {
  font-size: 1.4em;
  margin-top: 0.7em;
  margin-bottom: 0.5em;
}

.report-content :deep(h3) {
  font-size: 1.2em;
  margin-top: 0.6em;
  margin-bottom: 0.4em;
}

.report-content :deep(p) {
  margin-bottom: 12px;
}

.report-content :deep(ul), 
.report-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}

.report-content :deep(blockquote) {
  padding: 0 16px;
  color: #666;
  border-left: 4px solid #ddd;
  margin-bottom: 12px;
}

.report-content :deep(code) {
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.report-content :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
  margin-bottom: 12px;
}

.report-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 14px;
  background-color: #fff !important;
  color: #333 !important;
  border: 1px solid #e0e0e0;
}

.report-content :deep(th) {
  background-color: #f5f7fa !important;
  color: #333 !important;
  font-weight: 600;
  padding: 12px;
  text-align: left;
  border: 1px solid #e0e0e0;
}

.report-content :deep(td) {
  padding: 12px;
  border: 1px solid #e0e0e0;
  background-color: #fff !important;
  color: #333 !important;
}

.report-content :deep(tr:nth-child(even)) {
  background-color: #fafafa !important;
}

.report-content :deep(tr:hover) {
  background-color: #f0f2ff !important;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #eaeaea;
  background: #f8f9fc;
  position: relative;
}

.report-decoration {
  width: 36px;
  height: 36px;
  background: #eef2ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-right: 12px;
}

.report-decoration .el-icon {
  font-size: 20px;
}

.report-tip {
  font-size: 14px;
  color: #666;
  flex: 1;
}

.report-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.action-btn {
  padding: 8px 16px;
  height: 40px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.download-btn {
  background: #4f46e5;
  color: white;
}

.download-btn:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.download-btn i {
  font-size: 18px;
}

.copy-btn {
  background: #2d3748;
  color: white;
}

.copy-btn:hover {
  background: #1a202c;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.copy-btn i {
  font-size: 18px;
}

.input-area {
  padding: 16px 200px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.input-selectors {
  display: flex;
  align-items: center;
  gap: 24px;
}

.model-selector, .search-selector {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 24px;
  padding: 6px 12px;
  background-color: #f7f8fa;
  border-radius: 6px;
  transition: background-color 0.3s;
  position: relative;
  min-width: 120px;
  z-index: 10;
}

.model-selector:hover, .search-selector:hover {
  background-color: #edf0f5;
}

.selector-label {
  color: #909399;
  font-size: 14px;
  margin-right: 8px;
}

.selector-value {
  color: #1a1a1a;
  font-size: 14px;
  display: flex;
  align-items: center;
  font-weight: 500;
  flex: 1;
}

.dropdown-icon {
  width: 0;
  height: 0;
  margin-left: 6px;
  border-style: solid;
  border-width: 5px 5px 0 5px;
  border-color: #909399 transparent transparent transparent;
  transition: transform 0.3s;
}

.dropdown-icon.active {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  min-width: 120px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 20;
  border: 1px solid #eaecef;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  margin: 2px 0;
}

.dropdown-item:hover {
  background-color: #f2f3f5;
}

.dropdown-item.active {
  background-color: #e6f4ff;
  color: #1a73e8;
  font-weight: 500;
}

.input-box {
  display: flex;
  width: 100%;
}

.textarea-container {
  position: relative;
  width: 100%;
  max-width: 90%;
  margin: 0 auto 0 0;
}

.message-input {
  width: 100%;
}

.message-input :deep(.el-textarea__inner) {
  width: 100%;
  height: 104px !important;
  min-height: 104px !important;
  max-height: 104px !important;
  padding: 8px 60px 8px 8px;
  border-radius: 8px;
  border-color: #e6e8eb;
  background-color: #f7f8fa;
  font-size: 15px;
  resize: none;
  transition: all 0.3s;
  line-height: 1.6;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-input :deep(.el-textarea__inner:focus) {
  border-color: #b6c6fa;
  background-color: #fafbfd;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.03), 0 0 0 2px rgba(182, 198, 250, 0.2);
}

.send-button {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 50px;
  height: 28px;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: #b6c6fa;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border: none;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button:hover:not(:disabled) {
  background-color: #95a4fc;
}

.send-button:disabled {
  background-color: #d9e0f6;
  color: #b0b0b0;
  cursor: not-allowed;
}

.result-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e8eb;
}

.result-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.result-title {
  margin: 0 0 8px;
  font-size: 16px;
  line-height: 1.4;
}

.result-title a {
  color: #1a73e8;
  text-decoration: none;
}

.result-title a:hover {
  text-decoration: underline;
}

.result-snippet {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.error-message {
  color: #f56c6c;
  padding: 12px;
  background: #fef0f0;
  border-radius: 4px;
  margin-top: 12px;
}

.step-results-header {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 5px;
}

.step-result-item {
  margin: 3px 0;
  font-size: 12px;
}

.step-result-item a {
  color: #1a73e8;
  text-decoration: none;
}

.step-result-item a:hover {
  text-decoration: underline;
}

.step-results-more {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}

.collapsed-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0;
  color: #666;
  cursor: pointer;
}

.collapsed-dots {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.collapsed-dots span {
  width: 4px;
  height: 4px;
  background: #999;
  border-radius: 50%;
  margin: 0 2px;
}

.collapsed-text {
  font-size: 12px;
  color: #1a73e8;
}

.step-indicator.loading {
  position: relative;
  border-color: #1a73e8;
  background-color: white;
}

.step-loading-spinner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #1a73e8;
  border-right-color: #1a73e8;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.process-step.in-progress .step-title {
  color: #1a73e8;
}

.step-loading-text {
  font-size: 12px;
  color: #1a73e8;
  margin-left: 8px;
  font-weight: normal;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 确保 markdown-body 不会覆盖我们自定义的表格样式 */
.markdown-body {
  color: #333 !important;
  font-size: 15px !important;
  line-height: 1.6 !important;
  background-color: transparent !important;
}

/* 修复可能的深色模式问题 */
.report-content.markdown-body {
  --color-canvas-default: #fff !important;
  --color-canvas-subtle: #f5f7fa !important;
  --color-border-default: #eaeaea !important;
  --color-fg-default: #333 !important;
  --color-fg-muted: #666 !important;
  --color-fg-subtle: #999 !important;
}

.report-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  margin-right: 12px;
}

.report-icon .el-icon {
  font-size: 16px;
}

.step-result-snippet-wrapper {
  position: relative;
  margin-top: 5px;
  overflow: hidden;
}

.step-result-snippet {
  margin: 0;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  position: relative;
}

.step-result-snippet.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expand-snippet-btn {
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.expand-snippet-btn.inline-btn {
  display: inline;
  margin-left: 4px;
  padding: 0;
  background: transparent;
  font-size: 13px;
  color: #1a73e8;
  font-weight: 500;
  line-height: inherit;
}

.expand-snippet-btn.inline-btn:hover {
  text-decoration: underline;
  background: transparent;
  opacity: 0.8;
}

.step-indicator.completed {
  background: #52c41a;
  border-color: #52c41a;
}

.action-btn .el-icon {
  font-size: 18px;
}

</style>

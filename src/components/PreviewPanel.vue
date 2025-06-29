<template>
  <div class="preview-sidebar" :class="{ 'preview-active': isActive }">
    <div class="preview-header">
      <h3>预览面板</h3>
      <el-button 
        type="text" 
        @click="closePreview"
        class="close-preview-btn"
      >
        <i class="el-icon-close"></i>
      </el-button>
    </div>
    <div class="preview-content">
      <!-- 链接预览 -->
      <div v-if="type === 'link' && url" class="link-preview">
        <div class="preview-loading" v-if="loading">
          <div class="cyber-spinner">
            <div class="spinner-inner"></div>
          </div>
          <span>加载中...</span>
        </div>
        <iframe v-else :src="url" frameborder="0" class="preview-iframe"></iframe>
      </div>
      
      <!-- Markdown预览 -->
      <div v-if="type === 'markdown' && content" class="markdown-preview">
        <div class="markdown-body" v-html="renderedMarkdown"></div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!type" class="empty-preview">
        <el-empty description="点击链接或文档进行预览" :image-size="100"></el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

// 计算属性，用于渲染Markdown内容
const renderedMarkdown = computed(() => {
  if (!props.content) return '';
  try {
    return marked(props.content);
  } catch (e) {
    console.error('Markdown渲染错误:', e);
    return `<div class="error">Markdown渲染错误: ${e.message}</div>`;
  }
});

// 关闭预览面板
const closePreview = () => {
  emit('close');
};

// 监听url变化，自动处理加载状态
watch(() => props.url, (newUrl) => {
  if (newUrl && props.type === 'link') {
    // URL变化时可以添加额外处理逻辑
  }
});
</script>

<style scoped>
.preview-sidebar {
  position: fixed;
  right: -380px;
  top: 0;
  width: 380px;
  height: 100%;
  background: rgba(18, 24, 38, 0.95);
  border-left: 1px solid rgba(0, 195, 255, 0.3);
  box-shadow: -3px 0 15px rgba(0, 0, 0, 0.5);
  z-index: 999;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-active {
  right: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(0, 195, 255, 0.2);
  background: rgba(13, 18, 30, 0.8);
}

.preview-header h3 {
  margin: 0;
  color: var(--neon-blue, #00c3ff);
  font-size: 16px;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 195, 255, 0.5);
}

.close-preview-btn {
  color: var(--neon-blue, #00c3ff);
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.link-preview, .markdown-preview {
  height: 100%;
  width: 100%;
}

.preview-iframe {
  width: 100%;
  height: calc(100vh - 120px);
  border-radius: 8px;
  background: white;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--neon-blue, #00c3ff);
}

.cyber-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 195, 255, 0.1);
  border-top-color: var(--neon-blue, #00c3ff);
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

.spinner-inner {
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-top-color: rgba(0, 195, 255, 0.7);
  border-radius: 50%;
  animation: spin 0.8s linear infinite reverse;
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Markdown样式 */
.markdown-body {
  color: #e0e0e0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  line-height: 1.6;
}

.markdown-body h1, 
.markdown-body h2, 
.markdown-body h3, 
.markdown-body h4 {
  color: var(--neon-blue, #00c3ff);
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-body a {
  color: var(--neon-purple, #b400ff);
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body pre {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
}

.markdown-body code {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  padding: 2px 5px;
  font-family: monospace;
}

.markdown-body blockquote {
  border-left: 3px solid var(--neon-blue, #00c3ff);
  margin-left: 0;
  padding-left: 16px;
  color: rgba(255, 255, 255, 0.7);
}

/* 错误提示 */
.error {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #ff4757;
}
</style>

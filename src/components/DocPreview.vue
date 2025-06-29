<template>
  <div class="doc-preview" :class="{ 'preview-active': active }">
    <div class="preview-header">
      <h3>{{ title }}</h3>
      <el-button type="text" @click="$emit('close')" class="close-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <span class="close-text">关闭</span>
      </el-button>
    </div>
    
    <div class="preview-content">
      <!-- 链接预览 -->
      <template v-if="type === 'link'">
        <div v-if="loading" class="preview-loading">
          <div class="loading-spinner"></div>
          <span>正在加载...</span>
        </div>
        <iframe v-else :src="url" frameborder="0" class="preview-iframe"></iframe>
      </template>
      
      <!-- Markdown预览 -->
      <div v-if="type === 'markdown'" class="markdown-preview">
        <div class="markdown-content" v-html="renderedContent"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { marked } from 'marked'

export default {
  name: 'DocPreview',
  props: {
    active: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'markdown',
      validator: (value) => ['markdown', 'link'].includes(value)
    },
    content: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '预览'
    }
  },
  emits: ['close'],
  setup(props) {
    const renderedContent = computed(() => {
      if (props.type !== 'markdown' || !props.content) return '';
      
      try {
        return marked(props.content);
      } catch (e) {
        console.error('Markdown渲染错误:', e);
        return `<p class="error">Markdown渲染错误: ${e.message}</p>`;
      }
    });
    
    return {
      renderedContent
    };
  }
}
</script>

<style scoped>
.doc-preview {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: #0e1726;
  border-left: 1px solid rgba(0, 195, 255, 0.3);
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  color: #e0e0e0;
}

.preview-active {
  right: 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(0, 195, 255, 0.2);
}

.preview-header h3 {
  margin: 0;
  color: #00c3ff;
  font-size: 16px;
}

.close-btn {
  color: #00c3ff;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid rgba(0, 195, 255, 0.3);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 195, 255, 0.2);
  border-color: rgba(0, 195, 255, 0.5);
}

.close-text {
  font-size: 12px;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #00c3ff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 195, 255, 0.1);
  border-top-color: #00c3ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.preview-iframe {
  width: 100%;
  height: calc(100vh - 100px);
  border-radius: 4px;
  background: white;
}

.markdown-preview {
  height: 100%;
}

.markdown-content {
  color: #e0e0e0;
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4 {
  color: #00c3ff;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-content a {
  color: #b400ff;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-content code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.markdown-content blockquote {
  border-left: 3px solid #00c3ff;
  margin-left: 0;
  padding-left: 15px;
  color: rgba(255, 255, 255, 0.7);
}

.error {
  color: #ff4757;
  background: rgba(255, 0, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

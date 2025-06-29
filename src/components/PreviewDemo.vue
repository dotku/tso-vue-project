<template>
  <div class="demo-container">
    <div class="control-panel">
      <h2>预览面板演示</h2>
      <div class="actions">
        <el-button type="primary" @click="previewMarkdown">
          预览Markdown文档
        </el-button>
        <el-button type="primary" @click="previewLink">
          预览网页链接
        </el-button>
        <el-button type="danger" @click="closePreview">
          关闭预览
        </el-button>
      </div>
      <div class="description">
        <p>点击上方按钮查看预览面板效果。这个组件可以方便地集成到聊天界面中，用于预览链接和Markdown文档。</p>
      </div>
    </div>
    
    <!-- 引入DocPreview组件 -->
    <DocPreview 
      :active="previewActive"
      :type="previewType"
      :content="markdownContent"
      :url="previewUrl"
      :loading="previewLoading"
      :title="previewTitle"
      @close="closePreview"
    />
  </div>
</template>

<script>
import DocPreview from './DocPreview.vue'
import { ref } from 'vue'

export default {
  name: 'PreviewDemo',
  components: {
    DocPreview
  },
  setup() {
    // 预览面板状态
    const previewActive = ref(false)
    const previewType = ref('markdown')
    const previewUrl = ref('')
    const previewLoading = ref(false)
    const previewTitle = ref('预览面板')
    
    // 示例Markdown内容
    const markdownContent = ref(`# Windsurf 搜索系统

一个基于 Vue, Go 和 Eggjs 的三层架构搜索系统。

## 特性

- 用户注册和登录
- 使用 JWT 进行身份验证
- 搜索功能，使用 duck-duck-scrape 作为基础搜索引擎
- 使用 GPTGod API 对搜索结果进行总结
- SQLite 数据库存储用户信息
- 科技蓝风格的简洁界面

## 代码示例

\`\`\`javascript
// 在右侧预览栏预览Markdown内容
const previewMarkdown = (content) => {
  previewActive.value = true;
  previewType.value = 'markdown';
  previewContent.value = content;
};
\`\`\`

> 这是一个引用文本，展示Markdown渲染的效果。

* 列表项1
* 列表项2
  * 嵌套列表项
  * 另一个嵌套项

[点击链接](https://example.com)
`)
    
    // 预览Markdown文档
    const previewMarkdown = () => {
      previewActive.value = true
      previewType.value = 'markdown'
      previewTitle.value = 'Markdown文档预览'
    }
    
    // 预览网页链接
    const previewLink = () => {
      previewActive.value = true
      previewType.value = 'link'
      previewTitle.value = '网页链接预览'
      previewLoading.value = true
      previewUrl.value = 'https://developer.mozilla.org/zh-CN/'
      
      // 模拟加载完成
      setTimeout(() => {
        previewLoading.value = false
      }, 1500)
    }
    
    // 关闭预览
    const closePreview = () => {
      previewActive.value = false
    }
    
    return {
      previewActive,
      previewType,
      previewUrl,
      previewLoading,
      previewTitle,
      markdownContent,
      previewMarkdown,
      previewLink,
      closePreview
    }
  }
}
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background: #1a2233;
  color: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.control-panel {
  text-align: center;
}

h2 {
  color: #00c3ff;
  margin-bottom: 25px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.description {
  line-height: 1.6;
  color: #aaa;
  font-size: 14px;
  max-width: 600px;
  margin: 0 auto;
}
</style>

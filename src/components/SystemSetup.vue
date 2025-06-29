<template>
  <div class="system-setup">
    <div class="setup-container">
      <h1>系统初始化设置</h1>
      <p class="setup-intro">欢迎使用Windsurf系统！在开始使用前，需要进行一些基本配置。</p>
      
      <div class="setup-form" v-if="requiredConfigs.length > 0">
        <div class="form-group" v-for="key in requiredConfigs" :key="key">
          <label :for="key">{{ getConfigLabel(key) }}</label>
          <input 
            :type="getInputType(key)" 
            :id="key" 
            v-model="configValues[key]" 
            :placeholder="getConfigPlaceholder(key)"
            class="form-control"
          />
          <small class="form-text text-muted">{{ getConfigDescription(key) }}</small>
        </div>
        
        <div class="form-actions">
          <button 
            class="btn btn-primary" 
            @click="initialize" 
            :disabled="isSubmitting || !isFormValid"
          >
            {{ isSubmitting ? '处理中...' : '初始化系统' }}
          </button>
        </div>
      </div>
      
      <div v-else class="loading-state">
        <p>正在加载配置信息...</p>
      </div>
      
      <div class="error-message" v-if="error">
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import configService from '../services/config.js';

export default {
  name: 'SystemSetup',
  data() {
    return {
      requiredConfigs: [],
      configValues: {},
      error: null,
      isSubmitting: false,
      configInfo: {
        GPTGOD_API_KEY: {
          label: 'GPTGod API密钥',
          description: '用于AI搜索和摘要生成的GPTGod API密钥',
          placeholder: '例如：gptgod-1234567890abcdef',
          type: 'password'
        },
        TAVILY_API_KEY: {
          label: 'Tavily API密钥',
          description: '用于高级网络搜索的Tavily API密钥',
          placeholder: '例如：tvly-1234567890abcdef',
          type: 'password'
        },
        SEARCH_SERVICE_URL: {
          label: '搜索服务URL',
          description: '系统使用的搜索服务地址',
          placeholder: 'http://search:7001/search',
          type: 'text'
        }
      }
    };
  },
  computed: {
    isFormValid() {
      // 检查所有必填字段是否都有值
      return this.requiredConfigs.every(key => 
        this.configValues[key] && this.configValues[key].trim() !== ''
      );
    }
  },
  created() {
    console.log('SystemSetup组件已创建');
  },
  async mounted() {
    console.log('SystemSetup组件已挂载');
    try {
      await this.loadRequiredConfigs();
      await this.checkSystemStatus();
    } catch (error) {
      console.error('组件加载时出错:', error);
      this.error = '系统组件加载失败，请刷新页面重试';
    }
  },
  methods: {
    getConfigLabel(key) {
      return this.configInfo[key]?.label || key;
    },
    getConfigDescription(key) {
      return this.configInfo[key]?.description || '';
    },
    getConfigPlaceholder(key) {
      return this.configInfo[key]?.placeholder || '';
    },
    getInputType(key) {
      return this.configInfo[key]?.type || 'text';
    },
    async loadRequiredConfigs() {
      console.log('正在加载必要配置项...');
      try {
        // 添加默认值，以防API调用失败
        const defaultConfigs = ['GPTGOD_API_KEY', 'TAVILY_API_KEY', 'SEARCH_SERVICE_URL'];
        
        this.requiredConfigs = await configService.getRequiredConfigs();
        console.log('加载到的必要配置项:', this.requiredConfigs);
        
        // 如果API返回的列表为空，使用默认值
        if (!this.requiredConfigs || this.requiredConfigs.length === 0) {
          console.log('使用默认配置项列表');
          this.requiredConfigs = defaultConfigs;
        }
        
        // 初始化配置值对象
        this.requiredConfigs.forEach(key => {
          this.configValues[key] = '';
        });
      } catch (err) {
        console.error('加载配置项出错:', err);
        // 默认使用确定的配置项列表
        this.requiredConfigs = ['GPTGOD_API_KEY', 'TAVILY_API_KEY', 'SEARCH_SERVICE_URL'];
        this.requiredConfigs.forEach(key => {
          this.configValues[key] = '';
        });
        this.error = '无法加载必要配置项: ' + (err.message || '未知错误');
      }
    },
    async checkSystemStatus() {
      console.log('正在检查系统状态...');
      try {
        const status = await configService.getSystemStatus();
        console.log('系统状态:', status);
        
        // 如果系统已配置，跳转到登录页
        if (status.configured) {
          console.log('系统已配置，跳转到登录页面');
          this.$router.push('/login');
        } else {
          console.log('系统未配置，显示设置页面');
        }
      } catch (err) {
        console.error('检查系统状态出错:', err);
        this.error = '无法检查系统状态: ' + (err.message || '未知错误');
      }
    },
    async initialize() {
      console.log('开始初始化系统...');
      this.isSubmitting = true;
      this.error = null;
      
      try {
        // 构建配置数组
        const configs = Object.keys(this.configValues).map(key => ({
          key,
          value: this.configValues[key]
        }));
        
        console.log('发送的配置数据:', configs);
        
        const result = await configService.initializeSystem(configs);
        console.log('初始化响应:', result);
        
        // 添加延迟，确保用户看到成功消息
        setTimeout(() => {
          // 初始化成功后跳转到登录页
          console.log('初始化成功，准备跳转到登录页面');
          this.$router.push('/login');
        }, 1000);
      } catch (err) {
        console.error('初始化系统出错:', err);
        this.error = '系统初始化失败: ' + 
          (err.response?.data?.error || err.message || '未知错误');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.system-setup {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.setup-container {
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.setup-intro {
  margin-bottom: 2rem;
  color: #5e6d82;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s;
  font-size: 1rem;
}

.form-control:focus {
  border-color: #409eff;
  outline: none;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.form-actions {
  margin-top: 2rem;
  text-align: center;
}

.btn {
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #5e6d82;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fef0f0;
  color: #f56c6c;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>

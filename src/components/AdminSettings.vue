<template>
  <div class="admin-settings">
    <div class="settings-container">
      <h1>系统配置管理</h1>
      <p class="admin-intro">作为管理员，您可以查看和修改系统配置。</p>
      
      <div class="alert alert-info" v-if="!isAdmin">
        <p>您需要管理员权限才能访问此页面。</p>
      </div>
      
      <div v-else>
        <div class="settings-form" v-if="!isLoading">
          <div class="config-item" v-for="(value, key) in configs" :key="key">
            <div class="config-header">
              <h3>{{ getConfigLabel(key) }}</h3>
              <button 
                class="btn btn-sm btn-edit" 
                @click="startEditing(key)"
                v-if="editingKey !== key"
              >
                修改
              </button>
            </div>
            
            <div class="config-value" v-if="editingKey !== key">
              <p>{{ isSensitive(key) ? '********' : value }}</p>
              <small class="form-text text-muted">{{ getConfigDescription(key) }}</small>
            </div>
            
            <div class="config-edit" v-else>
              <input 
                :type="getInputType(key)" 
                v-model="editValue" 
                class="form-control"
                :placeholder="getConfigPlaceholder(key)"
              />
              <div class="edit-actions">
                <button class="btn btn-sm btn-cancel" @click="cancelEditing">取消</button>
                <button class="btn btn-sm btn-save" @click="saveConfig">保存</button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="loading-state">
          <p>正在加载配置信息...</p>
        </div>
        
        <div class="error-message" v-if="error">
          <p>{{ error }}</p>
        </div>
        
        <div class="success-message" v-if="successMessage">
          <p>{{ successMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import configService from '../services/config.js';
import authService from '../services/auth.js';

export default {
  name: 'AdminSettings',
  data() {
    return {
      configs: {},
      isLoading: true,
      error: null,
      successMessage: null,
      editingKey: null,
      editValue: '',
      isAdmin: false,
      configInfo: {
        GPTGOD_API_KEY: {
          label: 'GPTGod API密钥',
          description: '用于AI搜索和摘要生成的GPTGod API密钥',
          placeholder: '例如：gptgod-1234567890abcdef',
          type: 'password',
          sensitive: true
        },
        TAVILY_API_KEY: {
          label: 'Tavily API密钥',
          description: '用于高级网络搜索的Tavily API密钥',
          placeholder: '例如：tvly-1234567890abcdef',
          type: 'password',
          sensitive: true
        },
        SEARCH_SERVICE_URL: {
          label: '搜索服务URL',
          description: '系统使用的搜索服务地址',
          placeholder: 'http://search:7001/search',
          type: 'text',
          sensitive: false
        }
      }
    };
  },
  async mounted() {
    // 检查管理员权限
    this.isAdmin = authService.isAdmin();
    
    // 如果不是管理员，直接返回
    if (!this.isAdmin) {
      return;
    }
    
    // 获取最新的用户信息
    try {
      const userData = await authService.fetchCurrentUser();
      this.isAdmin = userData && userData.isAdmin;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    
    // 加载配置
    await this.loadConfigs();
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
    isSensitive(key) {
      return this.configInfo[key]?.sensitive || false;
    },
    async loadConfigs() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const status = await configService.getSystemStatus();
        if (status.configs) {
          this.configs = status.configs;
        }
      } catch (err) {
        this.error = '无法加载配置: ' + (err.message || '未知错误');
      } finally {
        this.isLoading = false;
      }
    },
    startEditing(key) {
      this.editingKey = key;
      this.editValue = this.configs[key] || '';
      this.error = null;
      this.successMessage = null;
    },
    cancelEditing() {
      this.editingKey = null;
      this.editValue = '';
    },
    async saveConfig() {
      if (!this.editingKey) return;
      
      try {
        await configService.updateConfig(this.editingKey, this.editValue);
        
        // 更新本地配置
        this.configs[this.editingKey] = this.editValue;
        this.successMessage = '配置更新成功';
        this.cancelEditing();
        
        // 3秒后清除成功消息
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      } catch (err) {
        this.error = '更新配置失败: ' + 
          (err.response?.data?.error || err.message || '未知错误');
      }
    }
  }
};
</script>

<style scoped>
.admin-settings {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem 0;
}

.settings-container {
  max-width: 800px;
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

.admin-intro {
  margin-bottom: 2rem;
  color: #5e6d82;
  text-align: center;
}

.config-item {
  padding: 1rem;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 1rem;
  background-color: #fafafa;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.config-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
}

.config-value {
  padding: 0.5rem;
}

.config-value p {
  margin: 0 0 0.5rem 0;
  font-family: monospace;
  font-size: 1rem;
  color: #606266;
}

.config-edit {
  margin-top: 0.5rem;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.btn {
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn-edit {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.btn-edit:hover {
  background-color: #bae7ff;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-cancel:hover {
  background-color: #e9e9e9;
}

.btn-save {
  background-color: #67c23a;
  color: white;
}

.btn-save:hover {
  background-color: #85ce61;
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

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f0f9eb;
  color: #67c23a;
  border-radius: 4px;
  font-size: 0.9rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-info {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}
</style>

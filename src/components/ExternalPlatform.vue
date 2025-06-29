<template>
  <div class="external-platform-container">
    <h1>External Platform Integration</h1>
    
    <div class="connection-status" :class="{ connected: isConnected }">
      <span class="status-indicator"></span>
      <span>Status: {{ isConnected ? 'Connected' : 'Disconnected' }}</span>
    </div>
    
    <div class="token-management">
      <h2>Platform Token</h2>
      <p class="description">
        This token is used to connect to the external platform. It needs to be updated periodically.
      </p>
      
      <div class="token-input">
        <label for="platform-token">Token</label>
        <div class="token-field">
          <input 
            :type="showToken ? 'text' : 'password'" 
            id="platform-token" 
            v-model="token" 
            placeholder="Enter platform token"
          />
          <button @click="toggleShowToken" class="toggle-visibility">
            {{ showToken ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>
      
      <div class="token-actions">
        <button @click="saveToken" class="primary-button" :disabled="!token">Save Token</button>
        <button @click="testConnection" class="secondary-button" :disabled="!token">Test Connection</button>
      </div>
      
      <div v-if="tokenInfo" class="token-info">
        <p><strong>Last Updated:</strong> {{ formatDate(tokenInfo.updatedAt) }}</p>
        <p><strong>Expiration:</strong> {{ tokenInfo.expiresAt ? formatDate(tokenInfo.expiresAt) : 'Unknown' }}</p>
      </div>
    </div>
    
    <div class="connection-history">
      <h2>Connection History</h2>
      <div v-if="connectionLogs.length === 0" class="empty-state">
        No connection history available
      </div>
      <ul v-else class="log-list">
        <li v-for="(log, index) in connectionLogs" :key="index" :class="log.status">
          <span class="log-time">{{ formatDate(log.timestamp) }}</span>
          <span class="log-status">{{ log.status }}</span>
          <span class="log-message">{{ log.message }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import externalPlatformService from '../services/externalPlatform.js';

export default {
  name: 'ExternalPlatform',
  setup() {
    const token = ref('');
    const showToken = ref(false);
    const isConnected = ref(false);
    const tokenInfo = ref(null);
    const connectionLogs = ref([]);
    
    onMounted(async () => {
      // Load existing token info if available
      await loadTokenInfo();
      // Check connection status
      await checkConnectionStatus();
      // Load connection history
      await loadConnectionHistory();
    });
    
    const loadTokenInfo = async () => {
      try {
        const info = await externalPlatformService.getTokenInfo();
        if (info) {
          tokenInfo.value = info;
          tokenInfo.updatedAt = info.data.update_time;
          console.log('tokenInfo', info.data.update_time);
          // Don't load the actual token value for security reasons
          // Just indicate that a token exists
          token.value = info.token ? '••••••••••••••••' : '';
        }
      } catch (error) {
        console.error('Failed to load token information:', error);
      }
    };
    
    const checkConnectionStatus = async () => {
      try {
        const status = await externalPlatformService.checkConnection();
        isConnected.value = status.connected;
      } catch (error) {
        console.error('Failed to check connection status:', error);
        isConnected.value = false;
      }
    };
    
    const loadConnectionHistory = async () => {
      try {
        const logs = await externalPlatformService.getConnectionLogs();
        connectionLogs.value = logs || [];
      } catch (error) {
        console.error('Failed to load connection history:', error);
      }
    };
    
    const saveToken = async () => {
      try {
        await externalPlatformService.saveToken(token.value);
        await loadTokenInfo();
        connectionLogs.value.unshift({
          timestamp: new Date(),
          status: 'info',
          message: 'Token updated successfully'
        });
      } catch (error) {
        console.error('Failed to save token:', error);
        connectionLogs.value.unshift({
          timestamp: new Date(),
          status: 'error',
          message: `Failed to save token: ${error.message || 'Unknown error'}`
        });
      }
    };
    
    const testConnection = async () => {
      try {
        const result = await externalPlatformService.testConnection(token.value);
        isConnected.value = result.success;
        
        connectionLogs.value.unshift({
          timestamp: new Date(),
          status: result.success ? 'success' : 'error',
          message: result.message || (result.success ? 'Connection successful' : 'Connection failed')
        });
      } catch (error) {
        console.error('Connection test failed:', error);
        isConnected.value = false;
        connectionLogs.value.unshift({
          timestamp: new Date(),
          status: 'error',
          message: `Connection test failed: ${error.message || 'Unknown error'}`
        });
      }
    };
    
    const toggleShowToken = () => {
      showToken.value = !showToken.value;
    };
    
    const formatDate = (date) => {
      if (!date) return 'N/A';
      const d = new Date(date);
      return d.toLocaleString();
    };
    
    return {
      token,
      showToken,
      isConnected,
      tokenInfo,
      connectionLogs,
      saveToken,
      testConnection,
      toggleShowToken,
      formatDate
    };
  }
}
</script>

<style scoped>
.external-platform-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 24px;
  color: #333;
}

h2 {
  margin-top: 24px;
  margin-bottom: 16px;
  color: #444;
}

.connection-status {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f8f8;
  border-radius: 6px;
  margin-bottom: 24px;
}

.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5252;
  margin-right: 10px;
}

.connection-status.connected .status-indicator {
  background-color: #4caf50;
}

.description {
  color: #666;
  margin-bottom: 16px;
}

.token-field {
  display: flex;
  margin-bottom: 16px;
}

.token-field input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
}

.toggle-visibility {
  padding: 10px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.token-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-button {
  background-color: #1976d2;
  color: white;
}

.secondary-button {
  background-color: #e0e0e0;
  color: #333;
}

.token-info {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-top: 16px;
}

.connection-history {
  margin-top: 32px;
}

.empty-state {
  color: #888;
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.log-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.log-list li {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.log-list li:last-child {
  border-bottom: none;
}

.log-time {
  font-size: 12px;
  color: #888;
  width: 150px;
}

.log-status {
  width: 80px;
  text-transform: capitalize;
  font-weight: 500;
}

.log-list li.success .log-status {
  color: #4caf50;
}

.log-list li.error .log-status {
  color: #f44336;
}

.log-list li.info .log-status {
  color: #2196f3;
}

.log-message {
  flex: 1;
}
</style>

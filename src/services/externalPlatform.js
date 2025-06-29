import axios from "axios";

// API URL for backend communication
const API_URL = "https://ragflow.operatornext.cn/v1";

// Token storage key in localStorage
export const EXTERNAL_PLATFORM_TOKEN_STORAGE_KEY = "external_platform_token";
const TOKEN_INFO_KEY = "external_platform_token_info";
const CONNECTION_LOGS_KEY = "external_platform_connection_logs";

// Maximum number of logs to keep in localStorage
const MAX_LOGS = 50;

export default {
  /**
   * Save the external platform token
   * @param {string} token - The token to save
   * @returns {Promise} - Promise resolving to the save result
   */
  async saveToken(token) {
    try {
      // First, encrypt and save token on the backend for better security
      const response = await axios.post(`${API_URL}/external-platform/token`, {
        authoriziation: token,
      });

      // Store minimal information in localStorage
      const tokenInfo = {
        lastUpdated: new Date(),
        expiresAt: response.data.expiresAt || null,
        tokenExists: true,
      };

      localStorage.setItem(EXTERNAL_PLATFORM_TOKEN_STORAGE_KEY, token);
      localStorage.setItem(TOKEN_INFO_KEY, JSON.stringify(tokenInfo));

      // Add log entry
      this.addConnectionLog({
        timestamp: new Date(),
        status: "info",
        message: "Token updated successfully",
      });

      return response.data;
    } catch (error) {
      console.error("Failed to save token:", error);
      throw error;
    }
  },

  /**
   * Get token information (not the actual token for security)
   * @returns {Object} - Token information object
   */
  async getTokenInfo() {
    try {
      // Try to get token info from backend first (more secure and up-to-date)
      const response = await axios.get(`${API_URL}/user/info`, {
        headers: this.getAuthHeader(),
      });

      if (response.data) {
        // Update local storage with latest info
        localStorage.setItem(TOKEN_INFO_KEY, JSON.stringify(response.data));
        return response.data;
      }
    } catch (error) {
      console.error("Failed to get token info from server:", error);
      // Fall back to local storage if backend request fails
    }

    // Return from localStorage as fallback
    const tokenInfoStr = localStorage.getItem(TOKEN_INFO_KEY);
    return tokenInfoStr ? JSON.parse(tokenInfoStr) : null;
  },

  /**
   * Check if we're connected to the external platform
   * @returns {Promise<Object>} - Connection status object
   */
  async checkConnection() {
    try {
      const response = await axios.get(`${API_URL}/user/info`, {
        headers: this.getAuthHeader(),
      });

      console.log("checkConnection", response);

      return {
        connected: response.status === 200 || false,
        lastChecked: new Date(),
        details: response.data || {},
      };
    } catch (error) {
      console.error("Failed to check connection status:", error);
      return {
        connected: false,
        lastChecked: new Date(),
        error: error.message || "Unknown error",
      };
    }
  },

  /**
   * Test connection to external platform with provided token
   * @param {string} token - Token to test (optional, uses stored token if not provided)
   * @returns {Promise<Object>} - Test result
   */
  async testConnection(token = null) {
    try {
      const response = await axios.get(`${API_URL}/user/info`, {
        headers: this.getAuthHeader(),
      });

      // Add log entry
      this.addConnectionLog({
        timestamp: new Date(),
        status: response.message === "success" ? "success" : "error",
        message:
          response.data.message ||
          (response.data.success
            ? "Connection successful"
            : "Connection failed"),
      });

      return response.data;
    } catch (error) {
      console.error("Connection test failed:", error);

      // Add log entry
      this.addConnectionLog({
        timestamp: new Date(),
        status: "error",
        message: `Connection test failed: ${error.message || "Unknown error"}`,
      });

      throw error;
    }
  },

  /**
   * Get connection logs from localStorage
   * @returns {Array} - Array of connection log entries
   */
  getConnectionLogs() {
    const logsStr = localStorage.getItem(CONNECTION_LOGS_KEY);
    return logsStr ? JSON.parse(logsStr) : [];
  },

  /**
   * Add a new connection log entry
   * @param {Object} logEntry - Log entry to add
   */
  addConnectionLog(logEntry) {
    const logs = this.getConnectionLogs();
    logs.unshift(logEntry);

    // Keep only the most recent logs
    const trimmedLogs = logs.slice(0, MAX_LOGS);

    localStorage.setItem(CONNECTION_LOGS_KEY, JSON.stringify(trimmedLogs));
    return trimmedLogs;
  },

  /**
   * Clear all connection logs
   */
  clearConnectionLogs() {
    localStorage.removeItem(CONNECTION_LOGS_KEY);
  },

  /**
   * Get authentication header for API requests
   * @returns {Object} - Headers object with Authorization
   */
  getAuthHeader() {
    const token = localStorage.getItem("token"); // Main app auth token
    return token ? { Authorization: `${token}` } : {};
  },

  /**
   * Set up automatic token refresh if the external platform provides refresh capabilities
   * @param {number} checkInterval - Interval in milliseconds to check token expiration
   */
  setupAutoRefresh(checkInterval = 3600000) {
    // Default: check every hour
    // Clear any existing interval
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }

    // Set up new interval
    this._refreshInterval = setInterval(async () => {
      try {
        const tokenInfo = await this.getTokenInfo();

        // If no token info or no expiration date, nothing to do
        if (!tokenInfo || !tokenInfo.expiresAt) return;

        const expiryDate = new Date(tokenInfo.expiresAt);
        const now = new Date();

        // If token expires in less than 24 hours, try to refresh it
        if (expiryDate - now < 86400000) {
          // 24 hours in milliseconds
          console.log("Token expiring soon, attempting refresh");

          // Call backend to refresh token
          await axios.post(
            `${API_URL}/external-platform/refresh-token`,
            {},
            {
              headers: this.getAuthHeader(),
            }
          );

          // Update token info
          await this.getTokenInfo();

          this.addConnectionLog({
            timestamp: new Date(),
            status: "info",
            message: "Token automatically refreshed",
          });
        }
      } catch (error) {
        console.error("Failed to auto-refresh token:", error);
        this.addConnectionLog({
          timestamp: new Date(),
          status: "error",
          message: `Auto-refresh failed: ${error.message || "Unknown error"}`,
        });
      }
    }, checkInterval);
  },
};

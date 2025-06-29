import axios from "axios";
import authService from "./auth.js";

// 使用相对路径，依赖Vite代理将请求转发到后端
const API_URL = "/api";

// 添加请求拦截器，记录所有API请求
axios.interceptors.request.use((config) => {
  console.log(`发送请求: ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// 添加响应拦截器，记录API响应
axios.interceptors.response.use(
  (response) => {
    console.log(
      `收到响应: ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(`请求错误: ${error.config?.url || "未知URL"}`, error);
    return Promise.reject(error);
  }
);

export default {
  // 获取系统配置状态
  async getSystemStatus() {
    try {
      console.log("获取系统状态...");
      // 不添加认证头，因为系统初始未配置时不需要认证
      const response = await axios.get(`${API_URL}/system/status`);
      console.log("系统状态响应:", response.data);
      return response.data;
    } catch (error) {
      console.error("获取系统状态出错:", error);
      // 返回未配置状态，允许用户进入设置页面
      return { configured: false };
    }
  },

  // 获取所需的配置项
  async getRequiredConfigs() {
    try {
      const response = await axios.get(`${API_URL}/system/required-configs`);
      return response.data.required || [];
    } catch (error) {
      console.error("Error fetching required configs:", error);
      return [];
    }
  },

  // 初始化系统（首次设置）
  async initializeSystem(configs) {
    try {
      const response = await axios.post(
        `${API_URL}/system/initialize`,
        configs
      );
      return response.data;
    } catch (error) {
      console.error("Error initializing system:", error);
      throw error;
    }
  },

  // 更新单个配置项（需要管理员权限）
  async updateConfig(key, value) {
    try {
      const response = await axios.post(
        `${API_URL}/system/config`,
        { key, value },
        { headers: authService.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating config ${key}:`, error);
      throw error;
    }
  },
};

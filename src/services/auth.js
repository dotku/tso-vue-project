import axios from 'axios';

// 使用相对路径，依赖Vite代理将请求转发到后端
const API_URL = '/api';

export default {
  // Login user and save token
  async login(username, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    
    if (response.data.token) {
      // Store user details in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', username);
      localStorage.setItem('loginTime', new Date().toString());
      
      // Store admin status if available
      if (response.data.isAdmin !== undefined) {
        localStorage.setItem('isAdmin', response.data.isAdmin);
      }
    }
    
    return response.data;
  },
  
  // Register new user
  async register(username, password) {
    return await axios.post(`${API_URL}/auth/register`, {
      username,
      password
    });
  },
  
  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('isAdmin');
  },
  
  // Check if user is logged in
  isLoggedIn() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return !!token && !!username;
  },
  
  // Get current user info
  getCurrentUser() {
    return {
      username: localStorage.getItem('username'),
      token: localStorage.getItem('token'),
      loginTime: localStorage.getItem('loginTime'),
      isAdmin: localStorage.getItem('isAdmin') === 'true'
    };
  },
  
  // Check if user is admin
  isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
  },
  
  // Get current user from server (with fresh data)
  async fetchCurrentUser() {
    try {
      const response = await axios.get(`${API_URL}/auth/user`, {
        headers: this.getAuthHeader()
      });
      
      // Update local storage with fresh data
      if (response.data && response.data.username) {
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('isAdmin', response.data.isAdmin);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },
  
  // Get authentication header
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

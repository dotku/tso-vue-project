<template>
  <div class="login-container">
    <div class="logo">
      <img src="../assets/tsoai-logo.png" alt="TSOai" />
    </div>
    
    <div class="login-card">
      <h2>欢迎登录</h2>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <div class="form-label">
            <span>用户名</span>
            <span class="required">*</span>
          </div>
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <div class="form-label">
            <span>密码</span>
            <span class="required">*</span>
          </div>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            size="large"
            show-password
          />
        </el-form-item>
        
        <div class="button-group">
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="loading" 
            class="login-button" 
            size="large"
          >
            登录
          </el-button>
          
          <el-button 
            @click="goToRegister" 
            class="register-button" 
            size="large"
          >
            注册
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import authService from '../services/auth';

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

// Check if already logged in on mount
onMounted(() => {
  if (authService.isLoggedIn()) {
    router.push('/message');
  }
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await authService.login(loginForm.username, loginForm.password);
        ElMessage.success('登录成功');
        router.push('/message');
      } catch (error) {
        console.error(error);
        ElMessage.error(error.response?.data?.message || '登录失败，请重试');
      } finally {
        loading.value = false;
      }
    }
  });
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: #F8FAFF;
  padding: 40px 20px;
}

.logo {
  margin-bottom: 40px;
}

.logo img {
  height: 40px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 32px 20px 48px 20px;
  width: 420px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.login-card h2 {
  font-size: 24px;
  color: #1A1A1A;
  margin: 0 0 32px;
  text-align: center;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-label {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #1A1A1A;
}

.required {
  color: #FF4D4F;
}

:deep(.el-input__wrapper) {
  background: white;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  box-shadow: none !important;
  padding: 0 16px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #4080FF;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #4080FF;
}

:deep(.el-input__inner) {
  height: 40px;
  color: #1A1A1A;
}

:deep(.el-input__inner::placeholder) {
  color: #86909C;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.button-group :deep(.el-button + .el-button) {
  margin-left: 0;
}

.login-button {
  width: 100%;
  height: 40px;
  background: #4080FF;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.login-button:hover {
  background: #165DFF;
}

.register-button {
  width: 100%;
  height: 40px;
  background: transparent;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  color: #4E5969;
  font-size: 14px;
}

.register-button:hover {
  border-color: #4080FF;
  color: #4080FF;
}

@media (max-width: 768px) {
  .magic-logo {
    font-size: 2rem;
  }
  
  .orb1, .orb2, .orb3 {
    opacity: 0.25;
  }
}
</style>

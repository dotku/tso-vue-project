<template>
  <div class="register-container">
    <div class="logo">
      <img src="../assets/tsoai-logo.png" alt="TSOai" />
    </div>
    
    <div class="register-card">
      <div class="back-to-login" @click="goToLogin">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
        返回登录
      </div>
      <h2>账号注册</h2>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" class="register-form">
        <el-form-item prop="username">
          <div class="form-label">
            <span>用户名</span>
            <span class="required">*</span>
          </div>
          <el-input 
            v-model="registerForm.username" 
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
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码" 
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <div class="form-label">
            <span>确认密码</span>
            <span class="required">*</span>
          </div>
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码" 
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-button 
          type="primary" 
          @click="handleRegister" 
          :loading="loading" 
          class="register-button" 
          size="large"
        >
          注册
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import authService from '../services/auth';

const router = useRouter();
const registerFormRef = ref(null);
const loading = ref(false);

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
});

const checkPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度需在3-20之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: checkPassword, trigger: 'blur' }
  ]
};

// Check if already logged in on mount
onMounted(() => {
  if (authService.isLoggedIn()) {
    router.push('/message');
  }
});

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await authService.register(registerForm.username, registerForm.password);
        ElMessage.success('注册成功');
        router.push('/login');
      } catch (error) {
        console.error(error);
        ElMessage.error(error.response?.data?.message || '注册失败，请重试');
      } finally {
        loading.value = false;
      }
    }
  });
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
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

.register-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
}

.back-to-login {
  position: absolute;
  top: 32px;
  left: 32px;
  color: #4080FF;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-icon {
  font-size: 12px;
}

.back-to-login:hover {
  color: #165DFF;
}

.register-card h2 {
  font-size: 24px;
  color: #1A1A1A;
  margin: 0 0 32px;
  text-align: center;
  font-weight: 500;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.register-button {
  width: 100%;
  height: 40px;
  background: #4080FF;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}

.register-button:hover {
  background: #165DFF;
}
</style>

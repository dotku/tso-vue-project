<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1 class="profile-title">{{ $t("profile.title") }}</h1>
    </div>

    <div class="profile-content">
      <!-- Personal Information Section -->
      <div class="profile-section">
        <h2 class="section-title">{{ $t("profile.personalInfo") }}</h2>
        <div class="profile-card">
          <div class="avatar-section">
            <el-avatar :size="80" class="profile-avatar">
              {{ username.charAt(0).toUpperCase() }}
            </el-avatar>
            <el-button type="text" class="change-avatar-btn">
              {{ $t("profile.avatar") }}
            </el-button>
          </div>

          <div class="info-section">
            <div class="info-item">
              <label>{{ $t("profile.username") }}</label>
              <el-input
                v-model="userInfo.username"
                :placeholder="$t('profile.username')"
              />
            </div>
            <div class="info-item">
              <label>{{ $t("profile.email") }}</label>
              <el-input
                v-model="userInfo.email"
                :placeholder="$t('profile.email')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Preferences Section -->
      <div class="profile-section">
        <h2 class="section-title">{{ $t("profile.preferences") }}</h2>
        <div class="profile-card">
          <div class="preference-item">
            <label>{{ $t("profile.language") }}</label>
            <el-select
              v-model="selectedLanguage"
              @change="changeLanguage"
              class="language-select"
            >
              <el-option
                v-for="(label, code) in availableLanguages"
                :key="code"
                :label="label"
                :value="code"
              />
            </el-select>
          </div>

          <div class="preference-item">
            <label>{{ $t("profile.theme") }}</label>
            <el-select v-model="selectedTheme" class="theme-select">
              <el-option
                v-for="(label, value) in availableThemes"
                :key="value"
                :label="label"
                :value="value"
              />
            </el-select>
          </div>
        </div>
      </div>

      <!-- Account Settings Section -->
      <div class="profile-section">
        <h2 class="section-title">{{ $t("profile.account") }}</h2>
        <div class="profile-card">
          <div class="account-actions">
            <el-button type="primary" @click="handleChangePassword">
              {{ $t("profile.changePassword") }}
            </el-button>
            <el-button type="danger" @click="handleDeleteAccount">
              {{ $t("profile.deleteAccount") }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="profile-actions">
        <el-button type="primary" size="large" @click="saveChanges">
          {{ $t("profile.saveChanges") }}
        </el-button>
        <el-button size="large" @click="goBack">
          {{ $t("common.goBack") }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

const { t, locale } = useI18n();
const router = useRouter();

// User data
const username = ref(localStorage.getItem("username") || "User");
const userInfo = ref({
  username: username.value,
  email: localStorage.getItem("email") || "",
});

// Language settings
const selectedLanguage = ref(locale.value);
const availableLanguages = computed(() => ({
  en: t("languages.en"),
  "zh-CN": t("languages.zh-CN"),
  es: t("languages.es"),
  fr: t("languages.fr"),
  de: t("languages.de"),
  ja: t("languages.ja"),
  vi: t("languages.vi"),
  ms: t("languages.ms"),
}));

// Theme settings
const selectedTheme = ref(localStorage.getItem("theme") || "light");
const availableThemes = computed(() => ({
  light: t("themes.light"),
  dark: t("themes.dark"),
  auto: t("themes.auto"),
}));

// Methods
const changeLanguage = (newLanguage) => {
  locale.value = newLanguage;
  localStorage.setItem("language", newLanguage);
  ElMessage.success(t("profile.languageChanged"));
};

const handleChangePassword = () => {
  ElMessageBox.prompt(t("auth.password"), t("profile.changePassword"), {
    confirmButtonText: t("common.confirm"),
    cancelButtonText: t("common.cancel"),
    inputType: "password",
  })
    .then(({ value }) => {
      // Handle password change logic here
      ElMessage.success(t("common.success"));
    })
    .catch(() => {
      // User cancelled
    });
};

const handleDeleteAccount = () => {
  ElMessageBox.confirm(
    "This action cannot be undone. Are you sure?",
    t("profile.deleteAccount"),
    {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    }
  )
    .then(() => {
      // Handle account deletion logic here
      ElMessage.success("Account deletion initiated");
    })
    .catch(() => {
      // User cancelled
    });
};

const saveChanges = () => {
  // Save user info to localStorage or send to backend
  localStorage.setItem("username", userInfo.value.username);
  localStorage.setItem("email", userInfo.value.email);
  localStorage.setItem("theme", selectedTheme.value);

  ElMessage.success(t("common.success"));
};

const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  // Load user data if available
  const savedEmail = localStorage.getItem("email");
  if (savedEmail) {
    userInfo.value.email = savedEmail;
  }
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.profile-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #4f46e5;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 25px;
}

.profile-avatar {
  margin-bottom: 10px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  font-size: 32px;
  font-weight: 600;
}

.change-avatar-btn {
  color: #4f46e5;
  font-size: 14px;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preference-item:last-child {
  margin-bottom: 0;
}

.preference-item label {
  font-weight: 500;
  color: #374151;
  font-size: 16px;
}

.language-select,
.theme-select {
  width: 200px;
}

.account-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.profile-actions {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.profile-actions .el-button {
  margin: 0 10px;
  min-width: 120px;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }

  .info-section {
    grid-template-columns: 1fr;
  }

  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .language-select,
  .theme-select {
    width: 100%;
  }

  .account-actions {
    flex-direction: column;
  }

  .account-actions .el-button {
    width: 100%;
  }
}
</style>

import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import Message from "../components/Message.vue";
import Profile from "../components/Profile.vue";
import PreviewDemo from "../components/PreviewDemo.vue";
import SystemSetup from "../components/SystemSetup.vue";
import AdminSettings from "../components/AdminSettings.vue";
import ExternalPlatform from "../components/ExternalPlatform.vue";
import configService from "../services/config.js";
import authService from "../services/auth.js";
import RagChat from "../components/RagChat.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "root",
      component: {
        template: "<div></div>",
        beforeRouteEnter(to, from, next) {
          // 首先检查系统是否已初始化
          configService
            .getSystemStatus()
            .then((status) => {
              if (!status.configured) {
                next("/setup");
              } else {
                next("/login");
              }
            })
            .catch(() => next("/login"));
        },
      },
    },
    {
      path: "/rag-chat",
      name: "rag-chat",
      component: RagChat,
    },
    {
      path: "/setup",
      name: "setup",
      component: SystemSetup,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/message",
      name: "message",
      component: Message,
      meta: { requiresAuth: true },
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: "/preview-demo",
      name: "preview-demo",
      component: PreviewDemo,
    },
    {
      path: "/external-platform",
      name: "external-platform",
      component: ExternalPlatform,
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/settings",
      name: "admin-settings",
      component: AdminSettings,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

// Navigation guard for protected routes
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  // 检查系统是否已初始化配置（除了setup页面外）
  if (to.path !== "/setup" && to.name !== "root") {
    try {
      const status = await configService.getSystemStatus();
      if (
        !status.configured &&
        to.path !== "/login" &&
        to.path !== "/register"
      ) {
        next("/setup");
        return;
      }
    } catch (error) {
      console.error("Error checking system status:", error);
      // 出错时继续导航，让API错误在组件中处理
    }
  }

  // 如果路由需要认证且用户未登录
  if (to.meta.requiresAuth && !token) {
    next("/login");
    return;
  }

  // 如果路由需要管理员权限
  if (to.meta.requiresAdmin && !authService.isAdmin()) {
    next("/message"); // 重定向到消息页面
    return;
  }

  // 如果用户已登录且尝试访问登录/注册页面
  if (token && username && (to.path === "/login" || to.path === "/register")) {
    next("/message"); // 重定向到消息页面
    return;
  }

  // 正常进行导航
  next();
});

export default router;

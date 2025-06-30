import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // Add assetsInclude to handle HTML files properly
  assetsInclude: ["**/*.html"],
  // 开发服务器配置
  server: {
    // 代理配置 - 注释掉，因为需要用 vercel dev 来运行 API
    // proxy: {
    //   // 将所有 /api 开头的请求转发到 Vercel dev server
    //   '/api': {
    //     target: 'http://localhost:3000', // Vercel dev server default port
    //     changeOrigin: true,
    //     secure: false,
    //   }
    // }
  },
  // 使用相对路径，确保资源可以被后端直接提供
  base: "./",
  build: {
    // 输出目录 (默认为 'dist')
    outDir: "dist",
    // 确保产生的资源使用相对路径
    assetsDir: "assets",
  },
});

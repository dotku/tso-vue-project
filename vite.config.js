import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 开发服务器配置
  server: {
    // 代理配置
    proxy: {
      // 将所有 /api 开头的请求转发到后端服务器
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // 保留 /api 路径前缀
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      // 如果需要下载文件，确保代理正确处理Content-Disposition头
      '/api/documents': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // 使用相对路径，确保资源可以被后端直接提供
  base: './',
  build: {
    // 输出目录 (默认为 'dist')
    outDir: 'dist',
    // 确保产生的资源使用相对路径
    assetsDir: 'assets',
  },
})

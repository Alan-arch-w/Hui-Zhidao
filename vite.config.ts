import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: false,
    host: true,
    allowedHosts: true,
    proxy: {
      // 将所有 /api 请求代理到后端服务器
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5174,
    host: true,
    allowedHosts: true,
    proxy: {
      // preview 模式下同样代理 API 请求
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
  },
});

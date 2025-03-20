import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/music-form-4cfd6': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
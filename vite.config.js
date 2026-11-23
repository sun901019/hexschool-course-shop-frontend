import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwind from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/api/v1': {
      target: env.COURSE_API_PROXY || 'http://127.0.0.1:4411',
      changeOrigin: true,
    },
  };
  return { plugins: [vue(), tailwind()], server: { proxy }, preview: { proxy } };
});

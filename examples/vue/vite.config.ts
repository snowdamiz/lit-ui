import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat lui-* tags as custom elements
          isCustomElement: (tag) => tag.startsWith('lui-'),
        },
      },
    }),
  ],
});

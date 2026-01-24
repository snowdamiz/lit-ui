import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat tags with 'ui-' prefix as custom elements
          isCustomElement: (tag) => tag.startsWith('ui-')
        }
      }
    })
  ]
})

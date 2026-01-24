import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Use built library (dist has processed CSS)
      'lit-ui': resolve(__dirname, '../dist'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
})

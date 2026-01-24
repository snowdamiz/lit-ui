import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      // Custom elements (web components) handle their own accessibility
      // Suppress a11y warnings for ui-* custom elements
      onwarn: (warning, handler) => {
        // Ignore a11y warnings for custom elements that handle their own accessibility
        // The ui-button and ui-dialog components contain native interactive elements
        if (
          warning.code &&
          (warning.code.startsWith('a11y') || warning.code.startsWith('a11y_')) &&
          warning.filename?.includes('App.svelte')
        ) {
          return;
        }
        handler(warning);
      },
    }),
  ],
})

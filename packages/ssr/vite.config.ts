import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        hydration: 'src/hydration.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      // CRITICAL: Lit SSR uses conditional exports (node vs browser) that break when bundled
      external: ['lit', /^lit\//, /^@lit\//, /^@lit-labs\//, /^@lit-ui\//],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
      },
    },
  },
});

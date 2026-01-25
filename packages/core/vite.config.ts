import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tailwindcss(),
    dts({
      entryRoot: 'src',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'tokens/index': 'src/tokens/index.ts',
        'utils/index': 'src/utils/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['lit', /^lit\//, /^@lit\//, /^@lit-ui\//],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
      },
    },
  },
});

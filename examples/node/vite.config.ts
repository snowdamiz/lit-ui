import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false, // Don't copy public directory
  build: {
    outDir: 'public',
    lib: {
      entry: 'src/client.ts',
      formats: ['es'],
      fileName: () => 'client.js',
    },
    rollupOptions: {
      // Bundle everything for the client
      external: [],
    },
  },
});

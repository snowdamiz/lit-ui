import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  shims: true,
  target: 'node18',
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Bundle JSON files inline (used by registry utility)
  loader: {
    '.json': 'json',
  },
});

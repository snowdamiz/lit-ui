import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync } from 'node:fs';

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
  // Copy registry.json to dist/ for createRequire to load at runtime
  onSuccess: async () => {
    mkdirSync('dist/registry', { recursive: true });
    copyFileSync('src/registry/registry.json', 'dist/registry/registry.json');
  },
});

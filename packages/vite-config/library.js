import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

/**
 * Create Vite config for Lit component library builds
 * @param {Object} options
 * @param {string} options.entry - Entry file path (default: 'src/index.ts')
 * @param {string} [options.entryRoot] - Root for dts plugin (default: 'src')
 */
export function createLibraryConfig(options = {}) {
  const entry = options.entry || 'src/index.ts';
  const entryRoot = options.entryRoot || 'src';

  return defineConfig({
    plugins: [
      tailwindcss(),
      dts({
        rollupTypes: true,
        entryRoot
      })
    ],
    build: {
      lib: {
        entry,
        formats: ['es'],
        fileName: 'index'
      },
      rollupOptions: {
        external: ['lit', /^lit\//, /^@lit\//, /^@lit-ui\//]
      }
    }
  });
}

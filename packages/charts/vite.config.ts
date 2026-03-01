import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    tailwindcss(),
    dts({ rollupTypes: true, entryRoot: 'src' }),
  ],
  build: {
    lib: {
      entry: {
        'index': 'src/index.ts',
        'line-chart': 'src/line/line-chart.ts',
        'area-chart': 'src/area/area-chart.ts',
        'bar-chart': 'src/bar/bar-chart.ts',
        'pie-chart': 'src/pie/pie-chart.ts',
        'scatter-chart': 'src/scatter/scatter-chart.ts',
        'heatmap-chart': 'src/heatmap/heatmap-chart.ts',
        'candlestick-chart': 'src/candlestick/candlestick-chart.ts',
        'treemap-chart': 'src/treemap/treemap-chart.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      // echarts-gl is externalized so that 'echarts-gl/charts' is not bundled into a
      // Vite namespace chunk. When bundled, the '.then(s => s.x)' namespace accessor
      // pattern breaks when downstream bundlers (e.g. the docs app Vite) re-process
      // the dist — at() wraps the preload but then .then(n=>n.x) accesses .x on the
      // already-extracted named export (not the module namespace), yielding undefined.
      external: ['lit', /^lit\//, /^@lit\//, /^@lit-ui\//, 'echarts-gl', /^echarts-gl\//],
    },
  },
});

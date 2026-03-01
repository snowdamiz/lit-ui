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
      external: ['lit', /^lit\//, /^@lit\//, /^@lit-ui\//],
    },
  },
});

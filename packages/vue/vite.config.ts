import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// One file per source module, so an app tree-shakes per component, and every
// dependency left as an import.
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: {
        index: 'src/index.ts',
        chart: 'src/chart.ts',
        'data-table': 'src/data-table.ts'
      },
      formats: ['es']
    },
    rolldownOptions: {
      external: [/^vue($|\/)/, /^@vunset\//, /^@floating-ui\//, /^@tanstack\//],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js'
      }
    }
  }
});

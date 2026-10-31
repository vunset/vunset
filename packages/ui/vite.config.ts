import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

// The stylesheets ship as written, for the app's bundler to resolve: `preflight.css`, `base.css`,
// `all.css` (the only one with `@import`s), and every component's flat in `css/`.
function copyStylesheets(): Plugin {
  return {
    name: 'copy-stylesheets',
    closeBundle() {
      mkdirSync('dist/css', { recursive: true });
      for (const folder of ['app', 'form']) {
        for (const file of readdirSync(`src/${folder}`).filter((name) => name.endsWith('.css'))) {
          copyFileSync(`src/${folder}/${file}`, `dist/css/${file}`);
        }
      }
      copyFileSync('src/base.css', 'dist/base.css');
      copyFileSync('src/preflight.css', 'dist/preflight.css');
      // A sheet that belongs to no component (`kbd.css`, `inverted.css`) ships in `css/` too.
      for (const file of readdirSync('src').filter((name) => name.endsWith('.css'))) {
        if (!['all.css', 'base.css', 'preflight.css'].includes(file)) copyFileSync(`src/${file}`, `dist/css/${file}`);
      }
      writeFileSync(
        'dist/all.css',
        readFileSync('src/all.css', 'utf8').replace(/'\.\/(?:(?:app|form)\/)?(?!base\.css')/g, "'./css/")
      );
    }
  };
}

export default defineConfig({
  plugins: [vue(), copyStylesheets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: { entry: { index: 'src/index.ts', chart: 'src/chart.ts', 'data-table': 'src/data-table.ts' }, formats: ['es'] },
    rolldownOptions: {
      external: [/^vue($|\/)/, /^@vunset\//, /^@tanstack\//],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js'
      }
    }
  }
});

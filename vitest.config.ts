import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { sourceAliases } from './vite.aliases.ts';

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: sourceAliases },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: { name: 'utils', environment: 'node', include: ['packages/utils/test/**/*.test.ts'] }
      },
      {
        extends: true,
        test: { name: 'nuxt', environment: 'node', include: ['packages/nuxt/test/**/*.test.ts'] },
        resolve: {
          alias: {
            '#app': new URL('./packages/nuxt/test/app-stub.ts', import.meta.url).pathname,
            '#components': new URL('./packages/nuxt/test/components-stub.ts', import.meta.url).pathname
          }
        },
        // What Nuxt replaces in its runtime: the plugins run as on the page.
        define: { 'import.meta.client': 'true', 'import.meta.server': 'false' }
      },
      {
        extends: true,
        test: {
          name: 'vue',
          environment: 'jsdom',
          include: ['packages/vue/test/**/*.test.ts'],
          exclude: ['packages/vue/test/ssr.test.ts'],
          setupFiles: ['packages/vue/test/setup.ts']
        }
      },
      {
        extends: true,
        test: {
          // A fresh Vue per case, from `vi.resetModules()`: Vue reports some
          // hydration mismatches only as "contains mismatches", once per runtime.
          name: 'ssr',
          environment: 'jsdom',
          include: ['packages/vue/test/ssr.test.ts'],
          setupFiles: ['packages/vue/test/setup.ts'],
          // Inlined, so a reset reaches them, and the libraries importing Vue get the same fresh one.
          server: { deps: { inline: [/node_modules\/(vue|@vue|@tanstack)\//] } }
        },
        // The ESM builds: under the `node` condition Vue resolves to CommonJS,
        // whose `require` cache no reset reaches.
        resolve: {
          alias: [
            { find: /^vue$/, replacement: 'vue/dist/vue.runtime.esm-bundler.js' },
            { find: /^vue\/server-renderer$/, replacement: '@vue/server-renderer/dist/server-renderer.esm-bundler.js' },
            {
              find: /^@vue\/(runtime-core|runtime-dom|server-renderer|shared|reactivity)$/,
              replacement: '@vue/$1/dist/$1.esm-bundler.js'
            }
          ]
        }
      },
      {
        extends: true,
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['packages/ui/test/**/*.test.ts'],
          setupFiles: ['packages/vue/test/setup.ts']
        }
      }
    ]
  }
});

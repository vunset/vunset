import { defineConfig } from 'vitepress';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { sourceAliases } from '../../vite.aliases.ts';
import { previewContainer } from './markdown/preview.ts';
import { apiContainer } from './markdown/api.ts';
import { framesContainer } from './markdown/frames.ts';
import { scrollTable } from './markdown/scroll-table.ts';
import { installTabs } from './markdown/install-tabs.ts';
import { readFileSync } from 'node:fs';
import vuePackage from '../../packages/vue/package.json' with { type: 'json' };

const base = '/';
const origin = 'https://vunset.com';
const description = 'A headless, unstyled Vue 3 component library, and a pre-styled UI built on it.';

function latestRelease() {
  const changelog = readFileSync(new URL('../../CHANGELOG.md', import.meta.url), 'utf8');
  const match = changelog.match(/^## (\d+\.\d+\.\d+(?:-[\w.]+)?)\n+([^#\n][^\n]*)?/m);
  return { version: match?.[1] ?? vuePackage.version, note: match?.[2]?.trim() ?? '' };
}

export default defineConfig({
  title: 'Headless Vue Components',
  titleTemplate: ':title - Vunset',
  htmlAttrs: { prefix: 'og: https://ogp.me/ns#', lang: 'en' },
  description,
  base,
  cleanUrls: true,
  sitemap: { hostname: origin + base },
  head: [
    [
      'link',
      {
        rel: 'preload',
        href: `${base}fonts/InstrumentSans-Variable.woff2`,
        as: 'font',
        type: 'font/woff2',
        crossorigin: ''
      }
    ],
    ['link', { rel: 'apple-touch-icon', href: `${base}apple-touch-icon.png` }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: `${base}favicon.ico`, sizes: '32x32' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['meta', { property: 'og:image', content: `${origin + base}og-default.webp` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Vunset' }],
    ['meta', { name: 'twitter:card', content: 'summary' }]
  ],
  transformHead({ pageData, title, description: pageDescription }) {
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');
    return [
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: origin + base + path }]
    ];
  },
  postRender(context) {
    const teleports = (context.teleports ??= {});
    teleports.body = `<div id="teleports">${teleports['#teleports'] ?? ''}</div>${teleports.body ?? ''}`;
    return context;
  },
  markdown: {
    headers: true,
    lineNumbers: true,
    config: (md) => {
      md.use(previewContainer, { root: fileURLToPath(new URL('./demos', import.meta.url)) });
      md.use(apiContainer, {
        root: fileURLToPath(new URL('../../packages/vue/src/components', import.meta.url)),
        uiRoot: fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
        tsconfig: fileURLToPath(new URL('./tsconfig.api.json', import.meta.url))
      });
      md.use(framesContainer);
      md.use(scrollTable);
      md.use(installTabs);
    },
    theme: { light: 'vesper', dark: 'kanagawa-wave' }
  },
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: { storeFields: ['title', 'titles', 'text'] }
        },
        async _render(src, env, md) {
          const html = await md.renderAsync(src, env);
          return html
            .replace(/<Preview\b[\s\S]*?<\/Preview>/g, '')
            .replace(/<template #(?:pnpm|yarn|bun)>[\s\S]*?<\/template>/g, '');
        }
      }
    },
    version: vuePackage.version,
    release: latestRelease(),
    nav: [
      { text: 'Vue', link: '/get-started', tooltip: 'Headless' },
      { text: 'UI', link: '/ui/get-started', tooltip: 'Pre-styled' },
      { text: 'Nuxt', link: '/nuxt/get-started', tooltip: 'All-in-one' },
      { text: 'Changelog', link: '/changelog', tooltip: `Latest version: ${vuePackage.version}` }
    ],
    sidebar: {
      '/changelog': [],
      '/nuxt/': [
        {
          text: 'Overview',
          items: [{ text: 'Get Started', link: '/nuxt/get-started' }]
        },
        {
          text: 'Features',
          items: [
            { text: 'Icons and sprites', link: '/nuxt/icons' },
            { text: 'Infinity Fetch', link: '/nuxt/use-infinity-fetch' },
            { text: 'Toasts on the server', link: '/nuxt/toasts' },
            { text: 'Theme', link: '/nuxt/theme' }
          ]
        }
      ],
      '/ui/': [
        {
          text: 'Overview',
          items: [
            { text: 'Get Started', link: '/ui/get-started' },
            { text: 'Theming', link: '/ui/theming' }
          ]
        },
        {
          text: 'Actions',
          items: [
            { text: 'AppButton', link: '/ui/app-button' },
            { text: 'AppCopy', link: '/ui/app-copy' }
          ]
        },
        {
          text: 'Forms',
          items: [
            { text: 'FormField', link: '/ui/form-field' },
            { text: 'FormInput', link: '/ui/form-input' },
            { text: 'FormTextarea', link: '/ui/form-textarea' },
            { text: 'FormCheckbox', link: '/ui/form-checkbox' },
            { text: 'FormCheckboxGroup', link: '/ui/form-checkbox-group' },
            { text: 'FormRadioGroup', link: '/ui/form-radio' },
            { text: 'FormSwitch', link: '/ui/form-switch' },
            { text: 'FormSelect', link: '/ui/form-select' },
            { text: 'FormCombobox', link: '/ui/form-combobox' },
            { text: 'FormRange', link: '/ui/form-range' },
            { text: 'FormCalendar', link: '/ui/form-calendar' },
            { text: 'FormDatepicker', link: '/ui/form-datepicker' },
            { text: 'FormTimepicker', link: '/ui/form-timepicker' },
            { text: 'FormToggleGroup', link: '/ui/form-toggle-group' }
          ]
        },
        {
          text: 'Navigation',
          items: [
            { text: 'AppMenu', link: '/ui/app-menu' },
            { text: 'AppMenubar', link: '/ui/app-menubar' },
            { text: 'AppContextMenu', link: '/ui/app-context-menu' },
            { text: 'AppTabs', link: '/ui/app-tabs' },
            { text: 'AppPagination', link: '/ui/app-pagination' }
          ]
        },
        {
          text: 'Overlays',
          items: [
            { text: 'AppDialog', link: '/ui/app-dialog' },
            { text: 'AppDrawer', link: '/ui/app-drawer' },
            { text: 'AppPopover', link: '/ui/app-popover' },
            { text: 'AppConfirm', link: '/ui/app-confirm' },
            { text: 'AppTooltip', link: '/ui/app-tooltip' },
            { text: 'AppFloating', link: '/ui/app-floating' }
          ]
        },
        {
          text: 'Feedback',
          items: [
            { text: 'AppAlert', link: '/ui/app-alert' },
            { text: 'AppToaster', link: '/ui/app-toaster' },
            { text: 'AppBadge', link: '/ui/app-badge' },
            { text: 'AppProgress', link: '/ui/app-progress' },
            { text: 'AppMeter', link: '/ui/app-meter' },
            { text: 'AppAsyncState', link: '/ui/app-async-state' },
            { text: 'AppEmptyState', link: '/ui/app-empty-state' },
            { text: 'AppSpinner', link: '/ui/app-spinner' },
            { text: 'AppDotMatrix', link: '/ui/app-dot-matrix' }
          ]
        },
        {
          text: 'Layout',
          items: [
            { text: 'AppGroup', link: '/ui/app-group' },
            { text: 'AppCard', link: '/ui/app-card' },
            { text: 'AppCollapsible', link: '/ui/app-collapsible' },
            { text: 'AppAccordion', link: '/ui/app-accordion' }
          ]
        },
        {
          text: 'Data',
          items: [
            { text: 'AppTable', link: '/ui/app-table' },
            { text: 'AppDataTable', link: '/ui/app-data-table' }
          ]
        },
        {
          text: 'Charts',
          items: [
            { text: 'Overview', link: '/ui/charts' },
            { text: 'AppChartArea', link: '/ui/app-chart-area' },
            { text: 'AppChartLine', link: '/ui/app-chart-line' },
            { text: 'AppChartBar', link: '/ui/app-chart-bar' },
            { text: 'AppChartDonut', link: '/ui/app-chart-donut' }
          ]
        },
        {
          text: 'Utilities',
          items: [
            { text: 'AppIcon', link: '/ui/app-icon' },
            { text: 'AppAppear', link: '/ui/app-appear' },
            { text: 'AppNumberFlow', link: '/ui/app-number-flow' },
            { text: 'Addon', link: '/ui/form-addon' },
            { text: 'Separator', link: '/ui/app-separator' },
            { text: 'Kbd', link: '/ui/kbd' },
            { text: 'Text shimmer', link: '/ui/app-text-shimmer' },
            { text: 'Inverted', link: '/ui/inverted' }
          ]
        }
      ],
      '/': [
        {
          text: 'Overview',
          items: [{ text: 'Get Started', link: '/get-started' }]
        },
        {
          text: 'Actions',
          items: [
            { text: 'Button', link: '/actions/button' },
            { text: 'Toggle group', link: '/actions/toggle-group' },
            { text: 'Copy', link: '/actions/copy' }
          ]
        },
        {
          text: 'Forms',
          items: [
            { text: 'Field', link: '/forms/field' },
            { text: 'Input', link: '/forms/input' },
            { text: 'Textarea', link: '/forms/textarea' },
            { text: 'Checkbox', link: '/forms/checkbox' },
            { text: 'Radio', link: '/forms/radio' },
            { text: 'Switch', link: '/forms/switch' },
            { text: 'Select', link: '/forms/select' },
            { text: 'Combobox', link: '/forms/combobox' },
            { text: 'Range', link: '/forms/range' },
            { text: 'Calendar', link: '/forms/calendar' },
            { text: 'Datepicker', link: '/forms/datepicker' },
            { text: 'Timepicker', link: '/forms/timepicker' }
          ]
        },
        {
          text: 'Navigation',
          items: [
            { text: 'Menu', link: '/navigation/menu' },
            { text: 'Menubar', link: '/navigation/menubar' },
            { text: 'Context menu', link: '/navigation/context-menu' },
            { text: 'Tabs', link: '/navigation/tabs' },
            { text: 'Pagination', link: '/navigation/pagination' }
          ]
        },
        {
          text: 'Overlays',
          items: [
            { text: 'Dialog', link: '/overlays/dialog' },
            { text: 'Drawer', link: '/overlays/drawer' },
            { text: 'Popover', link: '/overlays/popover' },
            { text: 'Tooltip', link: '/overlays/tooltip' },
            { text: 'Floating', link: '/overlays/floating' }
          ]
        },
        {
          text: 'Feedback',
          items: [
            { text: 'Alert', link: '/feedback/alert' },
            { text: 'Toast', link: '/feedback/toast' },
            { text: 'Badge', link: '/feedback/badge' },
            { text: 'Progress', link: '/feedback/progress' },
            { text: 'Meter', link: '/feedback/meter' },
            { text: 'Async state', link: '/feedback/async-state' }
          ]
        },
        {
          text: 'Layout',
          items: [
            { text: 'Group', link: '/layout/group' },
            { text: 'Collapsible', link: '/layout/collapsible' },
            { text: 'Accordion', link: '/layout/accordion' },
            { text: 'Scroll area', link: '/layout/scroll-area' },
            { text: 'Drag', link: '/layout/drag' }
          ]
        },
        {
          text: 'Data',
          items: [
            { text: 'Table', link: '/data/table' },
            { text: 'Data table', link: '/data/data-table' }
          ]
        },
        {
          text: 'Charts',
          items: [
            { text: 'Overview', link: '/data/charts/overview' },
            { text: 'Area', link: '/data/charts/area' },
            { text: 'Line', link: '/data/charts/line' },
            { text: 'Bar', link: '/data/charts/bar' },
            { text: 'Axes and grid', link: '/data/charts/axis' },
            { text: 'Donut', link: '/data/charts/donut' },
            { text: 'Legend', link: '/data/charts/legend' },
            { text: 'Tooltip', link: '/data/charts/tooltip' },
            { text: 'Colors', link: '/data/charts/colors' }
          ]
        },
        {
          text: 'Utilities',
          items: [
            { text: 'Icon', link: '/utilities/icon' },
            { text: 'Appear', link: '/utilities/appear' },
            { text: 'Deferred', link: '/utilities/deferred' },
            { text: 'Overlay parts', link: '/utilities/overlay' },
            { text: 'Addon', link: '/utilities/addon' },
            { text: 'Separator', link: '/utilities/separator' },
            { text: 'Theme', link: '/utilities/theme' },
            { text: 'Links', link: '/utilities/links' },
            { text: 'Click outside', link: '/utilities/click-outside' },
            { text: 'Virtual list', link: '/utilities/virtual-list' },
            { text: 'Local storage', link: '/utilities/local-storage' },
            { text: 'Download', link: '/utilities/download' }
          ]
        },
        {
          text: 'Helpers',
          items: [
            { text: 'Dates', link: '/helpers/dates' },
            { text: 'Numbers', link: '/helpers/numbers' },
            { text: 'Strings and CSV', link: '/helpers/strings' },
            { text: 'Functions', link: '/helpers/functions' },
            { text: 'Inline SVG', link: '/helpers/svg' }
          ]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/vunset/vunset' }]
  },
  vite: {
    server: { port: 5179 },
    plugins: [tailwindcss()],
    resolve: {
      alias: [{ find: '@', replacement: fileURLToPath(new URL('./theme', import.meta.url)) }, ...sourceAliases]
    }
  }
});

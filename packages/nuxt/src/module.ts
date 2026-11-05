import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { defu } from 'defu';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  addComponent,
  addImports,
  addPlugin,
  addServerImports,
  addTemplate,
  createResolver,
  defineNuxtModule,
  directoryToURL,
  resolveAlias,
  tryResolveModule,
  useLogger
} from '@nuxt/kit';
import { ENTRIES, UTILS } from './components.js';
import { buildSprite, readIcons } from './sprite.js';

const OWN = ['@vunset/vue', '@vunset/ui', '@vunset/utils'];

const isOwn = (id: string) => OWN.some((name) => id === name || id.startsWith(`${name}/`));

const toPath = (resolved: string) => (resolved.startsWith('file:') ? fileURLToPath(resolved) : resolved);

// The app doesn't list our packages, so pnpm or a `file:` link hides them from its resolution.
// Longest first: Vite and Nitro take the first match, and a bare name matches its subpaths.
function exportAliases(name: string, resolved: string): Record<string, string> {
  let dir = dirname(toPath(resolved));
  for (;;) {
    const manifest = join(dir, 'package.json');
    if (existsSync(manifest)) {
      const json = JSON.parse(readFileSync(manifest, 'utf8'));
      if (json.name === name) {
        const entries = Object.entries<string | Record<string, string>>(json.exports ?? {});
        entries.sort(([a], [b]) => b.length - a.length);
        return Object.fromEntries(
          entries.map(([key, target]) => {
            const file = typeof target === 'string' ? target : (target.import ?? target.default ?? '');
            return key.endsWith('/*')
              ? [`${name}${key.slice(1, -2)}`, join(dir, file.slice(0, -2))]
              : [`${name}${key.slice(1)}`, join(dir, file)];
          })
        );
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return {};
    dir = parent;
  }
}

// The later entry wins: ui's, where an app may not list vue.
const GLOBAL_TYPES: Record<string, string[]> = {
  '@vunset/vue': [
    'ListboxItem',
    'ListboxOption',
    'ListboxOptionValue',
    'ToggleGroupValue',
    'CheckboxGroupValue',
    'RadioValue',
    'CalendarValueInput',
    'Toast',
    'ToastOptions'
  ],
  '@vunset/ui': [
    'AppMenubarEntry',
    'AppMenuEntry',
    'AppToastData',
    'AppTab',
    'AppAccordionSection',
    'FormToggleOption',
    'FormCheckboxOption',
    'FormRadioOption'
  ],
  '@vunset/vue/data-table': ['DataTableColumn', 'DataTableColumnHelper'],
  '@vunset/ui/data-table': ['DataTableColumn', 'DataTableColumnHelper']
};

/** lightningcss' `Features.LightDark`. */
const LIGHT_DARK = 1 << 20;

const ICONS_DIR = '~/assets/icons';

export interface ModuleOptions {
  /**
   * Put before every component's name: `'Vs'` registers `<VsDialogRoot>` and
   * `<VsAppButton>`. Empty, each keeps its own name.
   * @default ''
   */
  prefix?: string;
  /** Registers `@vunset/vue`'s headless parts. @default true */
  vue?: boolean;
  /** Registers `@vunset/ui`'s components and adds its stylesheet. `false` leaves ui out. @default true */
  ui?: boolean;
  /** Adds `@vunset/ui/all.css`, before the app's own stylesheets. On with `ui`. */
  css?: boolean;
  /**
   * Adds `@vunset/ui/preflight.css`, before the app's own stylesheets: the reset
   * the components are built on, for an app without Tailwind, whose Preflight is one.
   * @default false
   */
  preflight?: boolean;
  /** Auto-imports the public composables: `useToast`, `useTheme`, `useClipboard`, ... @default true */
  composables?: boolean;
  /**
   * Auto-imports `@vunset/utils`' helpers (`formatDate`, `formatNumber`,
   * `calcTotal`, ...) in the app and in server routes, as a layer's `shared/utils` are.
   * @default true
   */
  utils?: boolean;
  /**
   * Where `Icon` and `AppIcon` find their icons, handed to `configureIcons` for the app.
   * `false` leaves icons to the app.
   */
  icons?: IconsOptions | false;
  /**
   * Sets up `useTheme` before the app's components and provides it as `$theme`.
   * With a `settings` object in `app.config` that has a `key`, the theme is
   * `settings.theme`, and all of `settings` is kept in `localStorage` under that key.
   * `false` leaves `useTheme` to the app. @default true
   */
  theme?: boolean | ThemeOptions;
}

export interface ThemeOptions {
  /** The choice before anything is stored. @default 'system' */
  default?: 'light' | 'dark' | 'system';
  /** The `localStorage` key, without `settings` in `app.config`; `null` remembers nothing. @default 'theme' */
  storageKey?: string | null;
  /** `<meta name="theme-color">` for each scheme; `settings.themeColor` in `app.config` wins. */
  themeColor?: { light: string; dark: string };
  /** Cross-fades the page on a change, where the browser can. @default true */
  viewTransition?: boolean;
}

export interface IconsOptions {
  /**
   * A folder of SVG files, drawn inline: `'~/assets/icons'`, or a path from the
   * app's source folder. Several, and the first with a name wins.
   * @default '~/assets/icons', where it exists
   */
  dir?: string | string[];
  /** Where the sprite is served from. @default '/sprite.svg' */
  sprite?: string;
  /**
   * A folder of SVG files to build the sprite from, served at `sprite` and
   * rebuilt as they change. Several, and the first with a name wins.
   * @default '~/assets/icons', where it exists and `sprite` isn't set
   */
  spriteDir?: string | string[];
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@vunset/nuxt',
    configKey: 'vunset',
    compatibility: { nuxt: '>=3.13.0' }
  },
  defaults: {
    prefix: '',
    theme: true,
    vue: true,
    composables: true,
    utils: true
  },
  async setup(options, nuxt) {
    const logger = useLogger('@vunset/nuxt');
    const resolver = createResolver(import.meta.url);
    const roots = [nuxt.options.rootDir, ...nuxt.options.modulesDir].map((dir) => directoryToURL(dir));
    // Our packages resolve from the module, peers such as TanStack from the app.
    const resolveFrom = (id: string) => tryResolveModule(id, isOwn(id) ? [new URL(import.meta.url)] : roots);
    const installed = async (id: string) => Boolean(await resolveFrom(id));
    const linked = async (id: string) => {
      const path = await resolveFrom(id);
      if (!path) return false;
      try {
        return !realpathSync(toPath(path)).includes(`${sep}node_modules${sep}`);
      } catch {
        return false;
      }
    };

    for (const name of OWN) {
      const path = await resolveFrom(name);
      if (!path) continue;
      for (const [id, target] of Object.entries(exportAliases(name, path))) nuxt.options.alias[id] ??= target;
    }

    const ui = options.ui ?? true;
    if (ui && !(await installed('@vunset/ui'))) {
      logger.warn('`ui` is on, but `@vunset/ui` is not installed: its components are left out.');
    }

    let missingPeers = false;
    const types = new Map<string, string>();

    for (const entry of ENTRIES) {
      if (entry.package === '@vunset/ui' && !ui) continue;
      if (!(await installed(entry.from))) continue;
      if (!(await Promise.all(entry.peers.map(installed))).every(Boolean)) {
        missingPeers = true;
        continue;
      }

      // `vue: false` leaves out the headless parts, not the composables ui is used with.
      const components = entry.package === '@vunset/vue' && !options.vue ? [] : entry.components;
      for (const name of components) {
        addComponent({
          name: `${options.prefix}${name}`,
          export: name,
          filePath: entry.from,
          priority: -1
        });
      }

      if (options.composables) {
        addImports(entry.composables.map((name) => ({ name, from: entry.from })));
      }
      for (const name of GLOBAL_TYPES[entry.from] ?? []) types.set(name, entry.from);

      // Pre-bundled to avoid a reload on first page, except peer entries (TanStack) and linked
      // packages, whose rebuilds Vite would otherwise never pick up.
      const optimizeDeps = (nuxt.options.vite.optimizeDeps ??= {});
      if (await linked(entry.from)) (optimizeDeps.exclude ??= []).push(entry.from);
      else if (entry.peers.length === 0) (optimizeDeps.include ??= []).push(entry.from);
    }

    addImports([...types].map(([name, from]) => ({ name, from, type: true })));

    // Peers are checked only here, so installing one restarts Nuxt.
    if (missingPeers && nuxt.options.dev) nuxt.options.watch.push(join(nuxt.options.rootDir, 'package.json'));

    if (options.composables) {
      addImports({ name: 'useInfinityFetch', from: resolver.resolve('./runtime/composables/use-infinity-fetch') });
    }

    // Under the app's own: a helper of the same name in its `utils` or `shared` wins.
    if (options.utils && (await installed('@vunset/utils'))) {
      const imports = UTILS.map((name) => ({ name, from: '@vunset/utils', priority: -1 }));
      addImports(imports);
      addServerImports(imports);
    }
    if (await linked('@vunset/utils')) ((nuxt.options.vite.optimizeDeps ??= {}).exclude ??= []).push('@vunset/utils');

    nuxt.options.build.transpile.push(resolver.resolve('./runtime'));
    addPlugin(resolver.resolve('./runtime/toasts'));
    addPlugin(resolver.resolve('./runtime/link'));
    addPlugin(resolver.resolve('./runtime/route-query'));

    if (options.theme !== false) {
      const runtime = nuxt.options.runtimeConfig.public;
      const theme = options.theme === true || options.theme === undefined ? {} : options.theme;
      runtime.vunset = defu(runtime.vunset as Record<string, unknown> | undefined, { theme });
      addPlugin(resolver.resolve('./runtime/theme'));
    }

    if (options.icons !== false) addIcons(options.icons ?? {});

    // First, so the app's `components` rules win; ui declares the layer order itself.
    if (ui && (options.css ?? true)) nuxt.options.css.unshift('@vunset/ui/all.css');
    if (ui && options.preflight) nuxt.options.css.unshift('@vunset/ui/preflight.css');

    // lightningcss rewrites `light-dark()` into variables that a `color-scheme` set on `<html>` never fills.
    if (ui) {
      const lightningcss = ((nuxt.options.vite.css ??= {}).lightningcss ??= {});
      lightningcss.exclude = (lightningcss.exclude ?? 0) | LIGHT_DARK;
    }

    function folders(option: string | string[] | undefined) {
      return [option ?? []].flat().map((folder) => {
        const path = resolveAlias(folder);
        const absolute = isAbsolute(path) ? path : resolve(nuxt.options.srcDir, path);
        if (!existsSync(absolute)) logger.warn(`The icons folder \`${folder}\` doesn't exist.`);
        return absolute;
      });
    }

    // Unasked for, so its absence isn't reported.
    function conventional() {
      const path = resolveAlias(ICONS_DIR);
      const absolute = isAbsolute(path) ? path : resolve(nuxt.options.srcDir, path);
      return existsSync(absolute) ? [absolute] : [];
    }

    function addIcons({ dir, sprite, spriteDir }: IconsOptions) {
      const inlineDirs = dir === undefined ? conventional() : folders(dir);
      // A `sprite` alone is one the app made itself: nothing is built over it.
      const spriteDirs = spriteDir !== undefined ? folders(spriteDir) : sprite === undefined ? conventional() : [];
      if (!options.icons && inlineDirs.length === 0 && spriteDirs.length === 0) return;

      // Templates are virtual, so the glob starts with `/`: Vite's root, the app's source folder.
      const root = nuxt.options.vite.root ?? nuxt.options.srcDir;
      const globs = inlineDirs.map((folder) => {
        const pattern = `/${relative(root, folder).replaceAll('\\', '/')}/*.svg`;
        return `...import.meta.glob(${JSON.stringify(pattern)}, { query: '?raw', import: 'default' })`;
      });

      // Written out because a glob takes no variable; in order, so the first folder wins.
      const template = addTemplate({
        filename: 'vunset-icons.mjs',
        getContents: () => `export const inline = ${globs.length > 0 ? `{ ${globs.join(', ')} }` : 'undefined'};\n`
      });
      nuxt.options.alias['#vunset/icons'] = template.dst;

      const url = sprite ?? '/sprite.svg';
      if (spriteDirs.length > 0) addSprite(spriteDirs, url);

      // A value, not `undefined`, which Nuxt would serve as `''`.
      const runtime = nuxt.options.runtimeConfig.public;
      runtime.vunset = defu(runtime.vunset as Record<string, unknown> | undefined, { icons: { sprite: url } });

      addPlugin(resolver.resolve('./runtime/icons'));
    }

    // A Nitro public asset, so it is served in dev and copied by every deploy preset.
    function addSprite(sources: string[], url: string) {
      if (!url.startsWith('/')) {
        logger.warn(`\`spriteDir\` builds a sprite the app serves, but \`sprite\` is \`${url}\`: give it a path.`);
        return;
      }

      const dir = join(nuxt.options.buildDir, 'vunset-sprite');
      const write = () => {
        const sprite = buildSprite(readIcons(sources));
        for (const name of sprite.invalid) logger.warn(`The icon \`${name}.svg\` has no <svg> in it.`);
        const file = join(dir, url);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, sprite.svg);
      };

      nuxt.hook('nitro:config', (config) => {
        const nitro = config as { publicAssets?: { dir: string; maxAge?: number }[] };
        (nitro.publicAssets ??= []).push({ dir, maxAge: 0 });
      });
      // Not sooner: the CLI empties the build folder once Nitro is set up.
      nuxt.hook('build:before', write);

      nuxt.hook('builder:watch', (_event, path) => {
        const file = resolve(nuxt.options.srcDir, path);
        if (file.endsWith('.svg') && sources.some((source) => file.startsWith(source + sep))) write();
      });
    }
  }
});

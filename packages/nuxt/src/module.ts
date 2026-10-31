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

/** The kit's own packages: dependencies of the module, so an app lists the module alone. */
const OWN = ['@vunset/vue', '@vunset/ui', '@vunset/utils'];

const isOwn = (id: string) => OWN.some((name) => id === name || id.startsWith(`${name}/`));

const toPath = (resolved: string) => (resolved.startsWith('file:') ? fileURLToPath(resolved) : resolved);

/**
 * An alias per entry a package exports, to the file the entry names: the app
 * imports `@vunset/vue` without listing it, so its own resolution would not
 * find it under pnpm or through a `file:` link. Longest first: Vite and Nitro
 * take the first alias that matches, and a bare name matches its subpaths too.
 */
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
            // `./css/*` maps a folder: the alias is its prefix.
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

/** Types an app uses without importing them, as Nuxt's own `Ref` is. The later entry wins: ui's, where an app may not list vue. */
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

/** Where `dir` and `spriteDir` look when they aren't set. */
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
    // The kit's packages are found from the module, which depends on them; a peer such as TanStack, from the app.
    const resolveFrom = (id: string) => tryResolveModule(id, isOwn(id) ? [new URL(import.meta.url)] : roots);
    const installed = async (id: string) => Boolean(await resolveFrom(id));
    // Linked from elsewhere (`file:` a checkout) rather than installed into `node_modules`.
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
      // A chart or data table needs its optional peers; without them, importing the entry fails.
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
          // An app's own component of the same name wins, without a warning.
          priority: -1
        });
      }

      if (options.composables) {
        addImports(entry.composables.map((name) => ({ name, from: entry.from })));
      }
      for (const name of GLOBAL_TYPES[entry.from] ?? []) types.set(name, entry.from);

      // Pre-bundled when the dev server starts, rather than found by the first page
      // and reloaded. Not the chart or data table, which would pull TanStack into every app.
      // A linked package is kept out: Vite would serve the copy it bundled once,
      // through every rebuild, where served as source a rebuild shows at once.
      const optimizeDeps = (nuxt.options.vite.optimizeDeps ??= {});
      if (await linked(entry.from)) (optimizeDeps.exclude ??= []).push(entry.from);
      else if (entry.peers.length === 0) (optimizeDeps.include ??= []).push(entry.from);
    }

    addImports([...types].map(([name, from]) => ({ name, from, type: true })));

    // Peers are looked for once, here: installing one restarts Nuxt, so its entry
    // registers without the dev server being stopped and started by hand.
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

    // A store per server request, carried to the page; see the plugin.
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

    // Before the app's own, so its `components` rules come after ui's and win. ui
    // declares Tailwind's layer order, so going first doesn't change how they rank.
    if (ui && (options.css ?? true)) nuxt.options.css.unshift('@vunset/ui/all.css');
    if (ui && options.preflight) nuxt.options.css.unshift('@vunset/ui/preflight.css');

    // Vite minifies CSS with lightningcss, which rewrites `light-dark()` for older
    // browsers into variables only a `color-scheme` in the same CSS sets. One set
    // on `<html>` by `useTheme()`, or none, leaves ui's colors invalid.
    if (ui) {
      const lightningcss = ((nuxt.options.vite.css ??= {}).lightningcss ??= {});
      lightningcss.exclude = (lightningcss.exclude ?? 0) | LIGHT_DARK;
    }

    /** The folders an option names, as absolute paths; a missing one is reported. */
    function folders(option: string | string[] | undefined) {
      return [option ?? []].flat().map((folder) => {
        const path = resolveAlias(folder);
        const absolute = isAbsolute(path) ? path : resolve(nuxt.options.srcDir, path);
        if (!existsSync(absolute)) logger.warn(`The icons folder \`${folder}\` doesn't exist.`);
        return absolute;
      });
    }

    /** The default folder, when the app has it: unasked for, its absence isn't reported. */
    function conventional() {
      const path = resolveAlias(ICONS_DIR);
      const absolute = isAbsolute(path) ? path : resolve(nuxt.options.srcDir, path);
      return existsSync(absolute) ? [absolute] : [];
    }

    function addIcons({ dir, sprite, spriteDir }: IconsOptions) {
      const inlineDirs = dir === undefined ? conventional() : folders(dir);
      // A `sprite` alone is one the app made itself: nothing is built over it.
      const spriteDirs = spriteDir !== undefined ? folders(spriteDir) : sprite === undefined ? conventional() : [];
      // Neither asked for nor there: the app's icons are its own business.
      if (!options.icons && inlineDirs.length === 0 && spriteDirs.length === 0) return;

      // Nuxt's templates are virtual, so a glob can't be relative to one: it starts
      // with `/`, from Vite's root, which is the app's source folder.
      const root = nuxt.options.vite.root ?? nuxt.options.srcDir;
      const globs = inlineDirs.map((folder) => {
        const pattern = `/${relative(root, folder).replaceAll('\\', '/')}/*.svg`;
        return `...import.meta.glob(${JSON.stringify(pattern)}, { query: '?raw', import: 'default' })`;
      });

      // Only the globs are written out: a glob takes no variable. Spread in order,
      // so the first folder's file comes first, and is found first.
      const template = addTemplate({
        filename: 'vunset-icons.mjs',
        getContents: () => `export const inline = ${globs.length > 0 ? `{ ${globs.join(', ')} }` : 'undefined'};\n`
      });
      nuxt.options.alias['#vunset/icons'] = template.dst;

      const url = sprite ?? '/sprite.svg';
      if (spriteDirs.length > 0) addSprite(spriteDirs, url);

      // The rest reaches the plugin through runtime config; an app's own value wins.
      // A value, not `undefined`, which Nuxt would serve as `''` and no variable could set.
      const runtime = nuxt.options.runtimeConfig.public;
      runtime.vunset = defu(runtime.vunset as Record<string, unknown> | undefined, { icons: { sprite: url } });

      addPlugin(resolver.resolve('./runtime/icons'));
    }

    // Built into the build folder and served from there, as a public asset: in
    // development, and copied to whatever output the deploy preset makes.
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

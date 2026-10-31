import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '../scripts/components';

const kit = vi.hoisted(() => ({
  components: [] as { name: string; export: string; filePath: string; priority?: number }[],
  imports: [] as { name: string; from: string; priority?: number }[],
  serverImports: [] as { name: string; from: string; priority?: number }[],
  warnings: [] as string[],
  templates: [] as { filename: string; getContents: () => string }[],
  plugins: [] as string[],
  srcDir: '',
  installed: new Set<string>(),
  // Where an id resolves, when not the default `node_modules` path.
  paths: {} as Record<string, string>,
  // Each lookup, and where it was looked up from.
  lookups: [] as { id: string; from: string }[]
}));

vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (definition: unknown) => definition,
  addComponent: (component: any) => kit.components.push(component),
  addImports: (imports: any) => kit.imports.push(...[imports].flat()),
  addServerImports: (imports: any) => kit.serverImports.push(...[imports].flat()),
  addTemplate: (template: any) => {
    kit.templates.push(template);
    return { dst: `/build/${template.filename}` };
  },
  addPlugin: (path: string) => kit.plugins.push(path),
  createResolver: () => ({ resolve: (path: string) => `/module/${path.replace(/^\.\//, '')}` }),
  resolveAlias: (path: string) => path.replace(/^~/, kit.srcDir),
  directoryToURL: (dir: string) => new URL(`file://${dir}/`),
  tryResolveModule: async (id: string, from: URL[]) => {
    kit.lookups.push({ id, from: String(from[0]) });
    return kit.installed.has(id) ? (kit.paths[id] ?? `/node_modules/${id}`) : undefined;
  },
  useLogger: () => ({ warn: (message: string) => kit.warnings.push(message) })
}));

const { default: module } = (await import('../src/module')) as any;

const ALL = [
  '@vunset/utils',
  '@vunset/vue',
  '@vunset/vue/chart',
  '@vunset/vue/data-table',
  '@vunset/ui',
  '@vunset/ui/chart',
  '@vunset/ui/data-table',
  '@tanstack/charts',
  '@tanstack/vue-table'
];

async function setup(
  options: Record<string, unknown> = {},
  installed = ALL,
  vite: Record<string, any> = {},
  runtimePublic: Record<string, any> = {},
  alias: Record<string, string> = {}
) {
  kit.components = [];
  kit.imports = [];
  kit.serverImports = [];
  kit.warnings = [];
  kit.templates = [];
  kit.plugins = [];
  kit.installed = new Set(installed);
  kit.lookups = [];
  const hooks: Record<string, (...args: any[]) => unknown> = {};
  const nuxt = {
    hook: (name: string, callback: (...args: any[]) => unknown) => (hooks[name] = callback),
    options: {
      dev: true,
      watch: [] as string[],
      rootDir: kit.srcDir,
      srcDir: kit.srcDir,
      buildDir: join(kit.srcDir, '.nuxt'),
      modulesDir: [join(kit.srcDir, 'node_modules')],
      css: ['~/assets/main.css'],
      alias: { ...alias } as Record<string, string>,
      runtimeConfig: { public: { ...runtimePublic } } as { public: Record<string, any> },
      build: { transpile: [] as string[] },
      vite
    }
  };
  await module.setup({ ...module.defaults, ...options }, nuxt);
  return { names: kit.components.map((component) => component.name), css: nuxt.options.css, vite, nuxt, hooks };
}

const from = (name: string) => kit.components.find((component) => component.name === name)?.filePath;

describe('the component list', () => {
  it('is what the packages export now', () => {
    // Stale, it would leave out a new component or register a removed one: `npm run build` rewrites it.
    expect(readFileSync(new URL('../src/components.ts', import.meta.url), 'utf8')).toBe(render());
  });
});

// An app with two icon folders, for the module to find; not the default one, which a test adds.
kit.srcDir = mkdtempSync(join(tmpdir(), 'vunset-nuxt-'));
mkdirSync(join(kit.srcDir, 'assets/glyphs'), { recursive: true });
mkdirSync(join(kit.srcDir, 'assets/brand'), { recursive: true });

describe('the module', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers both packages’ components under their own names', async () => {
    const { names } = await setup();
    expect(names).toContain('DialogRoot');
    expect(names).toContain('AppButton');
    expect(names).toContain('FormSelect');
    expect(names).toContain('Part');
    expect(from('DialogRoot')).toBe('@vunset/vue');
    expect(from('AppButton')).toBe('@vunset/ui');
    // The names are the exports', so none is a constant or a helper.
    expect(names).not.toContain('UI_ICONS');
    expect(names).not.toContain('formatNumber');
  });

  it('lets an app’s own component of the same name win', async () => {
    await setup();
    expect(kit.components.every((component) => component.priority === -1)).toBe(true);
  });

  it('puts a prefix before every name, when given one', async () => {
    const { names } = await setup({ prefix: 'Vs' });
    expect(names).toContain('VsDialogRoot');
    expect(names).toContain('VsAppButton');
    expect(names.every((name) => name.startsWith('Vs'))).toBe(true);
    // Still imported by the export's own name.
    expect(kit.components.find((component) => component.name === 'VsAppButton')?.export).toBe('AppButton');
  });

  it('registers a chart or data table only with its peers installed', async () => {
    const all = (await setup()).names;
    expect(all).toContain('ChartArea');
    expect(all).toContain('DataTable');
    expect(all).toContain('AppDataTable');

    const none = (await setup({}, ['@vunset/vue', '@vunset/ui'])).names;
    expect(none).not.toContain('ChartArea');
    expect(none).not.toContain('DataTable');
    expect(none).not.toContain('AppDataTable');
    expect(none).toContain('AppButton');

    // The entry alone is not enough: it needs TanStack Charts beside it.
    const half = (await setup({}, ['@vunset/vue', '@vunset/vue/chart'])).names;
    expect(half).not.toContain('ChartArea');
  });

  it('registers ui’s charts with TanStack Charts installed and ui on', async () => {
    expect((await setup()).names).toEqual(expect.arrayContaining(['AppChartArea', 'AppChartLine', 'AppChartBar', 'AppChartDonut']));

    const noPeer = (await setup({}, ['@vunset/vue', '@vunset/vue/chart', '@vunset/ui', '@vunset/ui/chart'])).names;
    expect(noPeer).not.toContain('AppChartArea');
    expect(noPeer).toContain('AppButton');

    const noUi = (await setup({ ui: false })).names;
    expect(noUi).not.toContain('AppChartArea');
    expect(noUi).toContain('ChartRoot');
  });

  it('makes DataTableColumn a global type with the data table, from ui’s entry when ui is on', async () => {
    const column = () => kit.imports.filter((entry: any) => entry.type && entry.name === 'DataTableColumn');

    await setup();
    expect(column()).toEqual([{ name: 'DataTableColumn', from: '@vunset/ui/data-table', type: true }]);

    await setup({ ui: false });
    expect(column()).toEqual([{ name: 'DataTableColumn', from: '@vunset/vue/data-table', type: true }]);

    await setup({}, ['@vunset/vue', '@vunset/vue/data-table', '@vunset/ui', '@vunset/ui/data-table']);
    expect(column()).toEqual([]);
  });

  it('makes the types an app writes itself global, ui’s only with ui', async () => {
    const types = (from: string) =>
      kit.imports.filter((entry: any) => entry.type && entry.from === from).map((entry: any) => entry.name);

    await setup();
    expect(types('@vunset/ui')).toEqual([
      'AppMenubarEntry',
      'AppMenuEntry',
      'AppToastData',
      'AppTab',
      'AppAccordionSection',
      'FormToggleOption',
      'FormCheckboxOption',
      'FormRadioOption'
    ]);
    expect(types('@vunset/vue')).toEqual(expect.arrayContaining(['ListboxItem', 'ListboxOption', 'Toast']));

    await setup({ ui: false });
    expect(types('@vunset/ui')).toEqual([]);
  });

  it('restarts on a change to package.json while a peer is missing, so installing it registers its entry', async () => {
    const packageJson = join(kit.srcDir, 'package.json');
    expect((await setup({}, ['@vunset/vue', '@vunset/vue/chart', '@vunset/ui'])).nuxt.options.watch).toEqual([
      packageJson
    ]);
    expect((await setup()).nuxt.options.watch).toEqual([]);
  });

  it('has ui on unless told otherwise, as it comes with the module', async () => {
    expect((await setup()).names).toContain('AppButton');
    expect(kit.warnings).toEqual([]);

    const { names, css } = await setup({ ui: false });
    expect(names).toContain('DialogRoot');
    expect(kit.components.some((component) => component.filePath.startsWith('@vunset/ui'))).toBe(false);
    expect(css).toEqual(['~/assets/main.css']);
  });

  it('says so when ui is on but cannot be found, and leaves it out', async () => {
    const { names } = await setup({}, ['@vunset/vue']);
    expect(names).not.toContain('AppButton');
    expect(kit.warnings).toHaveLength(1);
  });

  it('can leave either package out', async () => {
    const noUi = (await setup({ ui: false })).names;
    expect(noUi).toContain('DialogRoot');
    expect(noUi).not.toContain('AppButton');

    const noVue = (await setup({ vue: false })).names;
    expect(noVue).toContain('AppButton');
    expect(noVue).not.toContain('DialogRoot');
    // The composables stay: AppToaster is fed by `useToast`.
    expect(kit.imports.map((entry) => entry.name)).toContain('useToast');
  });

  it('adds ui’s stylesheet before the app’s own, unless told not to', async () => {
    expect((await setup()).css).toEqual(['@vunset/ui/all.css', '~/assets/main.css']);
    expect((await setup({ css: false })).css).toEqual(['~/assets/main.css']);
  });

  it('adds the reset before everything, only when asked to', async () => {
    expect((await setup({ preflight: true })).css).toEqual([
      '@vunset/ui/preflight.css',
      '@vunset/ui/all.css',
      '~/assets/main.css'
    ]);
    expect((await setup({ preflight: true, ui: false })).css).toEqual(['~/assets/main.css']);
  });

  it('auto-imports the public composables, unless told not to', async () => {
    await setup();
    expect(kit.imports).toContainEqual({ name: 'useToast', from: '@vunset/vue' });
    expect(kit.imports.map((entry) => entry.name)).toEqual(
      expect.arrayContaining(['useTheme', 'useClipboard', 'useValidate', 'useVirtualList'])
    );

    await setup({ composables: false });
    expect(kit.imports.filter((entry) => entry.name.startsWith('use'))).toEqual([]);
  });

  it('has Vite pre-bundle the main entries, not the chart or data table', async () => {
    expect((await setup()).vite.optimizeDeps.include).toEqual(['@vunset/vue', '@vunset/ui']);
    expect((await setup({ ui: false })).vite.optimizeDeps.include).toEqual(['@vunset/vue']);
  });

  it('leaves a linked package to be served as source, so a rebuild of it shows', async () => {
    // A `file:` link: the package's real path is a checkout, outside any `node_modules`.
    const checkout = mkdtempSync(join(tmpdir(), 'vunset-checkout-'));
    kit.paths = { '@vunset/ui': checkout, '@vunset/utils': checkout };
    try {
      const { optimizeDeps } = (await setup()).vite;
      expect(optimizeDeps.include).toEqual(['@vunset/vue']);
      // Excluded outright: Vite's own scan would bundle it otherwise.
      expect(optimizeDeps.exclude).toEqual(['@vunset/ui', '@vunset/utils']);
    } finally {
      kit.paths = {};
    }
  });

  it('finds its own packages from itself, and a peer from the app', async () => {
    await setup();
    const from = (id: string) => kit.lookups.find((lookup) => lookup.id === id)!.from;

    // The app need not list them: they are the module's dependencies.
    expect(from('@vunset/vue')).toMatch(/\/src\/module\.ts$/);
    expect(from('@vunset/ui/data-table')).toMatch(/\/src\/module\.ts$/);
    expect(from('@tanstack/charts')).toBe(`file://${kit.srcDir}/`);
  });

  it('aliases every entry of its packages, so the app resolves them without listing them', async () => {
    const source = (name: string) => fileURLToPath(new URL(`../../${name}/src/index.ts`, import.meta.url));
    kit.paths = { '@vunset/vue': source('vue'), '@vunset/ui': source('ui'), '@vunset/utils': source('utils') };
    try {
      const { alias } = (await setup()).nuxt.options;
      const packages = fileURLToPath(new URL('../../', import.meta.url));

      expect(alias['@vunset/vue']).toBe(join(packages, 'vue/dist/index.js'));
      expect(alias['@vunset/vue/chart']).toBe(join(packages, 'vue/dist/chart.js'));
      expect(alias['@vunset/ui/all.css']).toBe(join(packages, 'ui/dist/all.css'));
      expect(alias['@vunset/ui/css']).toBe(join(packages, 'ui/dist/css'));
      expect(alias['@vunset/utils']).toBe(join(packages, 'utils/dist/index.js'));

      // A subpath before its bare name: the first alias to match wins, and the bare name matches it too.
      const keys = Object.keys(alias);
      expect(keys.indexOf('@vunset/vue/chart')).toBeLessThan(keys.indexOf('@vunset/vue'));
      expect(keys.indexOf('@vunset/ui/data-table')).toBeLessThan(keys.indexOf('@vunset/ui'));
    } finally {
      kit.paths = {};
    }
  });

  it('leaves an alias the app set itself', async () => {
    const source = fileURLToPath(new URL('../../vue/src/index.ts', import.meta.url));
    kit.paths = { '@vunset/vue': source };
    try {
      const { alias } = (await setup({}, ALL, {}, {}, { '@vunset/vue': '/my/copy' })).nuxt.options;
      expect(alias['@vunset/vue']).toBe('/my/copy');
      expect(alias['@vunset/vue/chart']).toMatch(/vue\/dist\/chart\.js$/);
    } finally {
      kit.paths = {};
    }
  });

  it('adds the plugin that gives each server request a toast store of its own', async () => {
    const { nuxt } = await setup();
    expect(kit.plugins).toContain('/module/runtime/toasts');
    expect(kit.plugins).toContain('/module/runtime/link');
    expect(kit.plugins).toContain('/module/runtime/route-query');
    expect(nuxt.options.build.transpile).toEqual(['/module/runtime']);
  });

  it('sets the theme up with a plugin providing $theme, its options through runtime config', async () => {
    const { nuxt } = await setup({ theme: { default: 'dark', viewTransition: false } });
    expect(kit.plugins).toContain('/module/runtime/theme');
    expect(nuxt.options.runtimeConfig.public.vunset).toEqual({ theme: { default: 'dark', viewTransition: false } });

    const off = await setup({ theme: false });
    expect(kit.plugins).not.toContain('/module/runtime/theme');
    expect(off.nuxt.options.runtimeConfig.public.vunset).toBeUndefined();
  });

  it('auto-imports useInfinityFetch from its own runtime', async () => {
    await setup();
    expect(kit.imports).toContainEqual({
      name: 'useInfinityFetch',
      from: '/module/runtime/composables/use-infinity-fetch'
    });
  });

  it('auto-imports utils’ helpers in the app and on the server, under the app’s own', async () => {
    await setup();
    for (const imports of [kit.imports, kit.serverImports]) {
      expect(imports).toContainEqual({ name: 'formatISO', from: '@vunset/utils', priority: -1 });
      expect(imports).toContainEqual({ name: 'calcTotal', from: '@vunset/utils', priority: -1 });
      expect(imports).toContainEqual({ name: 'formatCsv', from: '@vunset/utils', priority: -1 });
    }
    // Types and the composables aren't the server's.
    expect(kit.serverImports.every((entry) => entry.from === '@vunset/utils')).toBe(true);
  });

  it('leaves the helpers out when told, or when utils isn’t installed', async () => {
    await setup({ utils: false });
    expect(kit.serverImports).toEqual([]);
    await setup(
      {},
      ALL.filter((id) => id !== '@vunset/utils')
    );
    expect(kit.serverImports).toEqual([]);
    expect(kit.imports.some((entry) => entry.from === '@vunset/utils')).toBe(false);
  });

  it('keeps Vite from rewriting `light-dark()`, which ui’s colors are written in', async () => {
    const LIGHT_DARK = 1 << 20;
    expect((await setup()).vite.css.lightningcss.exclude).toBe(LIGHT_DARK);
    // What the app excludes itself stays excluded.
    expect((await setup({}, ALL, { css: { lightningcss: { exclude: 1 } } })).vite.css.lightningcss.exclude).toBe(
      LIGHT_DARK | 1
    );
    // Without ui, nothing of the app's CSS is touched.
    expect((await setup({ ui: false })).vite.css).toBeUndefined();
  });
});

describe('icons', () => {
  const globs = () => kit.templates.find((template) => template.filename === 'vunset-icons.mjs')?.getContents();

  it('configures nothing unless asked, without `~/assets/icons`', async () => {
    await setup();
    expect(kit.plugins).not.toContain('/module/runtime/icons');
    expect(kit.templates).toEqual([]);
    expect(kit.warnings).toEqual([]);
  });

  describe('with `~/assets/icons`', () => {
    const folder = join(kit.srcDir, 'assets/icons');
    beforeEach(() => mkdirSync(folder, { recursive: true }));
    afterEach(() => rmSync(folder, { recursive: true, force: true }));

    it('draws from it and builds the sprite from it, unasked', async () => {
      const { hooks } = await setup();
      expect(kit.plugins).toContain('/module/runtime/icons');
      expect(globs()).toContain('import.meta.glob("/assets/icons/*.svg"');
      expect(hooks['build:before']).toBeDefined();
    });

    it('builds nothing over a sprite the app made', async () => {
      const { hooks } = await setup({ icons: { sprite: 'https://cdn.example.com/icons.svg' } });
      expect(globs()).toContain('import.meta.glob("/assets/icons/*.svg"');
      expect(hooks['build:before']).toBeUndefined();
      expect(kit.warnings).toEqual([]);
    });

    it('gives way to a folder the app names', async () => {
      await setup({ icons: { dir: 'assets/glyphs' } });
      expect(globs()).not.toContain('/assets/icons/');
    });

    it('is left alone with `icons: false`', async () => {
      await setup({ icons: false });
      expect(kit.plugins).not.toContain('/module/runtime/icons');
    });
  });

  it('adds the runtime plugin, which hands them to `configureIcons`, so the app calls nothing', async () => {
    const { nuxt } = await setup({ icons: { dir: 'assets/glyphs', sprite: '/icons.svg' } });
    expect(kit.plugins).toContain('/module/runtime/icons');
    expect(nuxt.options.build.transpile).toContain('/module/runtime');
    // The sprite goes through runtime config; the folder, globbed, through a template.
    expect(nuxt.options.runtimeConfig.public.vunset).toEqual({ theme: {}, icons: { sprite: '/icons.svg' } });
    expect(nuxt.options.alias['#vunset/icons']).toBe('/build/vunset-icons.mjs');
    // From Vite's root, the app's source folder: the template is virtual, so nothing is relative to it.
    expect(globs()).toBe(
      `export const inline = { ...import.meta.glob("/assets/glyphs/*.svg", { query: '?raw', import: 'default' }) };\n`
    );
    expect(kit.warnings).toEqual([]);
  });

  it('takes an alias', async () => {
    await setup({ icons: { dir: '~/assets/glyphs' } });
    expect(globs()).toContain('import.meta.glob("/assets/glyphs/*.svg"');
  });

  it('takes several folders, in order, so the first with a name wins', async () => {
    await setup({ icons: { dir: ['assets/brand', 'assets/glyphs'] } });
    const contents = globs()!;
    expect(contents.indexOf('assets/brand')).toBeGreaterThan(-1);
    expect(contents.indexOf('assets/brand')).toBeLessThan(contents.indexOf('assets/glyphs'));
  });

  it('takes a sprite alone', async () => {
    await setup({ icons: { sprite: '/icons.svg' } });
    expect(globs()).toBe('export const inline = undefined;\n');
  });

  it('puts the default sprite in runtime config, so a variable can change it', async () => {
    // Left out, Nuxt would serve it as `''`, and `Icon` would look for `#name` in the page.
    const { nuxt } = await setup({ icons: { dir: 'assets/glyphs' } });
    expect(nuxt.options.runtimeConfig.public.vunset.icons.sprite).toBe('/sprite.svg');
  });

  it('leaves a sprite the app set in runtime config', async () => {
    const { nuxt } = await setup(
      { icons: { sprite: '/icons.svg' } },
      ALL,
      {},
      { vunset: { icons: { sprite: '/cdn.svg' } } }
    );
    expect(nuxt.options.runtimeConfig.public.vunset.icons.sprite).toBe('/cdn.svg');
  });

  it('says so when a folder is missing', async () => {
    await setup({ icons: { dir: 'assets/nope' } });
    expect(kit.warnings).toEqual(["The icons folder `assets/nope` doesn't exist."]);
  });
});

describe('a sprite built from a folder', () => {
  const STAR = '<svg viewBox="0 0 24 24"><path fill="#000" d="M0 0"/></svg>';
  const sprites = join(kit.srcDir, 'assets/sprite');
  mkdirSync(sprites, { recursive: true });
  writeFileSync(join(sprites, 'star.svg'), STAR);

  const built = (url = '/sprite.svg') => join(kit.srcDir, '.nuxt/vunset-sprite', url);

  it('is built as the build starts, and served from the build folder as a public asset', async () => {
    rmSync(join(kit.srcDir, '.nuxt'), { recursive: true, force: true });
    const { hooks, nuxt } = await setup({ icons: { spriteDir: 'assets/sprite' } });
    const nitro: { publicAssets?: { dir: string }[] } = {};
    hooks['nitro:config']!(nitro);
    // Not yet: the CLI empties the build folder after Nitro is set up.
    expect(existsSync(built())).toBe(false);

    hooks['build:before']!();
    expect(readFileSync(built(), 'utf8')).toContain('<symbol id="star" fill="currentColor" viewBox="0 0 24 24">');
    expect(nitro.publicAssets).toEqual([{ dir: join(kit.srcDir, '.nuxt/vunset-sprite'), maxAge: 0 }]);
    // `Icon` asks for it where it is served: the default.
    expect(nuxt.options.runtimeConfig.public.vunset.icons.sprite).toBe('/sprite.svg');
  });

  it('is served at `sprite`, when that names another path', async () => {
    const { hooks, nuxt } = await setup({ icons: { spriteDir: 'assets/sprite', sprite: '/icons/all.svg' } });
    hooks['build:before']!();
    expect(existsSync(built('/icons/all.svg'))).toBe(true);
    expect(nuxt.options.runtimeConfig.public.vunset.icons.sprite).toBe('/icons/all.svg');
  });

  it('is rebuilt when a file in its folder changes, and only then', async () => {
    const { hooks } = await setup({ icons: { spriteDir: 'assets/sprite' } });
    hooks['build:before']!();

    writeFileSync(join(sprites, 'bell.svg'), STAR);
    hooks['builder:watch']!('add', 'assets/icons/bell.svg');
    expect(readFileSync(built(), 'utf8')).not.toContain('id="bell"');

    hooks['builder:watch']!('add', 'assets/sprite/bell.svg');
    expect(readFileSync(built(), 'utf8')).toContain('id="bell"');
    rmSync(join(sprites, 'bell.svg'));
  });

  it('is not built when `sprite` is a URL elsewhere, which the app cannot serve', async () => {
    const { hooks } = await setup({ icons: { spriteDir: 'assets/sprite', sprite: 'https://cdn.example/sprite.svg' } });
    expect(hooks['nitro:config']).toBeUndefined();
    expect(hooks['build:before']).toBeUndefined();
    expect(kit.warnings).toHaveLength(1);
  });
});

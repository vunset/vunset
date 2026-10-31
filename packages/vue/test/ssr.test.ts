import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Component } from 'vue';
import type { SSRContext } from 'vue/server-renderer';

// Every docs demo is a real composition of the parts, so together they are
// the fixture: each renders on the "server", then hydrates in jsdom. The demos
// start closed; `ssr/` holds the open states.
const demos = {
  ...import.meta.glob<{ default: Component }>('../../../docs/.vitepress/demos/**/*.vue'),
  ...import.meta.glob<{ default: Component }>('./ssr/*.vue')
};

type Vue = typeof import('vue');

/**
 * A fresh Vue, and with it fresh copies of the parts and the demo: Vue reports
 * "contains mismatches" once per runtime, so a shared one would let a demo's
 * mismatch go unreported after the first.
 */
async function fresh(load: () => Promise<{ default: Component }>) {
  vi.resetModules();
  const vue: Vue = await import('vue');
  const { renderToString } = await import('vue/server-renderer');
  const demo = (await load()).default;
  // Docs-only, registered globally by the docs theme.
  const DemoOutput = vue.defineComponent(
    (_, { slots }) =>
      () =>
        vue.h('output', slots.default?.())
  );
  const createApp = () => {
    const app = vue.createSSRApp(demo);
    app.component('DemoOutput', DemoOutput);
    return app;
  };
  return { vue, renderToString, createApp };
}

type Fresh = Awaited<ReturnType<typeof fresh>>;

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  // Where Vue's last teleport into `body` ended; a page load starts without it.
  delete (document.body as { _lpa?: unknown })._lpa;
});

async function renderOnServer({ createApp, renderToString }: Fresh) {
  const errors: unknown[] = [];
  const app = createApp();
  app.config.errorHandler = (error) => errors.push(error);
  const context: SSRContext = {};

  vi.stubGlobal('document', undefined);
  vi.stubGlobal('window', undefined);
  let html = '';
  try {
    html = await renderToString(app, context);
  } catch (error) {
    errors.push(error);
  } finally {
    vi.unstubAllGlobals();
  }
  return { html, errors, teleports: (context.teleports ?? {}) as Record<string, string> };
}

async function hydrate({ createApp, vue }: Fresh, html: string, teleports: Record<string, string>) {
  const warnings: string[] = [];
  const errors: unknown[] = [];

  // The page a server sends, laid out as Nuxt's is: the app, then the
  // container a `Portal` teleports into.
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  const portals = document.createElement('div');
  portals.id = 'teleports';
  portals.innerHTML = teleports['#teleports'] ?? '';
  document.body.append(portals);
  // Vue hydrates a teleport into `body` from its first child on, so that is
  // where a server page has to put it.
  if (teleports.body) document.body.insertAdjacentHTML('afterbegin', teleports.body);

  const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => warnings.push(args.join(' ')));
  const consoleWarn = vi
    .spyOn(console, 'warn')
    .mockImplementation((...args) => warnings.push(args.map(String).join(' ')));
  const app = createApp();
  app.config.errorHandler = (error) => errors.push(error);
  app.config.warnHandler = (message) => warnings.push(message);
  app.mount(container);
  await vue.nextTick();
  consoleError.mockRestore();
  consoleWarn.mockRestore();
  app.unmount();

  return { warnings: warnings.filter((message) => /hydration/i.test(message)), errors };
}

async function check(load: () => Promise<{ default: Component }>) {
  const env = await fresh(load);
  const server = await renderOnServer(env);
  const client = await hydrate(env, server.html, server.teleports);
  return { server, client };
}

describe('server rendering', () => {
  it('catches a mismatch (the harness itself)', async () => {
    const { client } = await check(async () => {
      const { defineComponent, h } = await import('vue');
      return { default: defineComponent(() => () => h('p', typeof window === 'undefined' ? 'server' : 'client')) };
    });
    expect(client.warnings.length).toBeGreaterThan(0);
  });

  it('catches a mismatch Vue reports without details, after another (the harness itself)', async () => {
    // A component rendering `''` leaves nothing on the server; Vue only says
    // "contains mismatches", once per runtime, so this needs a fresh one.
    const { client } = await check(async () => {
      const { defineComponent, h, Fragment, createCommentVNode } = await import('vue');
      const Empty = defineComponent(() => () => '');
      return {
        default: defineComponent(() => () => h('div', [h(Fragment, null, [h(Empty)]), createCommentVNode('v-if')]))
      };
    });
    expect(client.warnings).toContain('Hydration completed but contains mismatches.');
  });

  it('hydrates a teleport into body (the harness itself)', async () => {
    const { client } = await check(async () => {
      const { defineComponent, h, Teleport } = await import('vue');
      return { default: defineComponent(() => () => [h('button'), h(Teleport, { to: 'body' }, h('p', 'teleported'))]) };
    });
    expect(client.warnings).toEqual([]);
  });

  it('teleports to #teleports, for the page to put in its container', async () => {
    const env = await fresh(() => import('./ssr/OpenDialog.vue'));
    const { teleports } = await renderOnServer(env);
    expect(teleports['#teleports']).toContain('role="dialog"');
    expect(teleports.body).toBeUndefined();
  });

  it('catches a document read on the server (the harness itself)', async () => {
    const { server } = await check(async () => {
      const { defineComponent, h } = await import('vue');
      return { default: defineComponent(() => () => h('p', document.title)) };
    });
    expect(server.errors.length).toBeGreaterThan(0);
  });

  for (const [path, load] of Object.entries(demos)) {
    const name = path
      .replace('../../../docs/.vitepress/demos/', 'docs/')
      .replace('./ssr/', 'open/');

    it(`${name} renders without a document and hydrates cleanly`, async () => {
      const { server, client } = await check(load);
      expect(server.errors).toEqual([]);
      expect(client.errors).toEqual([]);
      expect(client.warnings).toEqual([]);
    });
  }
});

describe('one server request to the next', () => {
  it('keeps the shared toast store out of a server render', async () => {
    // One module instance for both requests, as a server process has.
    vi.resetModules();
    const vue: Vue = await import('vue');
    const { renderToString } = await import('vue/server-renderer');
    const { useToast, defaultToastStore, ToastViewport, ToastRoot, ToastTitle } = await import('../src');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    async function request(component: Component) {
      vi.stubGlobal('document', undefined);
      vi.stubGlobal('window', undefined);
      try {
        return await renderToString(vue.createSSRApp(component));
      } finally {
        vi.unstubAllGlobals();
      }
    }

    await request(
      vue.defineComponent(() => {
        useToast().setToast({ title: 'For the first request only' });
        return () => vue.h('p');
      })
    );
    const html = await request(
      vue.defineComponent(
        () => () =>
          vue.h(ToastViewport as any, null, () => vue.h(ToastRoot as any, null, () => vue.h(ToastTitle as any)))
      )
    );

    expect(html).not.toContain('For the first request only');
    expect(defaultToastStore.toasts.value).toEqual([]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('numbers toasts per store', async () => {
    const { createToastStore } = await import('../src');
    createToastStore().add({ title: 'a' });
    expect(createToastStore().add({ title: 'b' })).toBe('toast-1');
  });
});

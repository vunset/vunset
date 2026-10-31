import { describe, it, expect, afterEach } from 'vitest';
import { createApp, defineComponent, h, nextTick, isVNode, type Component, type ComponentInternalInstance, type VNode } from 'vue';
import * as index from '../src';
import * as chart from '../src/chart';
import * as dataTable from '../src/data-table';

// The styling contract: every element a part renders carries `data-part`.
// Every docs demo, and the open states in `ssr/`, is the fixture.
const demos = {
  ...import.meta.glob<{ default: Component }>('../../../docs/.vitepress/demos/**/*.vue'),
  ...import.meta.glob<{ default: Component }>('./ssr/*.vue')
};

// Renders nothing of its own, or only what the app hands it.
const EXEMPT = new Set<string>([
  'Portal', // a teleport
  'TooltipGroup', // renders only its slot
  'Part' // renders the parts above it
]);

const parts = new Map<unknown, string>();
for (const entry of [index, chart, dataTable]) {
  for (const [name, value] of Object.entries(entry)) {
    if (value && typeof value === 'object' && ('setup' in value || 'render' in value || '__name' in value)) parts.set(value, name);
  }
}

function collect(vnode: VNode, found: Map<string, string>) {
  const instance = vnode.component as ComponentInternalInstance | null;
  if (instance) {
    const name = parts.get(instance.type);
    const el = instance.subTree?.el;
    if (name && !EXEMPT.has(name) && el instanceof Element && !el.hasAttribute('data-part')) {
      found.set(name, el.outerHTML.slice(0, 120));
    }
    collect(instance.subTree, found);
    return;
  }
  if (Array.isArray(vnode.children)) {
    for (const child of vnode.children) if (isVNode(child)) collect(child, found);
  }
  if (vnode.suspense?.activeBranch) collect(vnode.suspense.activeBranch, found);
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('data-part', () => {
  for (const [path, load] of Object.entries(demos)) {
    const name = path.replace('../../../docs/.vitepress/demos/', 'docs/').replace('./ssr/', 'open/');

    it(`${name}: every part's element carries one`, async () => {
      const demo = (await load()).default;
      const container = document.createElement('div');
      document.body.append(container);
      const app = createApp(demo);
      app.component('DemoOutput', defineComponent((_, { slots }) => () => h('output', slots.default?.())));
      app.config.warnHandler = () => {};
      const root = app.mount(container);
      await nextTick();
      await nextTick();

      const found = new Map<string, string>();
      collect(root.$.subTree, found);
      app.unmount();

      expect(Object.fromEntries(found)).toEqual({});
    });
  }
});

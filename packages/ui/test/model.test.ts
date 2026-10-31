import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Component } from 'vue';
import {
  AppAccordion,
  AppCollapsible,
  AppContextMenu,
  AppDialog,
  AppDrawer,
  AppFloating,
  AppMenu,
  AppPopover,
  AppTabs,
  AppTooltip,
  FormCheckbox,
  FormCombobox,
  FormDatepicker,
  FormRange,
  FormSelect,
  FormSwitch
} from '../src';

// A wrapper hands its `v-model` on only when bound: bound, an empty ref still makes the part controlled;
// unbound, the part keeps its own state.

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  vi.restoreAllMocks();
});

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

function mountModel(
  component: Component,
  prop: string,
  props: Record<string, unknown>,
  slots: Record<string, any> = {}
) {
  const model = ref<unknown>(undefined);
  const Host = defineComponent({
    setup: () => () =>
      h(
        component as any,
        { ...props, [prop]: model.value, [`onUpdate:${prop}`]: (value: unknown) => (model.value = value) },
        slots
      )
  });
  wrapper = mount(Host, { attachTo: document.body });
  return model;
}

// An open overlay is teleported out of the app, carrying `data-open`.
const popup = () => [...document.querySelectorAll('[data-open]')].some((el) => !el.closest('[data-v-app]'));
const attr = (selector: string, name: string) => () => document.querySelector(selector)?.getAttribute(name) ?? null;
const trigger = { trigger: () => h('button', { type: 'button' }, 'Open') };
const SECTIONS = [
  { value: 'a', title: 'A' },
  { value: 'b', title: 'B' }
];

// [component, prop, its props, its slots, a value to set, what shows it, the reading while empty, then once set]
const WRAPPERS: [
  string,
  Component,
  string,
  Record<string, unknown>,
  Record<string, any>,
  unknown,
  () => unknown,
  unknown,
  unknown
][] = [
  [
    'AppAccordion',
    AppAccordion,
    'modelValue',
    { sections: SECTIONS },
    {},
    ['b'],
    () => document.querySelector('[aria-expanded="true"]')?.textContent?.trim() ?? null,
    null,
    'B'
  ],
  [
    'AppTabs',
    AppTabs,
    'modelValue',
    { tabs: ['a', 'b'] },
    {},
    'b',
    () => document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
    'a',
    'b'
  ],
  [
    'FormCheckbox',
    FormCheckbox,
    'modelValue',
    { label: 'L' },
    {},
    true,
    attr('[role="checkbox"]', 'aria-checked'),
    'false',
    'true'
  ],
  [
    'FormSwitch',
    FormSwitch,
    'modelValue',
    { label: 'L' },
    {},
    true,
    attr('[role="switch"]', 'aria-checked'),
    'false',
    'true'
  ],
  [
    'FormRange',
    FormRange,
    'modelValue',
    { label: 'L' },
    {},
    40,
    () => document.querySelector<HTMLInputElement>('input[type="range"]')?.value,
    '0',
    '40'
  ],
  [
    'AppCollapsible',
    AppCollapsible,
    'open',
    { title: 'More' },
    {},
    true,
    attr('[aria-expanded]', 'aria-expanded'),
    'false',
    'true'
  ],
  ['AppDialog', AppDialog, 'open', { title: 'T' }, {}, true, popup, false, true],
  ['AppDrawer', AppDrawer, 'open', { title: 'T' }, {}, true, popup, false, true],
  ['AppPopover', AppPopover, 'open', {}, trigger, true, popup, false, true],
  [
    'AppTooltip',
    AppTooltip,
    'open',
    { content: 'Tip' },
    { default: () => h('button', 'Hover') },
    true,
    popup,
    false,
    true
  ],
  ['AppMenu', AppMenu, 'open', { items: [{ label: 'One' }] }, {}, true, popup, false, true],
  ['AppContextMenu', AppContextMenu, 'open', { items: [{ label: 'One' }] }, {}, true, popup, false, true],
  ['AppFloating', AppFloating, 'open', { title: 'T' }, {}, true, popup, false, true],
  ['FormSelect', FormSelect, 'open', { options: ['a'] }, {}, true, popup, false, true],
  ['FormCombobox', FormCombobox, 'open', { options: ['a'] }, {}, true, popup, false, true],
  ['FormDatepicker', FormDatepicker, 'open', {}, {}, true, popup, false, true]
];

describe('v-model on a ref that starts out undefined', () => {
  it.each(WRAPPERS)(
    '%s keeps its part controlled, so a value set later shows',
    async (_, component, prop, props, slots, value, read, empty, set) => {
      const model = mountModel(component, prop, props, slots);
      await settle();
      expect(read()).toEqual(empty);

      model.value = value;
      await settle();
      expect(read()).toEqual(set);
    }
  );
});

describe('without a v-model', () => {
  it('AppAccordion opens a section on its own', async () => {
    wrapper = mount(AppAccordion as any, { props: { sections: SECTIONS }, attachTo: document.body });
    const first = document.querySelector<HTMLElement>('[aria-expanded]')!;
    first.click();
    await settle();
    expect(first.getAttribute('aria-expanded')).toBe('true');
  });
});

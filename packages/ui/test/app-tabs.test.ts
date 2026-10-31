import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { AppTabs } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

// See app-button.test.ts: a click in the millisecond of the mount can be dropped.
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const items = [
  { value: 'account', label: 'Account' },
  { value: 'password', label: 'Password' },
  { value: 'billing', label: 'Billing', disabled: true }
];

function mountTabs(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(AppTabs as any, {
    props: { tabs: items, ...props },
    slots: {
      account: () => 'Account panel',
      password: () => 'Password panel',
      ...slots
    },
    attachTo: document.body
  });
  return wrapper;
}

const tabs = () => [...document.querySelectorAll<HTMLElement>('[role="tab"]')];
const panels = () => [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
const tab = (label: string) => tabs().find((el) => el.textContent!.trim() === label)!;

describe('AppTabs', () => {
  it('renders a tab per entry and selects the first by default, showing its panel', () => {
    mountTabs();

    expect(tabs().map((el) => el.textContent!.trim())).toEqual(['Account', 'Password', 'Billing']);
    expect(tab('Account').getAttribute('aria-selected')).toBe('true');
    expect(panels().map((el) => el.textContent!.trim())).toEqual(['Account panel']);
    expect(tab('Billing').hasAttribute('disabled')).toBe(true);
  });

  it('skips a disabled first tab when choosing the default', () => {
    mountTabs({ tabs: [{ value: 'a', label: 'A', disabled: true }, { value: 'b', label: 'B' }] }, { b: () => 'B panel' });
    expect(tab('B').getAttribute('aria-selected')).toBe('true');
  });

  it('takes plain values as tabs, labeled by the value', () => {
    mountTabs({ tabs: ['one', 'two'] }, { one: () => '1', two: () => '2' });
    expect(tabs().map((el) => el.textContent!.trim())).toEqual(['one', 'two']);
  });

  it('switches on a press, for v-model', async () => {
    const w = mountTabs({ modelValue: 'account' });
    await later();
    tab('Password').click();
    await nextTick();

    expect(w.emitted('update:modelValue')![0]).toEqual(['password']);
  });

  it('shows the panel of the tab pressed when uncontrolled', async () => {
    mountTabs();
    await later();
    tab('Password').click();
    await settle();

    expect(panels().map((el) => el.textContent!.trim())).toEqual(['Password panel']);
  });

  it('falls back to the panel slot for a tab without one', async () => {
    mountTabs(
      { defaultValue: 'billing', tabs: [...items.slice(0, 2), { value: 'billing', label: 'Billing' }] },
      { panel: ({ tab }: { tab: { label: string } }) => `${tab.label} (shared)` }
    );
    expect(panels()[0]!.textContent!.trim()).toBe('Billing (shared)');
  });

  it('renders no panel for a tab with no slot, and no aria-controls', () => {
    wrapper = mount(AppTabs as any, { props: { tabs: items }, attachTo: document.body });
    expect(panels()).toHaveLength(0);
    expect(tab('Account').hasAttribute('aria-controls')).toBe(false);
  });

  it('hands the tab slot its tab and whether it is selected', () => {
    mountTabs({}, { tab: ({ tab, selected }: any) => h('b', `${tab.label}${selected ? '*' : ''}`) });
    expect(tabs().map((el) => el.textContent)).toEqual(['Account*', 'Password', 'Billing']);
  });

  it('keeps every panel in the page with keep-mounted, hiding the others', () => {
    mountTabs({ keepMounted: true });
    const all = [...document.querySelectorAll<HTMLElement>('.app-tabs-panel')];
    expect(all).toHaveLength(2);
    expect(all[1]!.hidden).toBe(true);
  });

  it('carries its variant and orientation for styling', () => {
    mountTabs({ variant: 'pills', orientation: 'vertical' });
    const list = document.querySelector<HTMLElement>('.app-tabs-list')!;

    expect(list.dataset.variant).toBe('pills');
    expect(list.dataset.orientation).toBe('vertical');
    expect(document.querySelector<HTMLElement>('.app-tabs')!.dataset.variant).toBe('pills');
  });

  it('adds the class props to their parts, beside their own classes', () => {
    mountTabs({ tabsClass: 'w-full', tabClass: ['flex-1', { bold: true }], panelClass: 'p-4', indicatorClass: 'hidden' });

    expect(document.querySelector('.app-tabs-list')!.classList.contains('w-full')).toBe(true);
    expect(tabs().every((el) => el.classList.contains('app-tabs-tab') && el.classList.contains('flex-1') && el.classList.contains('bold'))).toBe(true);
    expect(panels()[0]!.classList.contains('p-4')).toBe(true);
    expect(document.querySelector('.app-tabs-indicator')!.classList.contains('hidden')).toBe(true);
  });
});

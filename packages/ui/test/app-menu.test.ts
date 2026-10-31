import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, toRaw } from 'vue';
import { AppMenu, AppButton, type AppMenuEntry } from '../src';

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

const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

const trigger = () => document.querySelector<HTMLElement>('[aria-haspopup="menu"]')!;
const menus = () => [...document.querySelectorAll<HTMLElement>('[role="menu"]')];
const item = (label: string) =>
  [...document.querySelectorAll<HTMLElement>('[role^="menuitem"]')].find((el) => el.textContent!.trim().startsWith(label))!;

async function mountMenu(props: Record<string, unknown>, slots: Record<string, any> = {}) {
  wrapper = mount(AppMenu as any, { props, slots, attachTo: document.body });
  await later();
  trigger().click();
  await settle();
  return wrapper;
}

describe('AppMenu', () => {
  it('opens from a text trigger, with items, separators and group headings', async () => {
    await mountMenu({
      trigger: 'File',
      items: [
        { label: 'New', shortcut: '⌘N' },
        { type: 'separator' },
        { type: 'group', label: 'Recent', items: [{ label: 'report.pdf' }] }
      ]
    });

    expect(trigger().classList.contains('app-menu-trigger')).toBe(true);
    expect(menus()).toHaveLength(1);
    expect(item('New').querySelector('kbd')!.textContent).toBe('⌘N');
    expect(document.querySelector('[role="separator"]')).not.toBeNull();
    expect(document.querySelector('.app-menu-group-label')!.textContent).toBe('Recent');
    expect(item('report.pdf')).toBeDefined();
  });

  it('runs onSelect, emits select, and closes', async () => {
    const onSelect = vi.fn();
    const items: AppMenuEntry[] = [{ label: 'Delete', tone: 'danger', onSelect }];
    const w = await mountMenu({ trigger: 'Actions', items });

    expect(item('Delete').dataset.tone).toBe('danger');
    item('Delete').click();
    await settle();

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(toRaw(w.emitted('select')![0]![0])).toBe(items[0]);
    expect(menus()).toHaveLength(0);
  });

  it('toggles a checkbox through checked and onChange, staying open', async () => {
    const wrap = ref(false);
    wrapper = mount(
      defineComponent({
        render: () =>
          h(AppMenu as any, {
            trigger: 'View',
            items: [{ type: 'checkbox', label: 'Word wrap', checked: wrap.value, onChange: (v: boolean) => (wrap.value = v) }]
          })
      }),
      { attachTo: document.body }
    );
    await later();
    trigger().click();
    await settle();

    item('Word wrap').click();
    await settle();
    expect(wrap.value).toBe(true);
    expect(item('Word wrap').getAttribute('aria-checked')).toBe('true');
    expect(menus()).toHaveLength(1);
  });

  it('picks one of a radio set, under its heading', async () => {
    const onChange = vi.fn();
    await mountMenu({
      trigger: 'Sort',
      items: [
        {
          type: 'radio',
          label: 'Sort by',
          value: 'name',
          options: [
            { value: 'name', label: 'Name' },
            { value: 'date', label: 'Date' }
          ],
          onChange
        }
      ]
    });

    expect(document.querySelector('.app-menu-group-label')!.textContent).toBe('Sort by');
    expect(item('Name').getAttribute('aria-checked')).toBe('true');
    item('Date').click();
    await settle();
    expect(onChange).toHaveBeenCalledWith('date');
  });

  it('opens a submenu from an item with items, and selects inside it', async () => {
    const onSelect = vi.fn();
    const w = await mountMenu({
      trigger: 'File',
      items: [{ label: 'Open recent', items: [{ label: 'notes.md', onSelect }] }]
    });

    const sub = item('Open recent');
    expect(sub.getAttribute('aria-haspopup')).toBe('menu');
    sub.focus();
    key(sub, 'ArrowRight');
    await settle();
    expect(menus()).toHaveLength(2);

    item('notes.md').click();
    await settle();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect((w.emitted('select')![0]![0] as { label: string }).label).toBe('notes.md');
  });

  it('renders its trigger as the given component, with its attributes', async () => {
    await mountMenu({ trigger: 'More', as: AppButton, items: [{ label: 'A' }], variant: 'outline', 'aria-label': 'More actions' });

    expect(trigger().classList.contains('app-button')).toBe(true);
    expect(trigger().classList.contains('app-menu-trigger')).toBe(false);
    expect(trigger().dataset.variant).toBe('outline');
    expect(trigger().getAttribute('aria-label')).toBe('More actions');
  });

  it('takes trigger-, popup- and item-class, the popup class on submenus too', async () => {
    await mountMenu({
      trigger: 'File',
      triggerClass: 't',
      popupClass: 'p',
      itemClass: 'i',
      items: [{ label: 'Plain', class: 'own' }, { label: 'More', items: [{ label: 'Deep' }] }]
    });

    expect(trigger().classList.contains('t')).toBe(true);
    expect(item('Plain').classList.contains('i')).toBe(true);
    expect(item('Plain').classList.contains('own')).toBe(true);

    item('More').focus();
    key(item('More'), 'ArrowRight');
    await settle();
    expect(menus().every((menu) => menu.classList.contains('p'))).toBe(true);
    expect(item('Deep').classList.contains('i')).toBe(true);
  });

  it('takes an item slot for the label, in submenus too', async () => {
    await mountMenu(
      { trigger: 'File', items: [{ label: 'New' }, { label: 'More', items: [{ label: 'Deep' }] }] },
      { item: ({ item }: { item: { label: string } }) => h('b', item.label.toUpperCase()) }
    );

    expect(item('NEW').querySelector('b')).not.toBeNull();
    item('MORE').focus();
    key(item('MORE'), 'ArrowRight');
    await settle();
    expect(item('DEEP')).toBeDefined();
  });
});

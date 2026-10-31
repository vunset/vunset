import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { configureLink } from '@vunset/vue';
import { AppMenubar, type AppMenubarEntry } from '../src';

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
const hover = (el: Element) => el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

const triggers = () => [...document.querySelectorAll<HTMLElement>('.app-menubar-trigger')];
const menus = () => [...document.querySelectorAll<HTMLElement>('[role="menu"]')];
const item = (label: string) =>
  [...(menus()[0]?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? [])].find(
    (el) => el.textContent!.trim() === label
  )!;

const onSave = vi.fn();
const MENUS: AppMenubarEntry[] = [
  { label: 'File', items: [{ label: 'New' }, { label: 'Save', onSelect: onSave }] },
  { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo' }] },
  { label: 'View', items: [{ label: 'Zoom in' }] }
];

async function mountBar(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(AppMenubar as any, { props: { items: MENUS, ...props }, slots, attachTo: document.body });
  await later();
  return wrapper;
}

describe('AppMenubar', () => {
  it('is a menubar with a trigger per menu', async () => {
    await mountBar();

    expect(document.querySelector('[role="menubar"]')!.classList.contains('app-menubar')).toBe(true);
    expect(triggers().map((el) => el.textContent!.trim())).toEqual(['File', 'Edit', 'View']);
    expect(triggers().every((el) => el.getAttribute('role') === 'menuitem')).toBe(true);
    expect(triggers().every((el) => !el.classList.contains('app-menu-trigger'))).toBe(true);
  });

  it('switches menus on hover once one is open', async () => {
    await mountBar();
    triggers()[0]!.click();
    await settle();
    expect(item('New')).toBeDefined();

    hover(triggers()[1]!);
    await settle();
    expect(menus()).toHaveLength(1);
    expect(item('Undo')).toBeDefined();
  });

  it('moves between the menus with the arrow keys', async () => {
    await mountBar();
    triggers()[0]!.focus();
    key(triggers()[0]!, 'ArrowRight');
    expect(document.activeElement).toBe(triggers()[1]);

    key(triggers()[1]!, 'ArrowDown');
    await settle();
    expect(item('Undo')).toBeDefined();
  });

  it('runs onSelect and emits select from any menu', async () => {
    const w = await mountBar();
    triggers()[0]!.click();
    await settle();
    item('Save').click();
    await settle();

    expect(onSave).toHaveBeenCalled();
    expect((w.emitted('select')![0]![0] as { label: string }).label).toBe('Save');
  });

  it('disables the whole bar, or one menu', async () => {
    await mountBar({ items: [{ ...MENUS[0]!, disabled: true }, MENUS[1]!] });
    triggers()[0]!.click();
    await settle();
    expect(menus()).toHaveLength(0);
    wrapper!.unmount();

    await mountBar({ disabled: true });
    triggers()[1]!.click();
    await settle();
    expect(menus()).toHaveLength(0);
  });

  it('takes trigger-, popup- and item-class, and a trigger slot', async () => {
    await mountBar(
      { triggerClass: 't', popupClass: 'p', itemClass: 'i' },
      { trigger: ({ menu }: { menu: AppMenubarEntry }) => h('em', menu.label) }
    );

    expect(triggers().every((el) => el.classList.contains('t') && el.querySelector('em'))).toBe(true);
    triggers()[0]!.click();
    await settle();
    expect(menus()[0]!.classList.contains('p')).toBe(true);
    expect(item('New').classList.contains('i')).toBe(true);
  });

  describe('links', () => {
    // Stands in for RouterLink / NuxtLink: an `<a>` built from its `to`.
    const RouteLink = defineComponent({
      props: { to: { type: String, required: true } },
      setup: (props, { slots }) => () => h('a', { href: `/app${props.to}`, 'data-route': props.to }, slots.default?.())
    });

    const BAR: AppMenubarEntry[] = [
      { label: 'File', items: [{ label: 'Reports', to: '/reports' }, { label: 'New' }] },
      { label: 'Logger', to: '/logger' },
      { label: 'Archive', to: '/archive', disabled: true }
    ];
    const barLink = (label: string) => triggers().find((el) => el.textContent!.trim() === label)!;

    it('puts a link in the bar, an <a> with its href by default', async () => {
      await mountBar({ items: BAR });
      expect(barLink('Logger').tagName).toBe('A');
      expect(barLink('Logger').getAttribute('href')).toBe('/logger');
      expect(barLink('Logger').getAttribute('role')).toBe('menuitem');
    });

    it('renders links, in the bar and in its menus, as the `link` component given', async () => {
      await mountBar({ items: BAR, link: RouteLink });
      expect(barLink('Logger').dataset.route).toBe('/logger');

      barLink('File').click();
      await settle();
      expect(item('Reports').dataset.route).toBe('/reports');
      expect(item('Reports').getAttribute('role')).toBe('menuitem');
      // A plain item stays one.
      expect(item('New').tagName).toBe('DIV');
    });

    it('falls back to configureLink’s component, as the Nuxt module sets NuxtLink', async () => {
      configureLink(RouteLink);
      try {
        await mountBar({ items: BAR });
        expect(barLink('Logger').dataset.route).toBe('/logger');
      } finally {
        configureLink('a');
      }
    });

    it('draws a disabled link as an <a> with nowhere to go', async () => {
      await mountBar({ items: BAR, link: RouteLink });
      expect(barLink('Archive').hasAttribute('href')).toBe(false);
      expect(barLink('Archive').getAttribute('aria-disabled')).toBe('true');
    });

    it('reaches a link with the arrow keys', async () => {
      await mountBar({ items: BAR });
      barLink('File').focus();
      key(barLink('File'), 'ArrowRight');
      expect(document.activeElement).toBe(barLink('Logger'));
    });
  });

  it('draws an icon given by name with AppIcon, and a component or h() as it is', async () => {
    const Star = defineComponent({ setup: () => () => h('b', { class: 'star' }) });
    await mountBar({
      items: [
        {
          label: 'File',
          items: [
            { label: 'Named', icon: 'calendar' },
            { label: 'Component', icon: Star },
            { label: 'Vnode', icon: h('i', { class: 'mine' }) }
          ]
        }
      ]
    });
    triggers()[0]!.click();
    await settle();

    const icon = (label: string) => item(label).querySelector<HTMLElement>('.app-menu-icon')!;
    expect(icon('Named').getAttribute('data-name')).toBe('calendar');
    expect(icon('Component').classList.contains('star')).toBe(true);
    expect(icon('Vnode').classList.contains('mine')).toBe(true);
    expect(icon('Vnode').getAttribute('aria-hidden')).toBe('true');
  });
});

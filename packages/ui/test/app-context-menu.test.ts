import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { MenuItem } from '@vunset/vue';
import { AppContextMenu, AppMenuItems } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
const area = () => document.querySelector<HTMLElement>('.app-context-menu-area')!;
const menus = () => [...document.querySelectorAll<HTMLElement>('[role="menu"]')];
const item = (label: string) =>
  [...document.querySelectorAll<HTMLElement>('[role^="menuitem"]')].find((el) => el.textContent!.trim().startsWith(label))!;

async function rightClick() {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 120, clientY: 80 });
  area().dispatchEvent(event);
  await settle();
  return event;
}

// The menu's content goes in the default slot: AppMenuItems here, unless a test brings its own.
function mountMenu(
  props: Record<string, unknown> & { items?: unknown[] },
  slots: Record<string, any> = {},
  itemsProps: Record<string, unknown> = {}
) {
  const { items = [], ...rest } = props;
  wrapper = mount(AppContextMenu as any, {
    props: rest,
    attrs: {},
    slots: {
      trigger: () => 'Right-click here',
      default: () => h(AppMenuItems as any, { items, ...itemsProps }),
      ...slots
    },
    attachTo: document.body
  });
  return wrapper;
}

describe('AppContextMenu', () => {
  it('opens on a right-click in its area, in place of the browser menu', async () => {
    mountMenu({ items: [{ label: 'Back' }, { type: 'separator' }, { label: 'Inspect' }] });
    expect(area().textContent).toBe('Right-click here');
    expect(menus()).toHaveLength(0);

    const event = await rightClick();
    expect(event.defaultPrevented).toBe(true);
    expect(menus()).toHaveLength(1);
    expect(menus()[0]!.classList.contains('app-menu')).toBe(true);
    expect(document.querySelector('[role="separator"]')).not.toBeNull();
  });

  it('runs an item onSelect, from AppMenuItems in its slot, and closes', async () => {
    const onSelect = vi.fn();
    const onPick = vi.fn();
    mountMenu({ items: [{ label: 'Reload', onSelect }] }, {}, { onSelect: onPick });
    await rightClick();
    item('Reload').click();
    await settle();

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onPick.mock.calls[0]![0].label).toBe('Reload');
    expect(menus()).toHaveLength(0);
  });

  it('shows whatever its slot holds, such as menu parts of your own', async () => {
    const onSelect = vi.fn();
    mountMenu({}, { default: () => h(MenuItem as any, { class: 'app-menu-item', onSelect }, () => 'Custom') });
    await rightClick();

    expect(item('Custom').classList.contains('app-menu-item')).toBe(true);
    item('Custom').click();
    await settle();
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('opens a submenu from an item with items', async () => {
    mountMenu({ items: [{ label: 'Arrange', items: [{ label: 'Bring to front' }] }] });
    await rightClick();

    item('Arrange').focus();
    key(item('Arrange'), 'ArrowRight');
    await settle();
    expect(menus()).toHaveLength(2);
    expect(item('Bring to front')).toBeDefined();
  });

  it('leaves the browser menu alone while disabled', async () => {
    mountMenu({ items: [{ label: 'Back' }], disabled: true });
    const event = await rightClick();
    expect(event.defaultPrevented).toBe(false);
    expect(menus()).toHaveLength(0);
  });

  it('puts its trigger slot, class and other attributes on the area, as the element as says', () => {
    wrapper = mount(AppContextMenu as any, {
      props: { as: 'section' },
      attrs: { class: 'canvas', 'data-testid': 'board' },
      slots: { trigger: () => 'Board' },
      attachTo: document.body
    });
    expect(area().tagName).toBe('SECTION');
    expect(area().textContent).toBe('Board');
    expect(area().classList.contains('canvas')).toBe(true);
    expect(area().dataset.testid).toBe('board');
  });

  it('takes popup-class', async () => {
    mountMenu({ items: [{ label: 'Copy' }], popupClass: 'p' });
    await rightClick();
    expect(menus()[0]!.classList.contains('p')).toBe(true);
  });
});

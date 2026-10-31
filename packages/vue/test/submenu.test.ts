import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { setLayout, resetLayout } from './layout';
import {
  MenubarRoot, MenuRoot, MenuTrigger, Portal, Positioner, Popup, MenuItem,
} from '../src';

/**
 * File
 *  ├ New
 *  ├ Recent ▸      (submenu)
 *  │   ├ doc-one
 *  │   └ doc-two
 *  └ Save
 */
function mountNested(onSelect = vi.fn(), barProps: Record<string, any> = {}) {
  const Submenu = () =>
    h(MenuRoot as any, null, {
      default: () => [
        h(MenuTrigger as any, { class: 'sub-trigger' }, { default: () => 'Recent' }),
        h(Portal as any, null, {
          default: () =>
            h(Positioner as any, null, {
              default: () =>
                h(Popup as any, { class: 'sub-menu' }, {
                  default: () =>
                    ['doc-one', 'doc-two'].map((d) =>
                      h(MenuItem as any, { onSelect: () => onSelect(d) }, { default: () => d }),
                    ),
                }),
            }),
        }),
      ],
    });

  const Host = defineComponent({
    setup() {
      return () =>
        h(MenubarRoot as any, barProps, {
          default: () =>
            h(MenuRoot as any, null, {
              default: () => [
                h(MenuTrigger as any, null, { default: () => 'File' }),
                h(Portal as any, null, {
                  default: () =>
                    h(Positioner as any, null, {
                      default: () =>
                        h(Popup as any, { class: 'root-menu' }, {
                          default: () => [
                            h(MenuItem as any, { onSelect: () => onSelect('New') }, { default: () => 'New' }),
                            Submenu(),
                            h(MenuItem as any, { onSelect: () => onSelect('Save') }, { default: () => 'Save' }),
                          ],
                        }),
                    }),
                }),
              ],
            }),
        });
    },
  });
  return { wrapper: mount(Host, { attachTo: document.body }), onSelect };
}

const barTrigger = () => document.querySelector<HTMLElement>('[data-menubar-trigger]')!;
const subTrigger = () => document.querySelector<HTMLElement>('[data-submenu-trigger]')!;
const rootMenu = () => document.querySelector<HTMLElement>('.root-menu');
const subMenu = () => document.querySelector<HTMLElement>('.sub-menu');

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const key = (el: Element, k: string) =>
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
const hover = (el: Element) =>
  el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
const move = (el: Element) =>
  el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));

async function openRoot() {
  barTrigger().click();
  await settle();
}

describe('Submenu', () => {
  describe('structure', () => {
    it('renders the submenu trigger as an item of its parent menu', async () => {
      mountNested();
      await openRoot();
      expect(subTrigger().getAttribute('role')).toBe('menuitem');
      expect(subTrigger().getAttribute('aria-haspopup')).toBe('menu');
      expect(subTrigger().getAttribute('aria-expanded')).toBe('false');
      // An item, not a tab stop of its own.
      expect(subTrigger().getAttribute('tabindex')).toBe('-1');
      expect(subMenu()).toBeNull();
    });

    it('does not register as a menubar trigger', async () => {
      mountNested();
      await openRoot();
      expect(document.querySelectorAll('[data-menubar-trigger]')).toHaveLength(1);
    });

    it('positions itself independently of its parent menu', async () => {
      mountNested();
      await openRoot();
      hover(subTrigger());
      await settle();
      // Both menus are laid out separately, each exposing its own resolved side.
      // Which side a submenu actually lands on depends on real collision
      // geometry, so that belongs in a browser test, not here — jsdom reports
      // every element as zero-sized.
      expect(subMenu()).not.toBe(rootMenu());
      expect(subMenu()!.getAttribute('data-side')).toBeTruthy();
    });
  });

  describe('opening', () => {
    it('opens on hover', async () => {
      mountNested();
      await openRoot();
      hover(subTrigger());
      await settle();
      expect(subMenu()).not.toBeNull();
      expect(subTrigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('opens with ArrowRight and focuses the first item', async () => {
      mountNested();
      await openRoot();
      subTrigger().focus();
      key(subTrigger(), 'ArrowRight');
      await settle();
      expect(subMenu()).not.toBeNull();
      expect(document.activeElement?.textContent).toBe('doc-one');
    });

    it('keeps the parent menu open', async () => {
      mountNested();
      await openRoot();
      hover(subTrigger());
      await settle();
      expect(rootMenu()).not.toBeNull();
    });

    it('closes when a sibling item is hovered', async () => {
      mountNested();
      await openRoot();
      hover(subTrigger());
      await settle();
      expect(subMenu()).not.toBeNull();

      const save = Array.from(rootMenu()!.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
        (el) => el.textContent === 'Save',
      )!;
      move(save);
      await settle();
      expect(subMenu()).toBeNull();
    });
  });

  describe('keyboard', () => {
    it('ArrowLeft closes the submenu and returns focus to its trigger', async () => {
      mountNested();
      await openRoot();
      subTrigger().focus();
      key(subTrigger(), 'ArrowRight');
      await settle();

      key(document.activeElement!, 'ArrowLeft');
      await settle();
      expect(subMenu()).toBeNull();
      expect(rootMenu()).not.toBeNull();
      expect(document.activeElement).toBe(subTrigger());
    });

    it('ArrowLeft does not jump to a sibling menubar menu', async () => {
      mountNested();
      await openRoot();
      subTrigger().focus();
      key(subTrigger(), 'ArrowRight');
      await settle();
      key(document.activeElement!, 'ArrowLeft');
      await settle();
      // Still inside the File menu, not moved along the bar.
      expect(barTrigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('navigates within the submenu', async () => {
      mountNested();
      await openRoot();
      subTrigger().focus();
      key(subTrigger(), 'ArrowRight');
      await settle();
      key(document.activeElement!, 'ArrowDown');
      expect(document.activeElement?.textContent).toBe('doc-two');
    });
  });

  describe('dismissal', () => {
    it('Escape closes only the innermost menu', async () => {
      mountNested();
      await openRoot();
      hover(subTrigger());
      await settle();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(subMenu()).toBeNull();
      // The parent survives the first press.
      expect(rootMenu()).not.toBeNull();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(rootMenu()).toBeNull();
    });

    it('an outside press closes the whole chain', async () => {
      mountNested();
      await openRoot();
      hover(subTrigger());
      await settle();
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await settle();
      expect(subMenu()).toBeNull();
      expect(rootMenu()).toBeNull();
    });
  });

  describe('selection', () => {
    it('choosing a submenu item closes the entire chain', async () => {
      const { onSelect } = mountNested();
      await openRoot();
      hover(subTrigger());
      await settle();

      const item = Array.from(subMenu()!.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
        (el) => el.textContent === 'doc-two',
      )!;
      item.click();
      await settle();

      expect(onSelect).toHaveBeenCalledWith('doc-two');
      expect(subMenu()).toBeNull();
      expect(rootMenu()).toBeNull();
      expect(document.activeElement).toBe(barTrigger());
    });
  });
});

describe('Submenu placement', () => {
  it('opens beside its parent by default, not below it', async () => {
    mountNested();
    await openRoot();
    hover(subTrigger());
    await settle();
    // The default must come from the composable, which knows this menu is
    // nested. A component-level default would shadow it and force 'bottom'.
    expect(subMenu()!.getAttribute('data-side')).toBe('right');
  });

  it('leaves the top-level menu opening downwards', async () => {
    mountNested();
    await openRoot();
    expect(rootMenu()!.getAttribute('data-side')).toBe('bottom');
  });
});

describe('Submenu placement overrides', () => {
  /** A submenu whose placement is set explicitly on MenuRoot. */
  function mountWithSide(side: string, align?: string) {
    const Host = defineComponent({
      setup() {
        return () =>
          h(MenubarRoot as any, null, {
            default: () =>
              h(MenuRoot as any, null, {
                default: () => [
                  h(MenuTrigger as any, null, { default: () => 'File' }),
                  h(Portal as any, null, {
                    default: () =>
                      h(Positioner as any, null, {
                        default: () =>
                          h(Popup as any, { class: 'root-menu' }, {
                            default: () =>
                              h(MenuRoot as any, { side, align }, {
                                default: () => [
                                  h(MenuTrigger as any, { class: 'sub-trigger' }, { default: () => 'More' }),
                                  h(Portal as any, null, {
                                    default: () =>
                                      h(Positioner as any, null, {
                                        default: () =>
                                          h(Popup as any, { class: 'sub-menu' }, {
                                            default: () => h(MenuItem as any, null, { default: () => 'x' }),
                                          }),
                                      }),
                                  }),
                                ],
                              }),
                          }),
                      }),
                  }),
                ],
              }),
          });
      },
    });
    return mount(Host, { attachTo: document.body });
  }

  it.each(['left', 'right', 'top', 'bottom'])('honors an explicit side of %s', async (side) => {
    mountWithSide(side);
    await openRoot();
    hover(subTrigger());
    await settle();
    expect(subMenu()!.getAttribute('data-side')).toBe(side);
  });

  it('honors an explicit align', async () => {
    mountWithSide('right', 'end');
    await openRoot();
    hover(subTrigger());
    await settle();
    expect(subMenu()!.getAttribute('data-align')).toBe('end');
  });
});

describe('Submenu collision handling', () => {
  it('flips to the left when there is no room on the right', async () => {
    // Anchor hard against the right edge: a right-opening submenu cannot fit.
    setLayout({ x: 940, y: 200, width: 120, height: 32 });
    mountNested();
    await openRoot();
    hover(subTrigger());
    await settle();
    expect(subMenu()!.getAttribute('data-side')).toBe('left');
  });

  it('stays on the right when there is room', async () => {
    setLayout({ x: 100, y: 200, width: 120, height: 32 });
    mountNested();
    await openRoot();
    hover(subTrigger());
    await settle();
    expect(subMenu()!.getAttribute('data-side')).toBe('right');
  });

  it('falls back to another axis when neither side fits', async () => {
    // A viewport narrower than the menu on both sides of the anchor.
    setLayout({ x: 60, y: 100, width: 120, height: 32 }, { width: 260, height: 768 });
    mountNested();
    await openRoot();
    hover(subTrigger());
    await settle();
    // Nowhere to go horizontally, so it must move to the vertical axis rather
    // than hang off the edge.
    expect(['top', 'bottom']).toContain(subMenu()!.getAttribute('data-side'));
  });

  it('publishes the room available so a tall menu can scroll', async () => {
    setLayout({ x: 200, y: 600, width: 120, height: 32 }, { width: 1024, height: 700 });
    mountNested();
    await openRoot();
    hover(subTrigger());
    await settle();
    const positioner = subMenu()!.parentElement!;
    const available = positioner.style.getPropertyValue('--available-height');
    expect(available).toMatch(/px$/);
    expect(Number.parseFloat(available)).toBeGreaterThan(0);
  });
});

describe('Submenu fitting', () => {
  const availableHeight = () =>
    Number.parseFloat(subMenu()!.parentElement!.style.getPropertyValue('--available-height'));

  /**
   * Measured one mount at a time: the helpers query the whole document, so two
   * live menubars would have the second's assertions read the first's DOM.
   */
  async function roomOnViewport(height: number) {
    setLayout({ x: 200, y: 100, width: 120, height: 32 }, { width: 1024, height });
    const { wrapper } = mountNested();
    await openRoot();
    hover(subTrigger());
    await settle();
    const value = availableHeight();
    wrapper.unmount();
    document.body.innerHTML = '';
    resetLayout();
    return value;
  }

  it('reports less room on a shorter viewport', async () => {
    const tall = await roomOnViewport(768);
    const short = await roomOnViewport(300);

    // A side-placed menu may slide vertically, so its room is bounded by the
    // viewport rather than by where the anchor sits — which is exactly the
    // measure a small screen needs to cap against.
    expect(short).toBeLessThan(tall);
    expect(short).toBeGreaterThan(0);
  });

  it('never reports more room than the viewport allows', async () => {
    const room = await roomOnViewport(300);
    expect(room).toBeLessThanOrEqual(300);
  });
});

describe('a hover-opened chain', () => {
  /**
   * A submenu is portaled, so it is not a DOM descendant of the menu that
   * owns it. Moving the pointer into one fires `pointerleave` on the parent's
   * popup, which on its own reads as leaving the menu — and the whole chain
   * would close out from under the pointer.
   */
  const enter = (el: Element) => el.dispatchEvent(new PointerEvent('pointerenter'));
  const leave = (el: Element) => el.dispatchEvent(new PointerEvent('pointerleave'));

  it('stays open while the pointer moves into a submenu', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    mountNested(vi.fn(), { openOnHover: true });
    await settle();

    enter(barTrigger());
    vi.advanceTimersByTime(200);
    await settle();
    expect(rootMenu()).not.toBeNull();

    // Into the menu, then onto the submenu trigger.
    leave(barTrigger());
    enter(rootMenu()!);
    enter(subTrigger());
    await settle();
    expect(subMenu()).not.toBeNull();

    // Across the gap into the submenu itself — the parent popup is left behind.
    leave(rootMenu()!);
    enter(subMenu()!);
    vi.advanceTimersByTime(1000);
    await settle();

    expect(rootMenu()).not.toBeNull();
    expect(subMenu()).not.toBeNull();
    vi.useRealTimers();
  });

  it('closes the chain once the pointer leaves the submenu too', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    mountNested(vi.fn(), { openOnHover: true });
    await settle();

    enter(barTrigger());
    vi.advanceTimersByTime(200);
    await settle();
    leave(barTrigger());
    enter(rootMenu()!);
    enter(subTrigger());
    await settle();
    leave(rootMenu()!);
    enter(subMenu()!);
    await settle();

    // Away from everything: the hold is released up the chain.
    leave(subMenu()!);
    vi.advanceTimersByTime(1000);
    await settle();

    expect(rootMenu()).toBeNull();
    vi.useRealTimers();
  });
});

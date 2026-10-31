import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import {
  MenubarRoot, MenubarLink, MenuRoot, MenuTrigger, Portal, Positioner, Popup, MenuItem,
} from '../src';

const MENUS = [
  { label: 'File', items: ['New', 'Open', 'Save'] },
  { label: 'Edit', items: ['Undo', 'Redo'] },
  { label: 'View', items: ['Zoom In', 'Zoom Out'] },
];

function mountMenubar(onSelect = vi.fn()) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(MenubarRoot as any, null, {
          default: () =>
            MENUS.map((menu) =>
              h(MenuRoot as any, null, {
                default: () => [
                  h(MenuTrigger as any, null, { default: () => menu.label }),
                  h(Portal as any, null, {
                    default: () =>
                      h(Positioner as any, null, {
                        default: () =>
                          h(Popup as any, null, {
                            default: () =>
                              menu.items.map((item) =>
                                h(MenuItem as any, { onSelect: () => onSelect(item) }, {
                                  default: () => item,
                                }),
                              ),
                          }),
                      }),
                  }),
                ],
              }),
            ),
        });
    },
  });
  return { wrapper: mount(Host, { attachTo: document.body }), onSelect };
}

const triggers = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-menubar-trigger]'));
const openMenu = () => document.querySelector<HTMLElement>('[role="menu"]');
// Menubar triggers also carry role="menuitem", so this must be scoped to the
// open menu rather than searching the whole document.
const items = () =>
  Array.from(openMenu()?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

// A key in the millisecond of the mount can be dropped: Vue skips a listener
// attached no earlier than the event that reaches it.
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

function key(el: Element, k: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
}

describe('Menubar', () => {
  describe('structure', () => {
    it('exposes menubar and menuitem roles', () => {
      mountMenubar();
      expect(document.querySelector('[role="menubar"]')).not.toBeNull();
      expect(triggers()).toHaveLength(3);
      triggers().forEach((t) => {
        expect(t.getAttribute('role')).toBe('menuitem');
        expect(t.getAttribute('aria-haspopup')).toBe('menu');
      });
    });

    it('keeps every trigger tabbable while the bar is idle', () => {
      mountMenubar();
      triggers().forEach((t) => expect(t.getAttribute('tabindex')).toBe('0'));
    });

    it('labels the open menu by its trigger', async () => {
      mountMenubar();
      triggers()[0].click();
      await settle();
      expect(openMenu()!.getAttribute('aria-labelledby')).toBe(triggers()[0].id);
    });
  });

  describe('opening', () => {
    it('opens on click and closes on a second click', async () => {
      mountMenubar();
      triggers()[0].click();
      await settle();
      expect(openMenu()).not.toBeNull();
      triggers()[0].click();
      await settle();
      expect(openMenu()).toBeNull();
    });

    it('opens with ArrowDown and focuses the first item', async () => {
      mountMenubar();
      triggers()[0].focus();
      key(triggers()[0], 'ArrowDown');
      await settle();
      expect(openMenu()).not.toBeNull();
      expect(document.activeElement?.textContent).toBe('New');
    });

    it('only one menu is open at a time', async () => {
      mountMenubar();
      triggers()[0].click();
      await settle();
      triggers()[1].click();
      await settle();
      expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
      expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
      expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');
    });

    it('switches menus on hover once the bar is active', async () => {
      mountMenubar();
      // Hover alone does nothing while closed.
      triggers()[1].dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
      await settle();
      expect(openMenu()).toBeNull();

      triggers()[0].click();
      await settle();
      triggers()[2].dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
      await settle();
      expect(triggers()[2].getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('keyboard navigation', () => {
    it('moves between triggers with arrow keys', async () => {
      mountMenubar();
      await later();
      triggers()[0].focus();
      key(triggers()[0], 'ArrowRight');
      expect(document.activeElement).toBe(triggers()[1]);
      key(triggers()[1], 'ArrowLeft');
      expect(document.activeElement).toBe(triggers()[0]);
    });

    it('wraps around at the ends', async () => {
      mountMenubar();
      await later();
      triggers()[0].focus();
      key(triggers()[0], 'ArrowLeft');
      expect(document.activeElement).toBe(triggers()[2]);
    });

    it('moves between items with ArrowDown and wraps', async () => {
      mountMenubar();
      await later();
      triggers()[0].focus();
      key(triggers()[0], 'ArrowDown');
      await settle();
      expect(document.activeElement?.textContent).toBe('New');

      key(document.activeElement!, 'ArrowDown');
      expect(document.activeElement?.textContent).toBe('Open');
      key(document.activeElement!, 'ArrowUp');
      expect(document.activeElement?.textContent).toBe('New');
      key(document.activeElement!, 'ArrowUp');
      expect(document.activeElement?.textContent).toBe('Save');
    });

    it('jumps to the ends with Home and End', async () => {
      mountMenubar();
      await later();
      triggers()[0].focus();
      key(triggers()[0], 'ArrowDown');
      await settle();
      key(document.activeElement!, 'End');
      expect(document.activeElement?.textContent).toBe('Save');
      key(document.activeElement!, 'Home');
      expect(document.activeElement?.textContent).toBe('New');
    });

    it('moves to a sibling menu with ArrowRight from inside a menu', async () => {
      mountMenubar();
      triggers()[0].click();
      await settle();
      key(openMenu()!, 'ArrowRight');
      expect(document.activeElement).toBe(triggers()[1]);
    });

    it('focuses an item by typeahead', async () => {
      mountMenubar();
      triggers()[0].focus();
      key(triggers()[0], 'ArrowDown');
      await settle();
      key(openMenu()!, 's');
      expect(document.activeElement?.textContent).toBe('Save');
    });
  });

  describe('selection', () => {
    it('emits select and closes the menu on click', async () => {
      const { onSelect } = mountMenubar();
      triggers()[0].click();
      await settle();
      items()[1].click();
      await settle();
      expect(onSelect).toHaveBeenCalledWith('Open');
      expect(openMenu()).toBeNull();
    });

    it('selects with Enter', async () => {
      const { onSelect } = mountMenubar();
      triggers()[0].focus();
      key(triggers()[0], 'ArrowDown');
      await settle();
      key(document.activeElement!, 'Enter');
      await settle();
      expect(onSelect).toHaveBeenCalledWith('New');
    });
  });

  describe('dismissal', () => {
    it('closes on Escape and returns focus to the trigger', async () => {
      mountMenubar();
      triggers()[0].click();
      await settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(openMenu()).toBeNull();
      expect(document.activeElement).toBe(triggers()[0]);
    });

    it('closes on an outside press', async () => {
      mountMenubar();
      triggers()[0].click();
      await settle();
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await settle();
      expect(openMenu()).toBeNull();
    });
  });
});

describe('Menubar handoff animation', () => {
  const enterFrom = () => openMenu()?.hasAttribute('data-enter-from');

  it('animates the first menu in', async () => {
    mountMenubar();
    triggers()[0].click();
    await nextTick();
    await nextTick();
    expect(enterFrom()).toBe(true);
  });

  it('skips the animation when sliding to a sibling', async () => {
    mountMenubar();
    triggers()[0].click();
    await settle();

    triggers()[1].click();
    await nextTick();
    await nextTick();
    // The bar should read as one continuous surface, not four separate popups.
    expect(enterFrom()).toBe(false);
    expect(openMenu()).not.toBeNull();
  });

  it('animates again after the bar closes and reopens', async () => {
    mountMenubar();
    triggers()[0].click();
    await settle();
    triggers()[0].click();
    await settle();

    triggers()[1].click();
    await nextTick();
    await nextTick();
    expect(enterFrom()).toBe(true);
  });
});

describe('Menubar handoff exit', () => {
  it('removes the outgoing menu at once when switching', async () => {
    mountMenubar();
    triggers()[0].click();
    await settle();

    triggers()[1].click();
    await nextTick();
    await nextTick();
    // Exactly one menu on screen through the switch.
    expect(document.querySelectorAll('[role="menu"]')).toHaveLength(1);
  });

  it('still animates out when the bar closes', async () => {
    mountMenubar();
    triggers()[0].click();
    await settle();

    triggers()[0].click();
    await nextTick();
    await nextTick();
    const menu = document.querySelector('[role="menu"]');
    expect(menu).not.toBeNull();
    expect(menu!.hasAttribute('data-leave-to')).toBe(true);
  });

  describe('openOnHover', () => {
    /** The bar, with hover opening switched on for all of its menus. */
    function mountHoverBar(props: Record<string, any> = { openOnHover: true }) {
      const Host = defineComponent({
        setup() {
          return () =>
            h(MenubarRoot as any, props, {
              default: () =>
                MENUS.map((menu) =>
                  h(MenuRoot as any, null, {
                    default: () => [
                      h(MenuTrigger as any, null, { default: () => menu.label }),
                      h(Portal as any, null, {
                        default: () =>
                          h(Positioner as any, null, {
                            default: () =>
                              h(Popup as any, null, {
                                default: () =>
                                  menu.items.map((item) =>
                                    h(MenuItem as any, null, { default: () => item }),
                                  ),
                              }),
                          }),
                      }),
                    ],
                  }),
                ),
            });
        },
      });
      return mount(Host, { attachTo: document.body });
    }

    const enter = (el: Element) => el.dispatchEvent(new PointerEvent('pointerenter'));
    const leave = (el: Element) => el.dispatchEvent(new PointerEvent('pointerleave'));

    it('opens the bar from rest on hover', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountHoverBar();
      await settle();

      enter(triggers()[0]);
      vi.advanceTimersByTime(200);
      await settle();

      expect(openMenu()).not.toBeNull();
      vi.useRealTimers();
    });

    it('needs a click when the bar does not ask for hover', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountHoverBar({});
      await settle();

      enter(triggers()[0]);
      vi.advanceTimersByTime(1000);
      await settle();

      expect(openMenu()).toBeNull();
      vi.useRealTimers();
    });

    it('switches between siblings at once, without waiting again', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountHoverBar();
      await settle();

      enter(triggers()[0]);
      vi.advanceTimersByTime(200);
      await settle();

      // Already open: arriving at the next trigger must switch immediately, or
      // the bar feels stuck halfway across.
      leave(triggers()[0]);
      enter(triggers()[1]);
      await settle();

      expect(openMenu()!.textContent).toContain('Undo');
      vi.useRealTimers();
    });

    it('does not let the menu left behind close the one that replaced it', async () => {
      // Leaving a trigger schedules a close. Sliding to a sibling opens that
      // one straight away, leaving the first timer still pending against the
      // open state they share.
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountHoverBar();
      await settle();

      enter(triggers()[0]);
      vi.advanceTimersByTime(200);
      await settle();

      leave(triggers()[0]);
      enter(triggers()[1]);
      await settle();

      // Long past the first trigger's close delay.
      vi.advanceTimersByTime(1000);
      await settle();

      expect(openMenu()).not.toBeNull();
      expect(openMenu()!.textContent).toContain('Undo');
      vi.useRealTimers();
    });

    it('closes once the pointer leaves the bar entirely', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      mountHoverBar();
      await settle();

      enter(triggers()[0]);
      vi.advanceTimersByTime(200);
      await settle();

      leave(triggers()[0]);
      vi.advanceTimersByTime(1000);
      await settle();

      expect(openMenu()).toBeNull();
      vi.useRealTimers();
    });
  });
});

describe('MenubarLink', () => {
  // File, a link, then Edit, whose first item is a link of its own.
  function mountWithLink(linkProps: Record<string, unknown> = {}, onItemClick = vi.fn()) {
    const menu = (label: string, items: unknown[]) =>
      h(MenuRoot as any, null, {
        default: () => [
          h(MenuTrigger as any, null, { default: () => label }),
          h(Portal as any, null, {
            default: () => h(Positioner as any, null, { default: () => h(Popup as any, null, { default: () => items }) })
          })
        ]
      });
    const Host = defineComponent({
      setup: () => () =>
        h(MenubarRoot as any, null, {
          default: () => [
            menu('File', [h(MenuItem as any, null, { default: () => 'New' })]),
            h(MenubarLink as any, { href: '#docs', ...linkProps }, { default: () => 'Docs' }),
            menu('Edit', [
              h(MenuItem as any, { as: 'a', href: '#undo', onClick: onItemClick }, { default: () => 'Undo' })
            ])
          ]
        })
    });
    return mount(Host, { attachTo: document.body });
  }

  const link = () => document.querySelector<HTMLAnchorElement>('[data-part="menubar-link"]')!;
  const [file, edit] = [() => triggers()[0]!, () => triggers()[1]!];

  it('is a menuitem in the bar, rendering its own link', () => {
    const wrapper = mountWithLink();
    expect(link().tagName).toBe('A');
    expect(link().getAttribute('href')).toBe('#docs');
    expect(link().getAttribute('role')).toBe('menuitem');
    expect(link().getAttribute('tabindex')).toBe('0');
    wrapper.unmount();
  });

  it('takes its turn in the arrow keys between the menus', async () => {
    const wrapper = mountWithLink();
    await later();
    file().focus();
    key(file(), 'ArrowRight');
    expect(document.activeElement).toBe(link());
    key(link(), 'ArrowRight');
    expect(document.activeElement).toBe(edit());
    wrapper.unmount();
  });

  it('closes the open menu when the arrows reach it, or the pointer does', async () => {
    const wrapper = mountWithLink();
    file().click();
    await settle();
    expect(openMenu()).not.toBeNull();

    key(openMenu()!, 'ArrowRight');
    await settle();
    expect(openMenu()).toBeNull();
    expect(document.activeElement).toBe(link());

    edit().click();
    await settle();
    expect(openMenu()).not.toBeNull();
    link().dispatchEvent(new Event('pointerenter'));
    await settle();
    expect(openMenu()).toBeNull();
    wrapper.unmount();
  });

  it('goes nowhere while disabled', () => {
    const wrapper = mountWithLink({ disabled: true });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link().dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(link().getAttribute('aria-disabled')).toBe('true');
    wrapper.unmount();
  });

  it('lets Enter on a link item follow the link, which also closes the menu', async () => {
    const onItemClick = vi.fn();
    const wrapper = mountWithLink({}, onItemClick);
    edit().click();
    await settle();

    key(openMenu()!.querySelector('a')!, 'Enter');
    await settle();
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(openMenu()).toBeNull();
    wrapper.unmount();
  });
});

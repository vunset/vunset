import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  MenuItem,
  MenuCheckboxItem,
  Portal,
  Positioner,
  Popup,
  Separator,
} from '../src';

function mountContextMenu(props: Record<string, any> = {}, onSelect = vi.fn()) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(ContextMenuRoot as any, props, {
          default: () => [
            h(ContextMenuTrigger as any, { class: 'area' }, { default: () => 'Right-click me' }),
            h(Portal as any, null, {
              default: () =>
                h(Positioner as any, null, {
                  default: () =>
                    h(Popup as any, { class: 'menu' }, {
                      default: () => [
                        h(MenuItem as any, { class: 'rename', onSelect }, { default: () => 'Rename' }),
                        h(Separator as any),
                        h(MenuCheckboxItem as any, { class: 'pin' }, { default: () => 'Pin' }),
                      ],
                    }),
                }),
            }),
          ],
        });
    },
  });
  return { wrapper: mount(Host, { attachTo: document.body }), onSelect };
}

const area = () => document.querySelector<HTMLElement>('.area')!;
const menu = () => document.querySelector<HTMLElement>('.menu');

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await nextTick();
  }
}

function rightClick(x = 120, y = 80) {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y });
  area().dispatchEvent(event);
  return event;
}

function touch(type: string, x = 40, y = 40) {
  area().dispatchEvent(
    new PointerEvent(type, { bubbles: true, cancelable: true, pointerType: 'touch', clientX: x, clientY: y }),
  );
}

describe('ContextMenu', () => {
  describe('opening', () => {
    it('opens on right click and takes the platform menu’s place', async () => {
      mountContextMenu();
      expect(menu()).toBeNull();

      const event = rightClick();
      await settle();

      expect(menu()).not.toBeNull();
      // Without this the browser's own menu covers ours.
      expect(event.defaultPrevented).toBe(true);
    });

    it('anchors to the point, not to the region', async () => {
      // The region may be a whole table; the menu belongs where the pointer was.
      mountContextMenu();
      rightClick(240, 160);
      await settle();

      const positioner = document.querySelector<HTMLElement>('[data-part="positioner"]')!;
      expect(positioner.style.transform || positioner.style.left || positioner.style.top).not.toBe('');
    });

    it('stays shut while disabled', async () => {
      mountContextMenu({ disabled: true });
      const event = rightClick();
      await settle();

      expect(menu()).toBeNull();
      // The platform menu is left alone, which is the honest thing for a
      // region that is not offering one.
      expect(event.defaultPrevented).toBe(false);
    });

    it('holds the page still while open, and lets it scroll again once closed', async () => {
      // Pinned to a point, the menu would be left floating over the wrong row.
      const { wrapper } = mountContextMenu();
      rightClick();
      await settle();
      expect(document.documentElement.style.overflow).toBe('clip');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(menu()).toBeNull();
      expect(document.documentElement.style.overflow).toBe('');

      wrapper.unmount();
    });

    it('reports itself through v-model', async () => {
      const { wrapper } = mountContextMenu();
      rightClick();
      await settle();

      const root = wrapper.findComponent(ContextMenuRoot as any) as any;
      expect(root.emitted('update:open')?.at(-1)).toEqual([true]);
    });
  });

  describe('focus', () => {
    it('moves into the menu, so the keyboard can use it', async () => {
      mountContextMenu();
      rightClick();
      await settle();

      expect(document.activeElement).toBe(document.querySelector('.rename'));

      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await settle();
      expect(document.activeElement).toBe(document.querySelector('.pin'));
    });

    it('goes back to where it was on Escape, and after an item is chosen', async () => {
      const { wrapper } = mountContextMenu();
      const before = document.createElement('button');
      document.body.appendChild(before);

      before.focus();
      rightClick();
      await settle();
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(document.activeElement).toBe(before);

      before.focus();
      rightClick();
      await settle();
      document.querySelector<HTMLElement>('.rename')!.click();
      await settle();
      expect(document.activeElement).toBe(before);

      before.remove();
      wrapper.unmount();
    });
  });

  describe('long press', () => {
    it('opens after a touch is held', async () => {
      vi.useFakeTimers();
      mountContextMenu();

      touch('pointerdown');
      vi.advanceTimersByTime(499);
      expect(menu()).toBeNull();

      vi.advanceTimersByTime(1);
      vi.useRealTimers();
      await settle();

      expect(menu()).not.toBeNull();
    });

    it('is canceled by a press that turns into a scroll', async () => {
      vi.useFakeTimers();
      mountContextMenu();

      touch('pointerdown', 40, 40);
      vi.advanceTimersByTime(200);
      touch('pointermove', 40, 120);
      vi.advanceTimersByTime(500);
      vi.useRealTimers();
      await settle();

      expect(menu()).toBeNull();
    });

    it('is canceled when the finger lifts early', async () => {
      vi.useFakeTimers();
      mountContextMenu();

      touch('pointerdown');
      vi.advanceTimersByTime(200);
      touch('pointerup');
      vi.advanceTimersByTime(500);
      vi.useRealTimers();
      await settle();

      expect(menu()).toBeNull();
    });

    it('ignores a mouse press, which has a button of its own', async () => {
      vi.useFakeTimers();
      mountContextMenu();

      area().dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', clientX: 10, clientY: 10 }),
      );
      vi.advanceTimersByTime(1000);
      vi.useRealTimers();
      await settle();

      expect(menu()).toBeNull();
    });
  });

  describe('the menu itself', () => {
    it('is an ordinary menu, parts and all', async () => {
      const { onSelect } = mountContextMenu();
      rightClick();
      await settle();

      expect(menu()!.getAttribute('role')).toBe('menu');
      expect(document.querySelector('[role="menuitem"]')).not.toBeNull();
      expect(document.querySelector('[role="menuitemcheckbox"]')).not.toBeNull();
      expect(document.querySelector('[role="separator"]')).not.toBeNull();

      document.querySelector<HTMLElement>('.rename')!.click();
      await settle();

      expect(onSelect).toHaveBeenCalled();
      expect(menu()).toBeNull();
    });

    it('closes on Escape', async () => {
      mountContextMenu();
      rightClick();
      await settle();

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(menu()).toBeNull();
    });

    it('moves the anchor to wherever the next right click lands', async () => {
      mountContextMenu();
      rightClick(100, 100);
      await settle();
      const first = document.querySelector<HTMLElement>('[data-part="positioner"]')!.style.transform;

      rightClick(400, 300);
      await settle();
      const second = document.querySelector<HTMLElement>('[data-part="positioner"]')!.style.transform;

      expect(second).not.toBe(first);
    });
  });
});

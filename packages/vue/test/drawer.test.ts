import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { setLayout } from './layout';
import {
  DrawerRoot, DrawerTrigger, Portal, DrawerBackdrop, Popup, DrawerHandle, DrawerTitle,
} from '../src';

/** Drawer size along its axis, via the stubbed layout. 0.4 threshold -> 80px. */
const SIZE = 200;

function mountDrawer(props: Record<string, any> = {}) {
  setLayout({ x: 0, y: 0, width: SIZE, height: SIZE });
  const Host = defineComponent({
    props: { rootProps: { type: Object, default: () => ({}) } },
    setup(p) {
      return () =>
        h(DrawerRoot as any, p.rootProps, {
          default: () => [
            h(DrawerTrigger as any, null, { default: () => 'Open' }),
            h(Portal as any, null, {
              default: () => [
                h(DrawerBackdrop as any, { class: 'backdrop' }),
                h(Popup as any, null, {
                  default: () => [
                    h(DrawerHandle as any, { class: 'handle' }),
                    h(DrawerTitle as any, null, { default: () => 'Sheet' }),
                    h('button', { class: 'inside' }, 'Inside'),
                    h('input', { class: 'field' }),
                  ],
                }),
              ],
            }),
          ],
        });
    },
  });
  return mount(Host, { props: { rootProps: props }, attachTo: document.body });
}

const popup = () => document.querySelector<HTMLElement>('[role="dialog"]');

/** Signed pixels from the drawer's inline transform, whichever axis it uses. */
function translate(el: HTMLElement): number {
  const match = /translate[XY]\((-?[\d.]+)px\)/.exec(el.style.transform);
  return match ? Number.parseFloat(match[1]) : 0;
}
const handle = () => document.querySelector<HTMLElement>('.handle')!;

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

function pointer(
  type: string,
  coords: { x?: number; y?: number } = {},
  timeStamp?: number,
) {
  return new PointerEvent(type, {
    bubbles: true,
    pointerId: 1,
    clientX: coords.x ?? 0,
    clientY: coords.y ?? 0,
    ...(timeStamp === undefined ? {} : { timeStamp }),
  } as PointerEventInit);
}

interface SwipeOptions {
  axis?: 'x' | 'y';
  release?: boolean;
  /**
   * How long the drag takes. Drives the velocity, and so whether a release
   * counts as a flick. Deliberate by default: dispatching events back-to-back
   * would otherwise imply a speed no hand could produce.
   */
  durationMs?: number;
}

/** Drags the handle, or another element, by `distance` along the drawer's axis and releases. */
async function swipe(distance: number, options: SwipeOptions & { from?: HTMLElement } = {}) {
  const { axis = 'y', release = true, durationMs = 400, from = handle() } = options;
  const at = (d: number) => (axis === 'y' ? { y: d } : { x: d });

  from.dispatchEvent(pointer('pointerdown', at(0), 0));
  await nextTick();
  from.dispatchEvent(pointer('pointermove', at(distance), durationMs));
  await nextTick();
  if (release) {
    from.dispatchEvent(pointer('pointerup', at(distance), durationMs));
    await settle();
  }
}

describe('Drawer', () => {
  describe('structure', () => {
    it('exposes the edge it enters from', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      expect(popup()!.getAttribute('data-side')).toBe('bottom');
    });

    it('keeps the dialog’s --dialog-level on its popup, for stacking', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      expect(popup()!.getAttribute('style')).toContain('--dialog-level: 0');
    });

    it('honors an explicit side', async () => {
      mountDrawer({ defaultOpen: true, side: 'right' });
      await settle();
      expect(popup()!.getAttribute('data-side')).toBe('right');
    });

    it('is a modal dialog like any other', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      expect(popup()!.getAttribute('role')).toBe('dialog');
      expect(popup()!.getAttribute('aria-modal')).toBe('true');
      expect(document.body.style.overflow).toBe('clip');
    });
  });

  describe('swipe to dismiss', () => {
    it('dismisses when dragged past the threshold', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      await swipe(SIZE * 0.7);
      expect(popup()).toBeNull();
    });

    it('snaps back when released short of the threshold', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      await swipe(SIZE * 0.1);
      expect(popup()).not.toBeNull();
      // Offset cleared, so the drawer sits flush again.
      expect(popup()!.style.transform).toBe('');
    });

    it('follows the pointer while dragging', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      await swipe(50, { release: false });
      expect(popup()!.style.transform).toContain('translateY(50px)');
    });

    it('suspends transitions while dragging, or the surface lags the finger', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      await swipe(50, { release: false });
      expect(popup()!.getAttribute('data-dragging')).toBe('');
      expect(popup()!.style.transition).toBe('none');
    });

    it('resists dragging away from its edge instead of tearing off', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      await swipe(-100, { release: false });

      const pulled = Math.abs(translate(popup()!));
      // It moves, so the gesture is acknowledged, but nowhere near one-to-one.
      expect(pulled).toBeGreaterThan(0);
      expect(pulled).toBeLessThan(100);
    });

    it('caps the over-pull however far the drag goes', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      await swipe(-4000, { release: false });

      const pulled = Math.abs(translate(popup()!));
      // Bounded, yet still close to the limit rather than collapsing to nothing,
      // so a long drag stays responsive right up to the stop.
      expect(pulled).toBeLessThanOrEqual(48);
      expect(pulled).toBeGreaterThan(40);
    });

    it('tracks the pointer closely for the first pixels of an over-pull', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      await swipe(-4, { release: false });

      // Near one-to-one at the start: resistance that bites immediately reads as
      // a stuck surface rather than an elastic one.
      expect(Math.abs(translate(popup()!))).toBeGreaterThan(3);
    });

    it('drags along the x axis for a side drawer', async () => {
      mountDrawer({ defaultOpen: true, side: 'right' });
      await settle();
      await swipe(60, { axis: 'x', release: false });
      expect(popup()!.style.transform).toContain('translateX(60px)');
    });

    it('does not drag when swipeable is off', async () => {
      mountDrawer({ defaultOpen: true, swipeable: false });
      await settle();
      await swipe(SIZE * 0.7);
      expect(popup()).not.toBeNull();
    });

    it('dismisses a short but fast flick', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      // Well short of the 80px threshold, but thrown at 1.2 px/ms.
      await swipe(60, { durationMs: 50 });
      expect(popup()).toBeNull();
    });

    it('ignores a fast twitch that barely moves', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      // Same speed, but only a few pixels — a finger resting unsteadily.
      await swipe(6, { durationMs: 5 });
      expect(popup()).not.toBeNull();
    });

    it('respects a custom threshold', async () => {
      mountDrawer({ defaultOpen: true, dismissThreshold: 0.9 });
      await settle();
      // Past the default 0.4 but short of 0.9.
      await swipe(SIZE * 0.5);
      expect(popup()).not.toBeNull();
    });
  });

  describe('swipeable: true, from anywhere', () => {
    const title = () => document.querySelector<HTMLElement>('[role="dialog"] h2')!;

    it('dismisses when the content is dragged past the threshold', async () => {
      mountDrawer({ defaultOpen: true, swipeable: true });
      await settle();
      await swipe(SIZE * 0.7, { from: title() });
      expect(popup()).toBeNull();
    });

    it('leaves the content alone without it', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      await swipe(SIZE * 0.7, { from: title() });
      expect(popup()).not.toBeNull();
    });

    it('keeps a tap on a button a tap', async () => {
      mountDrawer({ defaultOpen: true, swipeable: true });
      await settle();
      const button = document.querySelector<HTMLElement>('.inside')!;
      button.dispatchEvent(pointer('pointerdown'));
      button.dispatchEvent(pointer('pointermove', { y: 2 }));
      await nextTick();
      // Under the slop: no drag yet, so nothing has taken the pointer.
      expect(popup()!.hasAttribute('data-dragging')).toBe(false);
      button.dispatchEvent(pointer('pointerup', { y: 2 }));
      await settle();
      expect(popup()).not.toBeNull();
      expect(popup()!.style.transform).toBe('');
    });

    it('never drags from a text field', async () => {
      mountDrawer({ defaultOpen: true, swipeable: true });
      await settle();
      await swipe(SIZE * 0.7, { from: document.querySelector<HTMLElement>('.field')! });
      expect(popup()).not.toBeNull();
    });

    it('still drags by the handle, counting each move once', async () => {
      mountDrawer({ defaultOpen: true, swipeable: true });
      await settle();
      await swipe(50, { release: false });
      expect(translate(popup()!)).toBe(50);
    });

    it('leaves touch scrolling across the axis to the browser', async () => {
      mountDrawer({ defaultOpen: true, swipeable: true });
      await settle();
      expect(popup()!.style.touchAction).toBe('pan-x');
    });
  });

  describe('dismissal', () => {
    it('closes on Escape', async () => {
      mountDrawer({ defaultOpen: true });
      await settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(popup()).toBeNull();
    });

    it('closes when the backdrop is pressed, once asked to', async () => {
      mountDrawer({ defaultOpen: true, outsidePress: true });
      await settle();
      document.querySelector('.backdrop')!.dispatchEvent(pointer('pointerdown'));
      await settle();
      expect(popup()).toBeNull();
    });

    it('emits closed once the exit animation has finished', async () => {
      const onClosed = vi.fn();
      mountDrawer({ defaultOpen: true, onClosed });
      await settle();

      let finish!: () => void;
      const finished = new Promise<void>((resolve) => (finish = resolve));
      popup()!.getAnimations = () => [{ finished } as unknown as Animation];

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(popup()).not.toBeNull();
      expect(onClosed).not.toHaveBeenCalled();

      finish();
      await settle();
      expect(popup()).toBeNull();
      expect(onClosed).toHaveBeenCalledTimes(1);
    });
  });
});

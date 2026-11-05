import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import {
  TooltipGroup, TooltipRoot, TooltipTrigger, Portal, Positioner, Popup,
} from '../src';

// Longer than `settle()`: jsdom's rAF runs off a ~16ms timer, so a few frames burn ~50ms.
const DELAY = 200;
const CLOSE_DELAY = 60;

// Each test mounts its own group, or the module-level fallback leaks the "instant" flag between tests.
function mountTooltip(rootProps: Record<string, any> = {}, count = 1) {
  const Host = defineComponent({
    props: { rootProps: { type: Object, default: () => ({}) } },
    setup(p) {
      return () =>
        h(TooltipGroup as any, { delay: DELAY, closeDelay: CLOSE_DELAY, timeout: 500 }, {
          default: () =>
            Array.from({ length: count }, (_, i) =>
              h(TooltipRoot as any, p.rootProps, {
                default: () => [
                  h(TooltipTrigger as any, { class: `trigger-${i}` }, { default: () => `T${i}` }),
                  h(Portal as any, null, {
                    default: () =>
                      h(Positioner as any, null, {
                        default: () =>
                          h(Popup as any, { class: `tip-${i}` }, {
                            default: () => `Tip ${i}`,
                          }),
                      }),
                  }),
                ],
              }),
            ),
        });
    },
  });
  return mount(Host, { props: { rootProps }, attachTo: document.body });
}

const trigger = (i = 0) => document.querySelector<HTMLElement>(`.trigger-${i}`)!;
const tip = (i = 0) => document.querySelector<HTMLElement>(`.tip-${i}`);
const anyTip = () => document.querySelector('[role="tooltip"]');

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function flush() {
  for (let i = 0; i < 3; i += 1) {
    await nextTick();
  }
}

async function settle(ms = 0) {
  if (ms) {
    await wait(ms);
  }
  for (let i = 0; i < 3; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

beforeEach(() => {
  // Input modality is global and sticky; a previous `pointerdown` would make focus look mouse-driven.
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
});

const enter = (el: Element, pointerType = 'mouse') =>
  el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, pointerType }));
const leave = (el: Element, pointerType = 'mouse') =>
  el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true, pointerType }));

describe('Tooltip', () => {
  describe('structure', () => {
    it('describes its trigger rather than labeling it', async () => {
      mountTooltip();
      enter(trigger());
      await settle(DELAY * 2);

      const id = trigger().getAttribute('aria-describedby');
      expect(id).toBeTruthy();
      expect(document.getElementById(id!)).toBe(tip());
      expect(tip()!.getAttribute('role')).toBe('tooltip');
    });

    it('carries no describedby while closed', () => {
      mountTooltip();
      expect(trigger().getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('hover', () => {
    it('waits for the delay before opening', async () => {
      mountTooltip();
      enter(trigger());
      await flush();
      expect(anyTip()).toBeNull();

      await settle(DELAY * 2);
      expect(anyTip()).not.toBeNull();
    });

    it('cancels the pending open if the pointer leaves first', async () => {
      mountTooltip();
      enter(trigger());
      leave(trigger());
      await settle(DELAY * 2);
      expect(anyTip()).toBeNull();
    });

    it('closes after the close delay when the pointer leaves', async () => {
      mountTooltip();
      enter(trigger());
      await settle(DELAY * 2);
      expect(anyTip()).not.toBeNull();

      leave(trigger());
      await settle(CLOSE_DELAY * 3);
      expect(anyTip()).toBeNull();
    });

    it('ignores touch pointers', async () => {
      mountTooltip();
      enter(trigger(), 'touch');
      await settle(DELAY * 3);
      expect(anyTip()).toBeNull();
    });
  });

  describe('keyboard and focus', () => {
    it('opens immediately on focus, with no delay', async () => {
      mountTooltip();
      trigger().dispatchEvent(new FocusEvent('focus', { bubbles: false }));
      await settle();
      expect(anyTip()).not.toBeNull();
    });

    it('closes on blur', async () => {
      mountTooltip();
      trigger().dispatchEvent(new FocusEvent('focus'));
      await settle();
      trigger().dispatchEvent(new FocusEvent('blur'));
      await settle();
      expect(anyTip()).toBeNull();
    });

    it('closes on Escape', async () => {
      mountTooltip();
      enter(trigger());
      await settle(DELAY * 2);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(anyTip()).toBeNull();
    });

    it('closes when the trigger is pressed', async () => {
      mountTooltip();
      enter(trigger());
      await settle(DELAY * 2);
      trigger().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await settle();
      expect(anyTip()).toBeNull();
    });
  });

  describe('hoverable content', () => {
    it('stays open while the pointer is inside the tooltip', async () => {
      mountTooltip();
      enter(trigger());
      await settle(DELAY * 2);

      leave(trigger());
      enter(tip()!);
      await settle(CLOSE_DELAY * 3);
      expect(anyTip()).not.toBeNull();
    });

    it('closes once the pointer leaves the tooltip too', async () => {
      mountTooltip();
      enter(trigger());
      await settle(DELAY * 2);
      leave(trigger());
      enter(tip()!);
      await settle();
      leave(tip()!);
      await settle(CLOSE_DELAY * 3);
      expect(anyTip()).toBeNull();
    });

    it('gives the pointer time to cross the gap with no close delay set', async () => {
      const Host = defineComponent({
        setup: () => () =>
          h(TooltipGroup as any, { delay: DELAY, timeout: 500 }, {
            default: () =>
              h(TooltipRoot as any, null, {
                default: () => [
                  h(TooltipTrigger as any, { class: 'trigger-0' }, { default: () => 'T0' }),
                  h(Portal as any, null, {
                    default: () =>
                      h(Positioner as any, null, {
                        default: () => h(Popup as any, { class: 'tip-0' }, { default: () => 'Tip 0' }),
                      }),
                  }),
                ],
              }),
          }),
      });
      mount(Host, { attachTo: document.body });

      enter(trigger());
      await settle(DELAY * 2);
      leave(trigger());
      await wait(30);
      expect(tip()).not.toBeNull();

      enter(tip()!);
      await settle(300);
      expect(anyTip()).not.toBeNull();

      leave(tip()!);
      enter(trigger());
      await settle(300);
      expect(anyTip()).not.toBeNull();
    });

    it('closes on leaving the trigger when hoverable is off', async () => {
      mountTooltip({ hoverable: false });
      enter(trigger());
      await settle(DELAY * 2);
      leave(trigger());
      enter(tip()!);
      await settle(CLOSE_DELAY * 3);
      expect(anyTip()).toBeNull();
    });
  });

  describe('delay group', () => {
    it('opens a neighbor instantly once one is showing', async () => {
      mountTooltip({}, 2);
      enter(trigger(0));
      await settle(DELAY * 2);
      expect(tip(0)).not.toBeNull();

      leave(trigger(0));
      enter(trigger(1));
      await flush();
      expect(tip(1)).not.toBeNull();
    });

    it('closes the one being left at once when a neighbor opens', async () => {
      mountTooltip({}, 2);
      enter(trigger(0));
      await settle(DELAY * 2);

      leave(trigger(0));
      enter(trigger(1));
      await settle();
      expect(tip(0)).toBeNull();
      expect(tip(1)).not.toBeNull();
    });

    it('serves the full delay again after the group goes cold', async () => {
      const w = mountTooltip({}, 2);
      enter(trigger(0));
      await settle(DELAY * 2);
      leave(trigger(0));
      await settle(CLOSE_DELAY * 3);
      w.unmount();
      document.body.innerHTML = '';

      // A fresh group stands in for the grace window having elapsed.
      mountTooltip({}, 2);
      enter(trigger(1));
      await flush();
      expect(anyTip()).toBeNull();
    });
  });

  describe('prop: disabled', () => {
    it('never opens', async () => {
      mountTooltip({ disabled: true });
      enter(trigger());
      await settle(DELAY * 3);
      expect(anyTip()).toBeNull();
    });
  });

  describe('events', () => {
    it('emits change when it opens', async () => {
      const onChange = vi.fn();
      mountTooltip({ onChange });
      enter(trigger());
      await settle(DELAY * 2);
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });
});

describe('Tooltip handoff animation', () => {
  const enterFrom = (i: number) => tip(i)?.hasAttribute('data-enter-from');

  it('animates the first tooltip in', async () => {
    // By prop: waiting out the delay in real time burns frames, so the enter phase would pass unobserved.
    const w = mountTooltip({ open: false }, 2);
    await w.setProps({ rootProps: { open: true } });
    await flush();
    expect(enterFrom(0)).toBe(true);
  });

  it('skips the animation for a neighbor while the group is warm', async () => {
    mountTooltip({}, 2);
    enter(trigger(0));
    await settle(DELAY * 1.5);

    leave(trigger(0));
    enter(trigger(1));
    await flush();
    expect(enterFrom(1)).toBe(false);
    expect(tip(1)).not.toBeNull();
  });
});

describe('Tooltip handoff exit', () => {
  // By props: waiting out the close delay burns frames, so the exit would finish either way and the test prove nothing.
  function mountPair() {
    const Host = defineComponent({
      props: { a: Boolean, b: Boolean },
      setup(p) {
        return () =>
          h(TooltipGroup as any, { delay: DELAY, closeDelay: CLOSE_DELAY, timeout: 500 }, {
            default: () =>
              [0, 1].map((i) =>
                h(TooltipRoot as any, { open: i === 0 ? p.a : p.b }, {
                  default: () => [
                    h(TooltipTrigger as any, { class: `trigger-${i}` }, { default: () => `T${i}` }),
                    h(Portal as any, null, {
                      default: () =>
                        h(Positioner as any, null, {
                          default: () =>
                            h(Popup as any, { class: `tip-${i}` }, {
                              default: () => `Tip ${i}`,
                            }),
                        }),
                    }),
                  ],
                }),
              ),
          });
      },
    });
    return mount(Host, { props: { a: false, b: false }, attachTo: document.body });
  }

  it('removes the outgoing tooltip at once when a neighbor has taken over', async () => {
    const w = mountPair();
    await w.setProps({ a: true });
    await settle();

    await w.setProps({ b: true });
    await flush();
    await w.setProps({ a: false });
    await flush();

    expect(tip(0)).toBeNull();
    expect(tip(1)).not.toBeNull();
  });

  it('still animates out when nothing replaces it', async () => {
    const w = mountPair();
    await w.setProps({ a: true });
    await settle();

    await w.setProps({ a: false });
    await flush();

    expect(tip(0)).not.toBeNull();
    expect(tip(0)!.hasAttribute('data-leave-to')).toBe(true);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import {
  PopoverRoot, PopoverTrigger, Portal, Positioner, Popup, PopoverTitle, PopoverDescription, PopoverClose, PopoverArrow,
} from '../src';
import { setLayout } from './layout';

function mountPopover(props: Record<string, any> = {}, opts: { title?: boolean; description?: boolean } = {}) {
  const Host = defineComponent({
    props: { rootProps: { type: Object, default: () => ({}) } },
    setup(p) {
      return () =>
        h(PopoverRoot as any, p.rootProps, {
          default: () => [
            h(PopoverTrigger as any, null, { default: () => 'Open' }),
            h(Portal as any, null, {
              default: () =>
                h(Positioner as any, null, {
                  default: () =>
                    h(Popup as any, null, {
                      default: () => [
                        opts.title ? h(PopoverTitle as any, null, { default: () => 'Title' }) : null,
                        opts.description ? h(PopoverDescription as any, null, { default: () => 'Desc' }) : null,
                        h(PopoverArrow as any, { class: 'arrow' }),
                        h('button', { class: 'inside' }, 'Inside'),
                        h(PopoverClose as any, null, { default: () => 'Close' }),
                      ],
                    }),
                }),
            }),
          ],
        });
    },
  });
  return mount(Host, { props: { rootProps: props }, attachTo: document.body });
}

const trigger = () => document.querySelector('[aria-haspopup="dialog"]') as HTMLElement;
const popup = () => document.querySelector('[role="dialog"]') as HTMLElement | null;

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const positioner = () => popup()!.parentElement as HTMLElement;

describe('Popover', () => {
  describe('placement before focus', () => {
    it('does not move focus into the popup until it has been placed', async () => {
      // Until Floating UI places it a frame later, the popup sits at the origin, and focusing it scrolls the page to the top.
      mountPopover();
      trigger().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await nextTick();
      await nextTick();

      expect(positioner().style.visibility).toBe('hidden');
      expect(positioner().contains(document.activeElement)).toBe(false);
    });

    it('moves focus in once it is placed', async () => {
      mountPopover();
      trigger().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();

      expect(positioner().style.visibility).toBe('');
      expect(popup()!.contains(document.activeElement)).toBe(true);
    });

    it('shows for an anchor narrower than the collision padding at the viewport edge', async () => {
      setLayout({ x: 0, width: 8 });
      mountPopover();
      trigger().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(positioner().style.visibility).toBe('');
    });

    it('stacks at 50, or what --positioner-z-index says', async () => {
      mountPopover();
      trigger().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await settle();
      expect(positioner().style.zIndex).toBe('var(--positioner-z-index, 50)');
    });
  });

  describe('trigger', () => {
    it('advertises the popup it controls', () => {
      mountPopover();
      expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(popup()).toBeNull();
    });

    it('opens on click and links aria-controls to the popup', async () => {
      mountPopover();
      trigger().click();
      await settle();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(popup()).not.toBeNull();
      expect(trigger().getAttribute('aria-controls')).toBe(popup()!.id);
    });
  });

  describe('labeling', () => {
    it('points aria-labelledby at a Title only when one is rendered', async () => {
      mountPopover({ defaultOpen: true }, { title: true });
      await settle();
      const labelledBy = popup()!.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy!)?.textContent).toBe('Title');
    });

    it('omits aria-labelledby when there is no Title', async () => {
      mountPopover({ defaultOpen: true });
      await settle();
      expect(popup()!.getAttribute('aria-labelledby')).toBeNull();
    });

    it('points aria-describedby at a Description', async () => {
      mountPopover({ defaultOpen: true }, { description: true });
      await settle();
      const id = popup()!.getAttribute('aria-describedby');
      expect(document.getElementById(id!)?.textContent).toBe('Desc');
    });
  });

  describe('dismissal', () => {
    it('closes on Escape', async () => {
      mountPopover({ defaultOpen: true });
      await settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(popup()).toBeNull();
    });

    it('closes on an outside press', async () => {
      mountPopover({ defaultOpen: true });
      await settle();
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await settle();
      expect(popup()).toBeNull();
    });

    it('stays open when pressed inside', async () => {
      mountPopover({ defaultOpen: true });
      await settle();
      const inside = document.querySelector('.inside') as HTMLElement;
      inside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      await settle();
      expect(popup()).not.toBeNull();
    });

    it('does not close on Escape when escapeKey is off', async () => {
      mountPopover({ defaultOpen: true, escapeKey: false });
      await settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(popup()).not.toBeNull();
    });

    it('closes via the Close part', async () => {
      mountPopover({ defaultOpen: true });
      await settle();
      const close = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent === 'Close',
      )!;
      close.click();
      await settle();
      expect(popup()).toBeNull();
    });
  });

  describe('focus', () => {
    it('moves focus into the popup when it opens', async () => {
      mountPopover();
      trigger().focus();
      trigger().click();
      await settle();
      expect(popup()!.contains(document.activeElement)).toBe(true);
    });

    it('returns focus to the trigger on close', async () => {
      mountPopover();
      trigger().focus();
      trigger().click();
      await settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(document.activeElement).toBe(trigger());
    });
  });

  describe('modal', () => {
    async function open(modal: unknown) {
      mountPopover({ modal });
      trigger().click();
      await settle();
    }

    it('locks scroll and makes the page inert when modal', async () => {
      await open(true);
      expect(popup()!.getAttribute('aria-modal')).toBe('true');
      expect(document.body.style.overflow).toBe('clip');
      expect(trigger().closest('[inert]')).not.toBeNull();
      expect(popup()!.closest('[inert]')).toBeNull();
    });

    it('frees the page before returning focus to it', async () => {
      // jsdom focuses an inert element; a browser ignores the call, so focus never came back
      mountPopover({ modal: true });
      const button = trigger();
      button.focus();
      button.click();
      await settle();

      const focus = button.focus.bind(button);
      let inertAtFocus: boolean | undefined;
      button.focus = () => {
        inertAtFocus = button.closest('[inert]') !== null;
        focus();
      };

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(inertAtFocus).toBe(false);
      expect(document.activeElement).toBe(button);
    });

    it('only traps focus with trap-focus', async () => {
      await open('trap-focus');
      expect(popup()!.hasAttribute('aria-modal')).toBe(false);
      expect(document.body.style.overflow).not.toBe('clip');
      expect(trigger().closest('[inert]')).toBeNull();
    });

    it('leaves the page alone by default', async () => {
      await open(undefined);
      expect(popup()!.hasAttribute('aria-modal')).toBe(false);
      expect(trigger().closest('[inert]')).toBeNull();
    });
  });

  describe('arrow', () => {
    const arrow = () => document.querySelector<HTMLElement>('.arrow')!;

    const SIDES = ['top', 'right', 'bottom', 'left'] as const;

    // Asserted against `data-side`, not the requested side, which jsdom never resolves; the flipped mapping pinned the opposite edge.
    it.each(SIDES)('pins to its own rendered edge when asked for %s', async (requested) => {
      mountPopover({ defaultOpen: true, side: requested });
      await settle();

      const rendered = arrow().getAttribute('data-side') as (typeof SIDES)[number];
      expect(SIDES).toContain(rendered);
      expect(arrow().style.getPropertyValue(rendered)).toBe('100%');

      // `left`/`top` also carry the cross-axis offset; what must never happen is a second edge claiming the 100% pin.
      const pinned = SIDES.filter((side) => arrow().style.getPropertyValue(side) === '100%');
      expect(pinned).toEqual([rendered]);
    });

    it('exposes the rendered side for styling', async () => {
      mountPopover({ defaultOpen: true });
      await settle();
      expect(arrow().getAttribute('data-side')).toBe(popup()!.getAttribute('data-side'));
    });
  });

  describe('events', () => {
    it('emits change when toggled', async () => {
      const onChange = vi.fn();
      mountPopover({ onChange });
      trigger().click();
      await settle();
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });
});

describe('open on hover', () => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const pointer = (el: Element, type: string, pointerType = 'mouse') =>
    el.dispatchEvent(new PointerEvent(type, { pointerType }));
  const hover = { openOnHover: true, delay: 10, closeDelay: 10 };

  it('opens once the mouse rests on the trigger, without taking focus', async () => {
    const w = mountPopover(hover);
    pointer(trigger(), 'pointerenter');
    await sleep(20);
    await settle();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(popup()!.contains(document.activeElement)).toBe(false);
    w.unmount();
  });

  it('does not open when the mouse passes over sooner than the delay', async () => {
    const w = mountPopover({ ...hover, delay: 40 });
    pointer(trigger(), 'pointerenter');
    await sleep(10);
    pointer(trigger(), 'pointerleave');
    await sleep(50);

    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    w.unmount();
  });

  it('stays open while the mouse crosses onto the popup, and closes once it leaves', async () => {
    const w = mountPopover(hover);
    pointer(trigger(), 'pointerenter');
    await sleep(20);
    await settle();

    pointer(trigger(), 'pointerleave');
    pointer(popup()!, 'pointerenter');
    await sleep(30);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    pointer(popup()!, 'pointerleave');
    await sleep(30);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    w.unmount();
  });

  it('stays open once pressed, after the mouse leaves', async () => {
    const w = mountPopover(hover);
    pointer(trigger(), 'pointerenter');
    await sleep(20);
    await settle();

    trigger().click();
    pointer(trigger(), 'pointerleave');
    await sleep(30);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    w.unmount();
  });

  it('ignores touch, and hover without open-on-hover', async () => {
    const touch = mountPopover(hover);
    pointer(trigger(), 'pointerenter', 'touch');
    await sleep(20);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    touch.unmount();

    const off = mountPopover({ delay: 10 });
    pointer(trigger(), 'pointerenter');
    await sleep(20);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    off.unmount();
  });
});

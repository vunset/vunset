import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import {
  DialogRoot, DialogTrigger, Portal, DialogBackdrop, Popup, DialogTitle, DialogDescription, DialogClose,
} from '../src';

function mountDialog(props: Record<string, any> = {}, parts: { title?: boolean; description?: boolean; autofocusClose?: boolean } = {}) {
  const Host = defineComponent({
    props: { rootProps: { type: Object, default: () => ({}) } },
    setup(p) {
      return () =>
        h(DialogRoot as any, p.rootProps, {
          default: () => [
            h(DialogTrigger as any, null, { default: () => 'Open' }),
            h(Portal as any, null, {
              default: () => [
                h(DialogBackdrop as any, { class: 'backdrop' }),
                h(Popup as any, null, {
                  default: () => [
                    parts.title ? h(DialogTitle as any, null, { default: () => 'Title' }) : null,
                    parts.description
                      ? h(DialogDescription as any, null, { default: () => 'Desc' })
                      : null,
                    h('button', { class: 'inside' }, 'Inside'),
                    h(DialogClose as any, parts.autofocusClose ? { autofocus: true } : null, { default: () => 'Close' }),
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

const trigger = () => document.querySelector<HTMLElement>('[aria-haspopup="dialog"]')!;
const popup = () => document.querySelector<HTMLElement>('[role="dialog"]');
const backdrop = () => document.querySelector<HTMLElement>('.backdrop');

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const escape = () =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
const press = (el: EventTarget) =>
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

describe('Dialog', () => {
  describe('structure', () => {
    it('advertises the dialog it controls', () => {
      mountDialog();
      expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(popup()).toBeNull();
    });

    it('opens on click and marks itself modal', async () => {
      mountDialog();
      trigger().click();
      await settle();
      expect(popup()).not.toBeNull();
      expect(popup()!.getAttribute('aria-modal')).toBe('true');
      expect(trigger().getAttribute('aria-controls')).toBe(popup()!.id);
    });

    it('omits aria-modal when not modal', async () => {
      mountDialog({ defaultOpen: true, modal: false });
      await settle();
      expect(popup()!.getAttribute('aria-modal')).toBeNull();
    });

    it('keeps the backdrop out of the accessibility tree', async () => {
      mountDialog({ defaultOpen: true });
      await settle();
      expect(backdrop()!.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('labeling', () => {
    it('points aria-labelledby at a Title only when one is rendered', async () => {
      mountDialog({ defaultOpen: true }, { title: true });
      await settle();
      const id = popup()!.getAttribute('aria-labelledby');
      expect(document.getElementById(id!)?.textContent).toBe('Title');
    });

    it('omits aria-labelledby with no Title', async () => {
      mountDialog({ defaultOpen: true });
      await settle();
      expect(popup()!.getAttribute('aria-labelledby')).toBeNull();
    });

    it('points aria-describedby at a Description', async () => {
      mountDialog({ defaultOpen: true }, { description: true });
      await settle();
      const id = popup()!.getAttribute('aria-describedby');
      expect(document.getElementById(id!)?.textContent).toBe('Desc');
    });
  });

  describe('dismissal', () => {
    it('closes on Escape', async () => {
      mountDialog({ defaultOpen: true });
      await settle();
      escape();
      await settle();
      expect(popup()).toBeNull();
    });

    it('closes when the backdrop is pressed, once asked to', async () => {
      mountDialog({ defaultOpen: true, outsidePress: true });
      await settle();
      press(backdrop()!);
      await settle();
      expect(popup()).toBeNull();
    });

    it('stays open when pressed inside', async () => {
      mountDialog({ defaultOpen: true });
      await settle();
      press(document.querySelector('.inside')!);
      await settle();
      expect(popup()).not.toBeNull();
    });

    it('keeps the backdrop inert by default', async () => {
      // A dialog interrupts to ask something, so waving it away is opt-in:
      // `outsidePress` is the only thing that makes the backdrop dismiss it.
      mountDialog({ defaultOpen: true });
      await settle();
      press(backdrop()!);
      await settle();
      expect(popup()).not.toBeNull();
    });

    it('ignores Escape when escapeKey is off', async () => {
      mountDialog({ defaultOpen: true, escapeKey: false });
      await settle();
      escape();
      await settle();
      expect(popup()).not.toBeNull();
    });

    it('closes via the Close part', async () => {
      mountDialog({ defaultOpen: true });
      await settle();
      Array.from(document.querySelectorAll('button'))
        .find((b) => b.textContent === 'Close')!
        .click();
      await settle();
      expect(popup()).toBeNull();
    });
  });

  describe('focus', () => {
    it('moves focus inside on open', async () => {
      mountDialog();
      trigger().focus();
      trigger().click();
      await settle();
      expect(popup()!.contains(document.activeElement)).toBe(true);
    });

    it('starts on the first focusable element', async () => {
      mountDialog();
      trigger().click();
      await settle();
      expect(document.activeElement?.className).toBe('inside');
    });

    it('starts on an autofocus element over the first one', async () => {
      mountDialog({}, { autofocusClose: true });
      trigger().click();
      await settle();
      expect(document.activeElement?.textContent).toBe('Close');
    });

    it('moves focus inside and traps Tab when mounted open', async () => {
      mountDialog({ defaultOpen: true });
      await settle();
      expect(document.activeElement?.className).toBe('inside');

      const close = document.querySelector<HTMLElement>('[role="dialog"] button:last-child')!;
      close.focus();
      const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      close.dispatchEvent(tab);
      expect(tab.defaultPrevented).toBe(true);
    });

    it('returns focus to the trigger on close', async () => {
      mountDialog();
      trigger().focus();
      trigger().click();
      await settle();
      escape();
      await settle();
      expect(document.activeElement).toBe(trigger());
    });

    it('frees the page before returning focus to it', async () => {
      // jsdom focuses an inert element; a browser ignores the call, so focus never came back
      mountDialog();
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

      escape();
      await settle();
      expect(inertAtFocus).toBe(false);
    });
  });

  describe('alertdialog', () => {
    const alert = () => document.querySelector<HTMLElement>('[role="alertdialog"]');

    it('renders the popup with the alertdialog role', async () => {
      mountDialog({ defaultOpen: true, role: 'alertdialog' });
      await settle();
      expect(alert()).not.toBeNull();
      expect(popup()).toBeNull();
      expect(trigger().getAttribute('aria-controls')).toBe(alert()!.id);
    });

    it('stays modal even when asked not to be', async () => {
      mountDialog({ defaultOpen: true, role: 'alertdialog', modal: false });
      await settle();
      expect(alert()!.getAttribute('aria-modal')).toBe('true');
      expect(document.body.style.overflow).toBe('clip');
    });

    it('ignores a backdrop press even when outsidePress is on', async () => {
      mountDialog({ defaultOpen: true, role: 'alertdialog', outsidePress: true });
      await settle();
      press(backdrop()!);
      await settle();
      expect(alert()).not.toBeNull();
    });

    it('still closes on Escape', async () => {
      mountDialog({ defaultOpen: true, role: 'alertdialog' });
      await settle();
      escape();
      await settle();
      expect(alert()).toBeNull();
    });
  });

  describe('scroll lock', () => {
    it('locks the page while open and restores afterwards', async () => {
      const before = document.body.style.overflow;
      mountDialog();
      trigger().click();
      await settle();
      expect(document.body.style.overflow).toBe('clip');

      escape();
      await settle();
      expect(document.body.style.overflow).toBe(before);
    });

    it('locks the root element too, and restores what it had', async () => {
      // An app that sets an overflow on `<html>` scrolls by it, not by the body.
      document.documentElement.style.overflow = 'auto';
      mountDialog();
      trigger().click();
      await settle();
      expect(document.documentElement.style.overflow).toBe('clip');

      escape();
      await settle();
      expect(document.documentElement.style.overflow).toBe('auto');
      document.documentElement.style.overflow = '';
    });

    it('leaves scrolling alone when not modal', async () => {
      mountDialog({ defaultOpen: true, modal: false });
      await settle();
      expect(document.body.style.overflow).not.toBe('clip');
    });
  });

  describe('background inerting', () => {
    it('inerts siblings while open and restores them after', async () => {
      const sibling = document.createElement('div');
      document.body.appendChild(sibling);

      mountDialog();
      trigger().click();
      await settle();
      // aria-modal alone is not reliably honored; inert is what makes the page
      // behind unreachable.
      expect(sibling.hasAttribute('inert')).toBe(true);
      expect(sibling.getAttribute('aria-hidden')).toBe('true');

      escape();
      await settle();
      expect(sibling.hasAttribute('inert')).toBe(false);
      expect(sibling.hasAttribute('aria-hidden')).toBe(false);
    });

    it('inerts siblings when mounted already open, but not the dialog', async () => {
      const sibling = document.createElement('div');
      document.body.appendChild(sibling);
      mountDialog({ defaultOpen: true });
      await settle();

      expect(sibling.hasAttribute('inert')).toBe(true);
      expect(popup()!.closest('[inert]')).toBeNull();

      escape();
      await settle();
      expect(sibling.hasAttribute('inert')).toBe(false);
    });

    it('leaves the page reachable when not modal', async () => {
      const sibling = document.createElement('div');
      document.body.appendChild(sibling);
      mountDialog({ defaultOpen: true, modal: false });
      await settle();
      expect(sibling.hasAttribute('inert')).toBe(false);
    });
  });

  describe('events', () => {
    it('emits change when opened', async () => {
      const onChange = vi.fn();
      mountDialog({ onChange });
      trigger().click();
      await settle();
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('emits closed once the exit animation has finished, not on closing', async () => {
      const onClosed = vi.fn();
      mountDialog({ defaultOpen: true, onClosed });
      await settle();

      let finish!: () => void;
      const finished = new Promise<void>((resolve) => (finish = resolve));
      popup()!.getAnimations = () => [{ finished } as unknown as Animation];

      escape();
      await settle();
      expect(popup()).not.toBeNull();
      expect(onClosed).not.toHaveBeenCalled();

      finish();
      await settle();
      expect(popup()).toBeNull();
      expect(onClosed).toHaveBeenCalledTimes(1);
    });

    it('does not wait on a looping animation inside, such as a spinner', async () => {
      const onClosed = vi.fn();
      mountDialog({ defaultOpen: true, onClosed });
      await settle();

      const spinner = {
        finished: new Promise(() => {}),
        effect: { getComputedTiming: () => ({ iterations: Infinity }) },
      } as unknown as Animation;
      popup()!.getAnimations = () => [spinner];

      escape();
      await settle();
      expect(popup()).toBeNull();
      expect(onClosed).toHaveBeenCalledTimes(1);
    });

    it('animates in when mounted already open', async () => {
      mountDialog({ defaultOpen: true });
      expect(popup()!.hasAttribute('data-enter-from')).toBe(true);
      await settle();
      expect(popup()!.hasAttribute('data-enter-from')).toBe(false);
    });

    it('can be mounted to be shown and unmounted on closed, focus back where it was', async () => {
      const shown = ref(false);
      const Host = defineComponent({
        setup: () => () => [
          h('button', { class: 'opener', onClick: () => (shown.value = true) }, 'Sign out'),
          shown.value
            ? h(DialogRoot as any, { defaultOpen: true, onClosed: () => (shown.value = false) }, {
                default: () =>
                  h(Portal as any, null, {
                    default: () => h(Popup as any, null, { default: () => h(DialogClose as any, null, () => 'Stay') }),
                  }),
              })
            : null,
        ],
      });
      mount(Host, { attachTo: document.body });

      const opener = document.querySelector<HTMLElement>('.opener')!;
      opener.focus();
      opener.click();
      await settle();
      expect(popup()).not.toBeNull();

      document.querySelector<HTMLElement>('[role="dialog"] button')!.click();
      await settle();
      expect(shown.value).toBe(false);
      expect(popup()).toBeNull();
      expect(document.activeElement).toBe(opener);
    });
  });
});

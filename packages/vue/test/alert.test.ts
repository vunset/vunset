import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { AlertRoot, AlertTitle, AlertDescription } from '../src';

/**
 * Awaits a tick: the parts register during their own setup, which is inside the
 * alert's render, so the attributes that registration decides land on the
 * render after it.
 */
async function mountAlert(props: Record<string, any> = {}, children: any[] = []) {
  const Host = defineComponent({
    setup() {
      return () => h(AlertRoot as any, props, { default: () => children });
    },
  });
  const wrapper = mount(Host, { attachTo: document.body });
  await nextTick();
  return wrapper;
}

const alert = () => document.querySelector<HTMLElement>('[data-part="alert"]')!;
const title = () => document.querySelector<HTMLElement>('[data-part="title"]');
const description = () => document.querySelector<HTMLElement>('[data-part="description"]');

describe('Alert', () => {
  describe('the box', () => {
    it('keeps `as` out of its attributes', async () => {
      await mountAlert({ as: 'section' });
      expect(alert().hasAttribute('data-as')).toBe(false);
    });

    it('decides no look: what kind of message it is stays the caller’s', async () => {
      await mountAlert();
      expect(alert().tagName).toBe('DIV');
      expect(alert().hasAttribute('data-variant')).toBe(false);
    });

    it('interrupts, which is what makes it an alert', async () => {
      await mountAlert({ 'data-variant': 'error' });
      expect(alert().getAttribute('role')).toBe('alert');
      expect(alert().getAttribute('data-variant')).toBe('error');
    });

    it('lets the caller wait its turn instead', async () => {
      // A notice that is merely present should not talk over anything.
      await mountAlert({ role: 'status' });
      expect(alert().getAttribute('role')).toBe('status');
    });

    it('renders a different tag when asked', async () => {
      await mountAlert({ as: 'section' });
      expect(alert().tagName).toBe('SECTION');
    });
  });

  describe('naming', () => {
    it('names itself after the title and describes itself with the description', async () => {
      await mountAlert({}, [
        h(AlertTitle as any, null, { default: () => 'Upload failed' }),
        h(AlertDescription as any, null, { default: () => 'The connection dropped.' }),
      ]);

      expect(alert().getAttribute('aria-labelledby')).toBe(title()!.id);
      expect(alert().getAttribute('aria-describedby')).toBe(description()!.id);
      expect(title()!.textContent).toBe('Upload failed');
    });

    it('follows a title and description given ids of their own', async () => {
      await mountAlert({}, [
        h(AlertTitle as any, { id: 'first' }, { default: () => 'Upload failed' }),
        h(AlertDescription as any, { id: 'details' }, { default: () => 'The connection dropped.' }),
      ]);

      expect(title()!.id).toBe('first');
      expect(alert().getAttribute('aria-labelledby')).toBe('first');
      expect(alert().getAttribute('aria-describedby')).toBe('details');
    });

    it('claims no description when there is none', async () => {
      // A dangling reference reads as no name at all, which is worse than
      // falling back to the text inside.
      await mountAlert({}, [h(AlertTitle as any, null, { default: () => 'Saved' })]);

      expect(alert().getAttribute('aria-labelledby')).toBe(title()!.id);
      expect(alert().getAttribute('aria-describedby')).toBeNull();
    });

    it('claims no name when there is no title', async () => {
      await mountAlert({}, [h(AlertDescription as any, null, { default: () => 'Just prose.' })]);

      expect(alert().getAttribute('aria-labelledby')).toBeNull();
      expect(alert().getAttribute('aria-describedby')).toBe(description()!.id);
    });

    it('claims neither when the alert is plain text', async () => {
      await mountAlert({}, ['Something happened']);

      expect(alert().getAttribute('aria-labelledby')).toBeNull();
      expect(alert().getAttribute('aria-describedby')).toBeNull();
    });

    it('lets go of a title that leaves', async () => {
      // The undo half of the registration: a reference has to disappear with
      // the element it names, or it dangles from the next render on.
      const showTitle = ref(true);
      const Host = defineComponent({
        setup() {
          return () =>
            h(AlertRoot as any, null, {
              default: () => [
                showTitle.value ? h(AlertTitle as any, null, { default: () => 'Saved' }) : null,
                h(AlertDescription as any, null, { default: () => 'All good.' }),
              ],
            });
        },
      });
      mount(Host, { attachTo: document.body });
      await nextTick();
      expect(alert().getAttribute('aria-labelledby')).not.toBeNull();

      showTitle.value = false;
      await nextTick();
      expect(title()).toBeNull();
      expect(alert().getAttribute('aria-labelledby')).toBeNull();
      // The description it still has is untouched.
      expect(alert().getAttribute('aria-describedby')).toBe(description()!.id);
    });
  });

  describe('the parts', () => {
    it('say where they belong when used outside an alert', () => {
      expect(() => mount(AlertTitle as any)).toThrow(/Alert/);
      expect(() => mount(AlertDescription as any)).toThrow(/Alert/);
    });

    it('take a class and a tag of the caller’s own', () => {
      mountAlert({}, [
        h(AlertTitle as any, { class: 'AlertTitle', as: 'h3' }, { default: () => 'Heads up' }),
      ]);

      expect(title()!.tagName).toBe('H3');
      expect(title()!.classList.contains('AlertTitle')).toBe(true);
      // Its own hooks survive the caller's additions.
      expect(title()!.getAttribute('data-part')).toBe('title');
    });

    it('give each alert on the page its own ids', async () => {
      const Host = defineComponent({
        setup() {
          return () => [
            h(AlertRoot as any, { class: 'one' }, { default: () => h(AlertTitle as any) }),
            h(AlertRoot as any, { class: 'two' }, { default: () => h(AlertTitle as any) }),
          ];
        },
      });
      mount(Host, { attachTo: document.body });
      await nextTick();

      const [first, second] = Array.from(document.querySelectorAll('[data-part="alert"]'));
      expect(first.getAttribute('aria-labelledby')).not.toBe(second.getAttribute('aria-labelledby'));
    });
  });
});

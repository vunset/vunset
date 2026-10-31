import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { Button } from '../src';

function mountButton(props: Record<string, any> = {}, attrs: Record<string, any> = {}) {
  return mount(Button as any, {
    props,
    attrs,
    slots: { default: () => 'Save' },
    attachTo: document.body,
  });
}

/** Stands in for RouterLink: a component that renders an anchor from `to`. */
const RouterLinkStub = defineComponent({
  name: 'RouterLinkStub',
  props: { to: { type: String, required: true } },
  setup(props, { slots, attrs }) {
    return () => h('a', { ...attrs, href: props.to, 'data-router-link': '' }, slots.default?.());
  },
});

/**
 * Through the wrapper rather than `dispatchEvent`. Vue ignores an event older
 * than the listener it would run, and a hand-built event dispatched right after
 * a mount trips that guard often enough to make a suite flaky — which reads as
 * a handler that was never wired rather than as a timing artifact.
 */
const click = (wrapper: { trigger: (event: string, options?: object) => Promise<void> }) =>
  wrapper.trigger('click');

/**
 * Counts clicks with a listener of the test's own rather than through Vue's.
 * Keyboard activation dispatches a click the component builds itself, and Vue
 * skips an invoker whose attachment looks newer than the event — true of a
 * synthesized event under jsdom's coarser clock often enough to make the suite
 * flaky. A plain DOM listener has no such guard, and it is the same click.
 */
function countClicks(element: Element) {
  let clicks = 0;
  element.addEventListener('click', () => {
    clicks += 1;
  });
  return () => clicks;
}

const key = (
  wrapper: { trigger: (event: string, options?: object) => Promise<void> },
  name: string,
  type: 'keydown' | 'keyup' = 'keydown',
) => wrapper.trigger(type, { key: name });

describe('Button', () => {
  describe('as a button', () => {
    it('renders a native button that will not submit a form by accident', async () => {
      const w = mountButton();
      expect(w.element.tagName).toBe('BUTTON');
      expect(w.attributes('type')).toBe('button');
      expect(w.attributes('data-part')).toBe('button');
      // No look decided for the caller.
      expect(w.attributes('data-size')).toBeUndefined();
      expect(w.attributes('data-variant')).toBeUndefined();
    });

    it('submits when asked to', async () => {
      const w = mountButton({ type: 'submit' });
      expect(w.attributes('type')).toBe('submit');
    });

    it('adds no role, tabindex or aria-disabled it does not need', async () => {
      // A native button arrives with all three; restating them would only be
      // more to keep in sync.
      const w = mountButton();
      expect(w.attributes('role')).toBeUndefined();
      expect(w.attributes('tabindex')).toBeUndefined();
      expect(w.attributes('aria-disabled')).toBeUndefined();
    });

    it('uses the native disabled attribute', async () => {
      const w = mountButton({ disabled: true });
      expect(w.attributes('disabled')).toBeDefined();
      expect(w.attributes('data-disabled')).toBeDefined();
    });

    it('keeps a disabled button focusable when asked, announced as disabled', async () => {
      // What a toolbar wants: arrowing across it should not skip the controls
      // that happen to be off.
      const w = mountButton({ disabled: true, focusableWhenDisabled: true });
      expect(w.attributes('disabled')).toBeUndefined();
      expect(w.attributes('aria-disabled')).toBe('true');
    });
  });

  describe('as anything else', () => {
    it('supplies the role, the tab stop and the keyboard', async () => {
      const w = mountButton({ as: 'div' });
      expect(w.element.tagName).toBe('DIV');
      expect(w.attributes('role')).toBe('button');
      expect(w.attributes('tabindex')).toBe('0');
      // `type` is a button attribute; on anything else it means something else.
      expect(w.attributes('type')).toBeUndefined();
    });

    it('activates on Enter, as a native button does', async () => {
      const w = mountButton({ as: 'div' });
      const clicks = countClicks(w.element);

      await key(w, 'Enter');
      expect(clicks()).toBe(1);
    });

    it('activates on Space release, not on the press', async () => {
      const w = mountButton({ as: 'div' });
      const clicks = countClicks(w.element);

      await key(w, ' ');
      expect(clicks()).toBe(0);

      await key(w, ' ', 'keyup');
      expect(clicks()).toBe(1);
    });

    it('holds the page still while Space is down', async () => {
      const w = mountButton({ as: 'div' });

      // Read from a listener of our own, which runs after the component's:
      // the wrapper does not hand the event back.
      let prevented: boolean | null = null;
      w.element.addEventListener('keydown', (event: Event) => {
        prevented = event.defaultPrevented;
      });

      await key(w, ' ');
      expect(prevented).toBe(true);
    });

    it('says it is disabled and leaves the tab order', async () => {
      const w = mountButton({ as: 'div', disabled: true });
      expect(w.attributes('aria-disabled')).toBe('true');
      expect(w.attributes('tabindex')).toBe('-1');
      expect(w.attributes('disabled')).toBeUndefined();
    });

    it('ignores the keyboard while disabled', async () => {
      const w = mountButton({ as: 'div', disabled: true });
      const clicks = countClicks(w.element);

      await key(w, 'Enter');
      await key(w, ' ', 'keyup');
      expect(clicks()).toBe(0);
    });
  });

  describe('as a link', () => {
    it('leaves a link its own semantics', async () => {
      const w = mountButton({ as: 'a' }, { href: '/pricing' });
      expect(w.element.tagName).toBe('A');
      expect(w.attributes('href')).toBe('/pricing');
      // It goes somewhere, which is worth announcing, and Enter already works.
      expect(w.attributes('role')).toBeUndefined();
      expect(w.attributes('type')).toBeUndefined();
      expect(w.attributes('tabindex')).toBeUndefined();
    });

    it('renders a routing component and hands it its destination', async () => {
      const w = mount(Button as any, {
        props: { as: RouterLinkStub },
        attrs: { to: '/settings', 'data-variant': 'ghost' },
        slots: { default: () => 'Settings' },
        attachTo: document.body,
      });

      expect(w.element.tagName).toBe('A');
      expect(w.attributes('href')).toBe('/settings');
      expect(w.attributes('data-router-link')).toBeDefined();
      // Still a button as far as the stylesheet is concerned.
      expect(w.attributes('data-variant')).toBe('ghost');
      expect(w.attributes('role')).toBeUndefined();
    });

    it('stops being a link when disabled', async () => {
      // A routing component binds its own click handler inside itself, where
      // preventing the event is not guaranteed to get there first. The only
      // version of disabled that cannot be clicked through is not rendering it.
      const w = mount(Button as any, {
        props: { as: RouterLinkStub, disabled: true },
        attrs: { to: '/settings' },
        slots: { default: () => 'Settings' },
        attachTo: document.body,
      });

      expect(w.element.tagName).toBe('BUTTON');
      expect(w.attributes('disabled')).toBeDefined();
      expect(w.attributes('href')).toBeUndefined();
      expect(w.attributes('to')).toBeUndefined();
    });

    it('stops being an anchor when disabled too', async () => {
      const w = mountButton({ as: 'a', disabled: true }, { href: '/pricing' });
      expect(w.element.tagName).toBe('BUTTON');
      expect(w.attributes('href')).toBeUndefined();
    });
  });

  describe('disabled', () => {
    it('swallows the click before the caller’s own handler runs', async () => {
      // `mergeProps` runs the caller's handler first everywhere else, which
      // would let a disabled control still do its job.
      const onClick = vi.fn();
      const w = mountButton({ as: 'div', disabled: true }, { onClick });

      await click(w);
      await nextTick();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('lets the click through once it is enabled again', async () => {
      const onClick = vi.fn();
      const w = mountButton({ as: 'div', disabled: true }, { onClick });

      await w.setProps({ disabled: false });
      await click(w);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('stops a click on the content inside it as well', async () => {
      const onClick = vi.fn();
      const w = mount(Button as any, {
        props: { as: 'div', disabled: true },
        attrs: { onClick },
        slots: { default: () => h('span', { class: 'label' }, 'Save') },
        attachTo: document.body,
      });

      await click(w.find('.label'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('composition', () => {
    it('passes the caller’s own hooks through', async () => {
      const w = mountButton({}, { 'data-size': '2xl', 'data-variant': 'ghost' });
      expect(w.attributes('data-size')).toBe('2xl');
      expect(w.attributes('data-variant')).toBe('ghost');
    });

    it('hands the state to the slot', async () => {
      const w = mount(Button as any, {
        props: { disabled: true },
        slots: { default: (state: any) => h('i', `${state.disabled}`) },
        attachTo: document.body,
      });
      expect(w.text()).toBe('true');
    });

    it('keeps the caller’s class and runs their handler when enabled', async () => {
      const onClick = vi.fn();
      const w = mountButton({}, { class: 'btn', onClick });

      await click(w);
      expect(w.classes()).toContain('btn');
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});

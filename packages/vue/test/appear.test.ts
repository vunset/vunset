import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createSSRApp, h, nextTick } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { Appear } from '../src';

function mountAppear(props: Record<string, any> = {}) {
  return mount(Appear as any, {
    props,
    slots: { default: () => h('p', { class: 'body' }, 'Hello') },
    attachTo: document.body,
  });
}

const el = () => document.querySelector<HTMLElement>('[data-part="appear"]');

/** Long enough for the enter phase to settle and for an exit to finish. */
async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await nextTick();
  }
}

describe('Appear', () => {
  describe('showing', () => {
    it('renders the content and publishes the open hook', async () => {
      mountAppear();
      await settle();

      expect(el()).not.toBeNull();
      expect(el()!.hasAttribute('data-open')).toBe(true);
      expect(document.querySelector('.body')!.textContent).toBe('Hello');
    });

    it('renders nothing while hidden', async () => {
      mountAppear({ open: false });
      await settle();
      expect(el()).toBeNull();
    });

    it('animates in from the enter-from hook, then settles', async () => {
      const w = mountAppear({ open: false });
      await settle();

      await w.setProps({ open: true });
      await nextTick();
      // The first frame is the "from" state a transition needs to start at.
      expect(el()!.hasAttribute('data-enter-from')).toBe(true);

      await settle();
      expect(el()!.hasAttribute('data-enter-from')).toBe(false);
      expect(el()!.hasAttribute('data-open')).toBe(true);
    });

    it('animates content that is already showing on the first render', async () => {
      mountAppear();
      await nextTick();
      expect(el()!.hasAttribute('data-enter-from')).toBe(true);
    });

    it('lets that be turned off, for content that is just part of the layout', async () => {
      mountAppear({ appear: false });
      await nextTick();
      expect(el()!.hasAttribute('data-enter-from')).toBe(false);
    });
  });

  describe('hiding', () => {
    it('stays in the DOM while it leaves, then goes', async () => {
      // The whole point: `v-if` alone would remove it before a frame of the
      // exit animation had run.
      const w = mountAppear();
      await settle();

      await w.setProps({ open: false });
      await nextTick();
      expect(el()).not.toBeNull();
      expect(el()!.hasAttribute('data-leave-to')).toBe(true);
      expect(el()!.hasAttribute('data-closed')).toBe(true);

      await settle();
      expect(el()).toBeNull();
    });

    it('stays put if it is shown again mid-exit', async () => {
      const w = mountAppear();
      await settle();

      await w.setProps({ open: false });
      await nextTick();
      await w.setProps({ open: true });
      await settle();

      expect(el()).not.toBeNull();
      expect(el()!.hasAttribute('data-open')).toBe(true);
    });

    it('keeps the element when asked, marked hidden', async () => {
      const w = mountAppear({ keepMounted: true });
      await settle();

      await w.setProps({ open: false });
      await settle();

      expect(el()).not.toBeNull();
      expect(el()!.hasAttribute('hidden')).toBe(true);
      expect(el()!.hasAttribute('data-closed')).toBe(true);
    });
  });

  describe('composition', () => {
    it('renders a different tag when asked', async () => {
      mountAppear({ as: 'span' });
      await settle();
      expect(el()!.tagName).toBe('SPAN');
    });

    it('hands the state to the slot', async () => {
      const w = mount(Appear as any, {
        props: { appear: false },
        slots: { default: (state: any) => h('i', `${state.open}/${state.transitionStatus}`) },
        attachTo: document.body,
      });
      await settle();
      expect(w.text()).toBe('true/idle');
    });

    it('keeps the caller’s class alongside its hooks', async () => {
      const w = mount(Appear as any, {
        attrs: { class: 'Appear' },
        slots: { default: () => h('p', 'Hello') },
        attachTo: document.body,
      });
      await settle();

      expect(w.classes()).toContain('Appear');
      expect(w.attributes('data-part')).toBe('appear');
    });
  });

  it('renders on the server, where there are no frames, in its enter state', async () => {
    vi.stubGlobal('requestAnimationFrame', undefined);
    try {
      const html = await renderToString(createSSRApp(() => h(Appear, null, () => 'Hello')));
      expect(html).toContain('data-enter-from');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

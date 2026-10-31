import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { AppAppear } from '../src';

let wrapper: VueWrapper<any> | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await nextTick();
  }
}

function mountAppear(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  wrapper = mount(AppAppear as any, {
    props,
    attrs,
    slots: { default: ({ open }: { open: boolean }) => h('p', { class: 'body' }, open ? 'open' : 'closed') },
    attachTo: document.body
  });
  return wrapper;
}

const el = () => document.querySelector<HTMLElement>('[data-part="appear"]');

describe('AppAppear', () => {
  it('is an Appear in the app-appear class, open by default, the caller’s class and attributes beside it', async () => {
    mountAppear({}, { class: 'mine', id: 'note' });
    await settle();

    expect(el()!.classList).toContain('app-appear');
    expect(el()!.classList).toContain('mine');
    expect(el()!.id).toBe('note');
    expect(el()!.hasAttribute('data-open')).toBe(true);
    expect(el()!.textContent).toBe('open');
  });

  it('animates in from data-enter-from on the first render, unless told not to', async () => {
    mountAppear();
    expect(el()!.hasAttribute('data-enter-from')).toBe(true);
    await settle();
    expect(el()!.hasAttribute('data-enter-from')).toBe(false);

    wrapper!.unmount();
    mountAppear({ appear: false });
    expect(el()!.hasAttribute('data-enter-from')).toBe(false);
  });

  it('leaves once closed, or stays hidden with keep-mounted', async () => {
    mountAppear();
    await settle();
    await wrapper!.setProps({ open: false });
    await settle();
    expect(el()).toBeNull();

    wrapper!.unmount();
    mountAppear({ open: false, keepMounted: true });
    await settle();
    expect(el()!.hidden).toBe(true);
    expect(el()!.textContent).toBe('closed');
  });

  it('renders as another element', async () => {
    mountAppear({ as: 'section' });
    await settle();
    expect(el()!.tagName).toBe('SECTION');
  });
});

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { Deferred } from '../src';

function mountDeferred(props: Record<string, unknown> = {}) {
  const content = (state: { pressed: boolean }) => h('div', { class: 'content', 'data-pressed': String(state.pressed) });
  return mount(Deferred as any, {
    props,
    slots: { default: content, placeholder: () => h('button', { type: 'button', class: 'stand-in' }, 'Edit') },
    attachTo: document.body
  });
}

describe('Deferred', () => {
  it('renders only the placeholder, with no element of its own around it', () => {
    const w = mountDeferred();

    expect(w.element.tagName).toBe('BUTTON');
    expect(w.find('.content').exists()).toBe(false);
  });

  it('mounts the content in its place once a pointer arrives, not pressed', async () => {
    const w = mountDeferred();

    await w.find('.stand-in').trigger('pointerenter');

    expect(w.find('.stand-in').exists()).toBe(false);
    expect(w.find('.content').attributes('data-pressed')).toBe('false');
  });

  it('mounts it pressed when pressed with no pointer first, as a key does', async () => {
    const w = mountDeferred();

    await w.find('.stand-in').trigger('click');

    expect(w.find('.content').attributes('data-pressed')).toBe('true');
  });

  it('mounts at once when eager, and keeps it when eager goes', async () => {
    const w = mountDeferred({ eager: true });
    expect(w.find('.content').exists()).toBe(true);

    await w.setProps({ eager: false });
    await nextTick();
    expect(w.find('.content').exists()).toBe(true);
  });

  it('mounts when it turns eager later', async () => {
    const w = mountDeferred();

    await w.setProps({ eager: true });

    expect(w.find('.content').exists()).toBe(true);
  });
});

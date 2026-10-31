import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { AppConfirm } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const later = () => new Promise((resolve) => setTimeout(resolve, 2));

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const popup = () => document.querySelector<HTMLElement>('[role="alertdialog"]');
const trigger = () => document.querySelector<HTMLElement>('.own-trigger')!;

async function mountConfirm(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  wrapper = mount(AppConfirm as any, {
    props,
    slots: { default: () => h('button', { type: 'button', class: 'own-trigger' }, 'Delete'), ...slots },
    attachTo: document.body
  });
  await later();
  trigger().click();
  await settle();
  return wrapper;
}

describe('AppConfirm', () => {
  it('opens from the element it wraps, with no element of its own around it', async () => {
    await mountConfirm({ title: 'Delete endpoint?', message: 'It can’t be undone.' });

    expect(trigger().parentElement!.hasAttribute('data-v-app')).toBe(true);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(popup()!.querySelector('.app-confirm-title')!.textContent).toBe('Delete endpoint?');
    expect(popup()!.getAttribute('aria-describedby')).toBe(popup()!.querySelector('.app-confirm-message')!.id);
    // On cancel, so a stray Enter doesn't confirm.
    expect(document.activeElement).toBe(popup()!.querySelector('.app-confirm-cancel'));
  });

  it('opens as it mounts with default-open, and still confirms', async () => {
    wrapper = mount(AppConfirm as any, {
      props: { defaultOpen: true },
      slots: { default: () => h('button', { type: 'button', class: 'own-trigger' }, 'Delete') },
      attachTo: document.body
    });
    await settle();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    popup()!.querySelector<HTMLElement>('.app-confirm-confirm')!.click();
    await settle();
    expect(wrapper.emitted('confirm')).toHaveLength(1);
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('with lazy, renders only its trigger until pressed, then opens and confirms', async () => {
    wrapper = mount(AppConfirm as any, {
      props: { lazy: true },
      slots: { default: () => h('button', { type: 'button', class: 'own-trigger' }, 'Delete') },
      attachTo: document.body
    });
    expect(wrapper.findComponent({ name: 'PopoverRoot' }).exists()).toBe(false);
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');

    trigger().click();
    await settle();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    popup()!.querySelector<HTMLElement>('.app-confirm-confirm')!.click();
    await settle();
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('emits confirm and closes on the confirm button', async () => {
    const w = await mountConfirm({ confirmText: 'Delete' });
    popup()!.querySelector<HTMLElement>('.app-confirm-confirm')!.click();
    await settle();

    expect(w.emitted('confirm')).toHaveLength(1);
    expect(w.emitted('cancel')).toBeUndefined();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('emits cancel on the cancel button and on Escape, never confirm', async () => {
    const w = await mountConfirm();
    popup()!.querySelector<HTMLElement>('.app-confirm-cancel')!.click();
    await settle();

    trigger().click();
    await settle();
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();

    expect(w.emitted('cancel')).toHaveLength(2);
    expect(w.emitted('confirm')).toBeUndefined();
  });

  it('takes content as message, and a #message slot over both', async () => {
    await mountConfirm({ content: 'Can be restored later' });
    expect(popup()!.querySelector('.app-confirm-message')!.textContent).toBe('Can be restored later');
    wrapper!.unmount();

    await mountConfirm({ message: 'Text' }, { message: () => h('b', 'Own') });
    expect(popup()!.querySelector('.app-confirm-message b')!.textContent).toBe('Own');
  });

  it('defaults its title and button texts, with a danger confirm', async () => {
    await mountConfirm();

    expect(popup()!.querySelector('.app-confirm-title')!.textContent).toBe('Confirm');
    expect(popup()!.querySelector('.app-confirm-confirm')!.getAttribute('data-tone')).toBe('danger');
    expect(popup()!.querySelector('.app-confirm-cancel')!.textContent!.trim()).toBe('Cancel');
  });
});

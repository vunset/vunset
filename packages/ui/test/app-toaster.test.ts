import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { createToastStore, useToast, type ToastStore } from '@vunset/vue';
import { AppToaster } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

// Each test its own store: the shared one would carry toasts from test to test.
function mountToaster(props: Record<string, unknown> = {}, slots: Record<string, any> = {}) {
  const store: ToastStore = createToastStore();
  wrapper = mount(AppToaster as any, { props: { store, ...props }, slots, attachTo: document.body });
  return useToast(store);
}

const toasts = () => [...document.querySelectorAll<HTMLElement>('.app-toast')];
const text = (el: Element, selector: string) => el.querySelector(selector)?.textContent?.trim();

describe('AppToaster', () => {
  it('shows what useToast sets: title, text and an icon for its type', async () => {
    const { setToast } = mountToaster();
    setToast({ title: 'Saved', text: 'Revision 4 is live.', type: 'success' });
    await settle();

    const [toast] = toasts();
    expect(text(toast!, '.app-toast-title')).toBe('Saved');
    expect(text(toast!, '.app-toast-description')).toBe('Revision 4 is live.');
    expect(toast!.dataset.type).toBe('success');
    expect(toast!.querySelector('.app-toast-icon')).not.toBeNull();
    expect(toast!.classList.contains('app-surface')).toBe(true);
  });

  it('draws no icon for a toast without a known type', async () => {
    const { setToast } = mountToaster();
    setToast({ title: 'Plain' });
    setToast({ title: 'Odd', type: 'celebration' });
    await settle();
    expect(toasts().every((el) => !el.querySelector('.app-toast-icon'))).toBe(true);
  });

  it('moves a loading toast on by its id', async () => {
    const { setToast, updateToast } = mountToaster();
    const id = setToast({ title: 'Uploading…', type: 'loading' });
    await settle();
    expect(toasts()[0]!.dataset.type).toBe('loading');

    updateToast(id, { title: 'Uploaded', type: 'success' });
    await settle();
    expect(toasts()).toHaveLength(1);
    expect(toasts()[0]!.dataset.type).toBe('success');
    expect(text(toasts()[0]!, '.app-toast-title')).toBe('Uploaded');
  });

  it('draws data.action as a button that runs it, then closes', async () => {
    const onClick = vi.fn();
    const { setToast } = mountToaster();
    setToast({ title: 'Archived', data: { action: { label: 'Undo', onClick } } });
    await settle();

    const action = toasts()[0]!.querySelector<HTMLElement>('[data-part="action"]')!;
    expect(action.classList.contains('app-button')).toBe(true);
    expect(action.textContent!.trim()).toBe('Undo');
    action.click();
    await settle();

    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Archived' }));
    expect(toasts()[0]?.hasAttribute('data-leave-to') ?? true).toBe(true);
  });

  it('passes data.action.props to the action button over its defaults', async () => {
    const { setToast } = mountToaster();
    setToast({
      title: 'Deleted',
      data: { action: { label: 'Undo', onClick: () => {}, props: { variant: 'solid', tone: 'danger', title: 'Restore' } } }
    });
    await settle();

    const action = toasts()[0]!.querySelector<HTMLElement>('[data-part="action"]')!;
    expect(action.dataset.variant).toBe('solid');
    expect(action.dataset.tone).toBe('danger');
    expect(action.dataset.size).toBe('sm');
    expect(action.title).toBe('Restore');
  });

  it('closes from its close button, named by close-label, or has none', async () => {
    const { setToast } = mountToaster({ closeLabel: 'Dismiss' });
    setToast({ title: 'One' });
    await settle();

    const close = toasts()[0]!.querySelector<HTMLElement>('.app-toast-close')!;
    expect(close.getAttribute('aria-label')).toBe('Dismiss');
    close.click();
    await settle();
    expect(toasts()[0]?.hasAttribute('data-leave-to') ?? true).toBe(true);
    wrapper!.unmount();

    const second = mountToaster({ closable: false });
    second.setToast({ title: 'Two' });
    await settle();
    expect(toasts()[0]!.querySelector('.app-toast-close')).toBeNull();
  });

  it('draws a progress bar with progress, for a toast that times out', async () => {
    const { setToast } = mountToaster({ progress: true, timeout: 3000 });
    setToast({ title: 'Saved' });
    setToast({ title: 'Working', type: 'loading' });
    await settle();

    const [loading, saved] = toasts();
    expect(saved!.querySelector('.app-toast-progress')!.getAttribute('style')).toContain('--toast-duration: 3000ms');
    expect(loading!.querySelector('.app-toast-progress')).toBeNull();
  });

  it('draws no progress bar without progress', async () => {
    const { setToast } = mountToaster();
    setToast({ title: 'Saved' });
    await settle();
    expect(toasts()[0]!.querySelector('.app-toast-progress')).toBeNull();
  });

  it('sits where position says', async () => {
    mountToaster({ position: 'top-center' });
    await settle();
    const viewport = document.querySelector<HTMLElement>('.app-toaster')!;
    expect(viewport.dataset.side).toBe('top');
    expect(viewport.dataset.align).toBe('center');
  });

  it('takes toast-class, and default, icon and actions slots', async () => {
    const { setToast } = mountToaster(
      { toastClass: 'mine' },
      {
        default: ({ toast }: any) => h('p', { class: 'custom' }, `${toast.title}!`),
        icon: () => h('i', { class: 'my-icon' }),
        actions: ({ close }: any) => h('button', { class: 'my-action', onClick: close }, 'Go')
      }
    );
    setToast({ title: 'Hi' });
    await settle();

    const [toast] = toasts();
    expect(toast!.classList.contains('mine')).toBe(true);
    expect(text(toast!, '.custom')).toBe('Hi!');
    expect(toast!.querySelector('.my-icon')).not.toBeNull();
    expect(toast!.querySelector('.my-action')).not.toBeNull();
  });
});

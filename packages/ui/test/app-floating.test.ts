import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import { AppFloating } from '../src';

let wrapper: VueWrapper | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

// See app-button.test.ts: a click in the millisecond of the mount can be dropped.
const later = () => new Promise((resolve) => setTimeout(resolve, 2));

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await nextTick();
  }
}

const panel = () => document.querySelector<HTMLElement>('.app-floating');
const header = () => document.querySelector<HTMLElement>('.app-floating-header')!;
const resizers = () => [...document.querySelectorAll<HTMLElement>('.app-floating-resizer')].map((el) => el.dataset.handle);
const pointer = (type: string, x = 0, y = 0) =>
  new PointerEvent(type, { bubbles: true, pointerId: 1, button: 0, clientX: x, clientY: y } as PointerEventInit);

function mountFloating(props: Record<string, unknown> = {}, slots: Record<string, any> = {}, attrs = {}) {
  wrapper = mount(AppFloating as any, { props: { defaultOpen: true, ...props }, slots, attrs, attachTo: document.body });
  return wrapper;
}

describe('AppFloating', () => {
  it('is a dialog named by its title, with a header, a body and a close button', async () => {
    mountFloating({ title: 'Inspector' }, { default: () => 'Body' });
    await settle();

    expect(panel()!.getAttribute('role')).toBe('dialog');
    const titleId = panel()!.getAttribute('aria-labelledby')!;
    expect(document.getElementById(titleId)!.textContent!.trim()).toBe('Inspector');
    expect(document.querySelector('.app-floating-body')!.textContent).toBe('Body');
    expect(document.querySelector('[aria-label="Close"]')).not.toBeNull();
  });

  it('closes from its close button, for v-model:open', async () => {
    const open = ref(true);
    wrapper = mount(
      defineComponent({
        render: () =>
          h(AppFloating as any, { open: open.value, 'onUpdate:open': (v: boolean) => (open.value = v), title: 'T' })
      }),
      { attachTo: document.body }
    );
    await settle();
    await later();

    document.querySelector<HTMLElement>('[aria-label="Close"]')!.click();
    await settle();
    expect(open.value).toBe(false);
    expect(panel()).toBeNull();
  });

  it('hands its footer, and its body, a close function', async () => {
    mountFloating(
      { title: 'T', closable: false },
      { footer: ({ close }: { close: () => void }) => h('button', { class: 'done', onClick: close }, 'Done') }
    );
    await settle();
    expect(document.querySelector('[aria-label="Close"]')).toBeNull();

    await later();
    document.querySelector<HTMLElement>('.done')!.click();
    await settle();
    expect(panel()).toBeNull();
  });

  it('resizes from every edge by default, as resize says otherwise', async () => {
    mountFloating({ title: 'T' });
    await settle();
    expect(resizers()).toHaveLength(8);
    wrapper!.unmount();

    mountFloating({ title: 'T', resize: 'x' });
    await settle();
    expect(resizers().sort()).toEqual(['e', 'w']);
    wrapper!.unmount();

    mountFloating({ title: 'T', resize: 'none' });
    await settle();
    expect(resizers()).toHaveLength(0);
  });

  it('moves when its header is dragged, and says where to', async () => {
    const w = mountFloating({ title: 'T' });
    await settle();

    header().dispatchEvent(pointer('pointerdown'));
    await nextTick();
    expect(panel()!.hasAttribute('data-dragging')).toBe(true);
    header().dispatchEvent(pointer('pointermove', 30, 20));
    header().dispatchEvent(pointer('pointerup', 30, 20));
    await nextTick();

    // Where to is FloatingRoot's arithmetic, tested there; jsdom's stub geometry makes the numbers arbitrary.
    const [left, top] = w.emitted('drag')!.at(-1) as [number, number];
    expect(Number.isFinite(left) && Number.isFinite(top)).toBe(true);
    expect(panel()!.hasAttribute('data-dragging')).toBe(false);
  });

  it('puts attributes on the panel, and takes header- and body-class and an actions slot', async () => {
    mountFloating(
      { title: 'T', headerClass: 'h', bodyClass: 'b' },
      { actions: () => h('button', { class: 'pin' }, 'Pin') },
      { class: 'wide', 'data-testid': 'notes' }
    );
    await settle();

    expect(panel()!.classList.contains('wide')).toBe(true);
    expect(panel()!.dataset.testid).toBe('notes');
    expect(header().classList.contains('h')).toBe(true);
    expect(document.querySelector('.app-floating-body')!.classList.contains('b')).toBe(true);
    expect(document.querySelector('.app-floating-actions .pin')).not.toBeNull();
  });
});

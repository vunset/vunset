import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive } from 'vue';
import {
  FloatingRoot,
  FloatingHeader,
  FloatingTitle,
  FloatingClose,
  FloatingResizer,
  Portal,
  Popup,
} from '../src';
import { setLayout } from './layout';

/**
 * jsdom performs no layout, and `test/setup.ts` reports one box for every
 * element. Placing that box where the panel's own default anchor puts it keeps
 * the measured rect and the applied transform telling the same story, which is
 * what a real browser would do anyway.
 */
beforeEach(() => {
  setLayout({ x: 100, y: 100, width: 120, height: 32 });
});

afterEach(() => {
  setViewport(1024, 768);
});

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
}

function mountFloating(props: Record<string, any> = {}, slots: { title?: boolean; close?: boolean } = {}) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(FloatingRoot as any, { defaultOpen: true, ...props }, {
          // `disabled` keeps it in place rather than teleporting it out of the
          // wrapper; the presence gate is what matters here, and that is Portal's.
          default: ({ handles }: any) =>
            h(Portal as any, { disabled: true }, () =>
            h(Popup as any, { class: 'panel' }, {
              default: () => [
                h(FloatingHeader as any, { class: 'header' }, {
                  default: () => [
                    slots.title ? h(FloatingTitle as any, null, { default: () => 'Inspector' }) : 'Title',
                    slots.close ? h(FloatingClose as any, null, { default: () => 'x' }) : null,
                  ],
                }),
                h('div', { class: 'body' }, 'content'),
                ...handles.map((handle: string) =>
                  h(FloatingResizer as any, { key: handle, value: handle }),
                ),
              ],
            })),
        });
    },
  });

  return mount(Host, { attachTo: document.body });
}

const panel = (wrapper: VueWrapper<any>) => wrapper.find('[data-part="floating"]');
const header = (wrapper: VueWrapper<any>) => wrapper.find('[data-part="header"]');
const grip = (wrapper: VueWrapper<any>, handle: string) =>
  wrapper.find(`[data-part="resizer"][data-handle="${handle}"]`);

function style(wrapper: VueWrapper<any>) {
  const declaration = (panel(wrapper).element as HTMLElement).style;
  const translate = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(declaration.transform);

  return {
    left: translate ? Number(translate[1]) : null,
    top: translate ? Number(translate[2]) : null,
    width: declaration.width || null,
    height: declaration.height || null,
    maxWidth: declaration.maxWidth || null,
    maxHeight: declaration.maxHeight || null,
  };
}

/**
 * Dispatched rather than triggered: `@vue/test-utils` assigns unknown options
 * onto the event after constructing it, and `button` is read-only.
 */
function pointer(type: string, x = 0, y = 0, button = 0) {
  return new PointerEvent(type, {
    bubbles: true,
    pointerId: 1,
    button,
    clientX: x,
    clientY: y,
  } as PointerEventInit);
}

/** A whole press, from the pointer going down to it coming back up. */
async function pull(target: DOMWrapper<Element>, dx: number, dy: number) {
  target.element.dispatchEvent(pointer('pointerdown'));
  await nextTick();

  target.element.dispatchEvent(pointer('pointermove', dx, dy));
  await nextTick();

  target.element.dispatchEvent(pointer('pointerup', dx, dy));
  await nextTick();
}

/** The exit waits a frame before asking what is animating; this gets past it. */
async function settle() {
  for (let i = 0; i < 3; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    await nextTick();
  }
}

const emits = (wrapper: VueWrapper<any>, name: 'drag' | 'resize') =>
  wrapper.findComponent(FloatingRoot).emitted(name) ?? [];

describe('where it opens', () => {
  it('uses the default corner when no side is named', async () => {
    const wrapper = mountFloating();
    await nextTick();

    expect(style(wrapper).left).toBe(100);
    expect(style(wrapper).top).toBe(100);
    expect(panel(wrapper).attributes('style')).toContain('position: fixed');
  });

  it('measures each offset from the edge it names', async () => {
    const wrapper = mountFloating({ right: 20, bottom: 40 });
    await nextTick();

    // 1024 - 120 wide - 20, and 768 - 32 tall - 40.
    expect(style(wrapper).left).toBe(884);
    expect(style(wrapper).top).toBe(696);
  });

  it('caps an unpinned panel at the room it has, rather than sizing it', async () => {
    const wrapper = mountFloating({ left: 200, top: 100 });
    await nextTick();

    expect(style(wrapper).width).toBeNull();
    expect(style(wrapper).maxWidth).toBe('824px');
    expect(style(wrapper).maxHeight).toBe('668px');
  });

  it('pins the size it is given, and then stops capping it', async () => {
    const wrapper = mountFloating({ width: 300, height: 200 });
    await nextTick();

    expect(style(wrapper).width).toBe('300px');
    expect(style(wrapper).height).toBe('200px');
    expect(style(wrapper).maxWidth).toBeNull();
  });

  it('re-anchors when the props move', async () => {
    const props = reactive({ left: 40, top: 60 });
    const wrapper = mountFloating(props);
    await nextTick();
    expect(style(wrapper).left).toBe(40);

    props.left = 250;
    await nextTick();

    expect(style(wrapper).left).toBe(250);
  });
});

describe('dragging', () => {
  it('moves by the distance the pointer traveled, and says so once', async () => {
    const wrapper = mountFloating();
    await nextTick();

    await pull(header(wrapper), 50, 30);

    expect(style(wrapper).left).toBe(150);
    expect(style(wrapper).top).toBe(130);
    expect(emits(wrapper, 'drag')).toHaveLength(1);
    expect(emits(wrapper, 'drag')[0]).toEqual([150, 130]);
  });

  it('publishes that it is being dragged, and stops when it is not', async () => {
    const wrapper = mountFloating();
    await nextTick();

    header(wrapper).element.dispatchEvent(pointer('pointerdown'));
    await nextTick();
    expect(panel(wrapper).attributes('data-dragging')).toBe('');

    header(wrapper).element.dispatchEvent(pointer('pointerup'));
    await nextTick();

    expect(panel(wrapper).attributes('data-dragging')).toBeUndefined();
  });

  it('stops at the viewport edge', async () => {
    const wrapper = mountFloating();
    await nextTick();

    await pull(header(wrapper), 2000, 2000);

    // 1024 - 120 wide, 768 - 32 tall.
    expect(style(wrapper).left).toBe(904);
    expect(style(wrapper).top).toBe(736);
  });

  it('lets it leave when bounding is off', async () => {
    const wrapper = mountFloating({ bounding: false });
    await nextTick();

    await pull(header(wrapper), 2000, 0);

    expect(style(wrapper).left).toBe(2100);
  });

  it('ignores anything but the primary button', async () => {
    const wrapper = mountFloating();
    await nextTick();

    await pull(header(wrapper), 50, 30);
    const moved = style(wrapper).left;

    header(wrapper).element.dispatchEvent(pointer('pointerdown', 0, 0, 2));
    await nextTick();
    header(wrapper).element.dispatchEvent(pointer('pointermove', 500, 0));
    await nextTick();

    expect(style(wrapper).left).toBe(moved);
  });
});

describe('resizing', () => {
  it('renders the handles the mode calls for', async () => {
    expect(mountFloating().findAll('[data-part="resizer"]')).toHaveLength(0);

    expect(
      mountFloating({ resize: 'x' }).findAll('[data-part="resizer"]').map((g) => g.attributes('data-handle')),
    ).toEqual(['w', 'e']);

    expect(mountFloating({ resize: 'y' }).findAll('[data-part="resizer"]')).toHaveLength(2);
    expect(mountFloating({ resize: 'both' }).findAll('[data-part="resizer"]')).toHaveLength(8);
  });

  it('grows from the edge that was pulled', async () => {
    const wrapper = mountFloating({ resize: 'both' });
    await nextTick();

    await pull(grip(wrapper, 'e'), 60, 0);

    expect(style(wrapper).width).toBe('180px');
    expect(style(wrapper).left).toBe(100);
    expect(emits(wrapper, 'resize')[0]).toEqual([180, null]);
  });

  it('keeps the far edge still when the near one is pulled', async () => {
    const wrapper = mountFloating({ resize: 'both' });
    await nextTick();

    await pull(grip(wrapper, 'w'), -40, 0);

    // The right edge was at 220 and has to stay there.
    expect(style(wrapper).width).toBe('160px');
    expect(style(wrapper).left).toBe(60);
  });

  it('respects the smallest and largest it is allowed to be', async () => {
    const wrapper = mountFloating({ resize: 'both', minWidth: 90, maxWidth: 140 });
    await nextTick();

    await pull(grip(wrapper, 'e'), -500, 0);
    expect(style(wrapper).width).toBe('90px');

    await pull(grip(wrapper, 'e'), 500, 0);
    expect(style(wrapper).width).toBe('140px');
  });

  it('will not grow past the viewport while bounding', async () => {
    const wrapper = mountFloating({ resize: 'both' });
    await nextTick();

    await pull(grip(wrapper, 'e'), 5000, 0);

    // 1024 - the left edge at 100.
    expect(style(wrapper).width).toBe('924px');
  });

  it('pins only the axis the handle governs', async () => {
    const wrapper = mountFloating({ resize: 'both' });
    await nextTick();

    await pull(grip(wrapper, 's'), 0, 50);

    expect(style(wrapper).height).toBe('82px');
    expect(style(wrapper).width).toBeNull();
  });
});

describe('reset', () => {
  it('goes back to the position and size the props asked for', async () => {
    const wrapper = mountFloating({ left: 40, top: 60, resize: 'both' });
    await nextTick();

    await pull(header(wrapper), 300, 200);
    await pull(grip(wrapper, 'e'), 60, 0);
    expect(panel(wrapper).attributes('data-moved')).toBe('');

    await header(wrapper).trigger('dblclick');

    expect(style(wrapper).left).toBe(40);
    expect(style(wrapper).top).toBe(60);
    expect(style(wrapper).width).toBeNull();
    expect(panel(wrapper).attributes('data-moved')).toBeUndefined();
    expect(emits(wrapper, 'resize').at(-1)).toEqual([null, null]);
  });
});

describe('the viewport changing size', () => {
  it('keeps an anchored panel the same distance from its edge', async () => {
    const wrapper = mountFloating({ right: 20 });
    await nextTick();
    expect(style(wrapper).left).toBe(884);

    setViewport(800, 768);
    window.dispatchEvent(new Event('resize'));
    await nextTick();

    expect(style(wrapper).left).toBe(660);
  });

  it('only pulls a dragged panel back inside, rather than moving it home', async () => {
    const wrapper = mountFloating({ right: 20 });
    await nextTick();

    // Dragging drops the anchors: the user has said where it goes.
    await pull(header(wrapper), 0, 0);

    setViewport(800, 768);
    window.dispatchEvent(new Event('resize'));
    await nextTick();

    // The measured rect is still at 100, and 100 fits inside 800.
    expect(style(wrapper).left).toBe(100);
  });

  it('does not fight a gesture that is still in progress', async () => {
    const wrapper = mountFloating();
    await nextTick();

    header(wrapper).element.dispatchEvent(pointer('pointerdown'));
    await nextTick();
    header(wrapper).element.dispatchEvent(pointer('pointermove', 300, 0));
    await nextTick();

    window.dispatchEvent(new Event('resize'));
    await nextTick();

    expect(style(wrapper).left).toBe(400);
  });
});

describe('the title and the close button', () => {
  it('closes the panel, rather than having its press eaten by the drag', async () => {
    const wrapper = mountFloating({}, { close: true });
    await nextTick();

    await wrapper.find('[data-part="close"]').trigger('click');
    await settle();

    expect(panel(wrapper).exists()).toBe(false);
    expect(wrapper.findComponent(FloatingRoot).emitted('update:open')?.[0]).toEqual([false]);
  });

  it('will not start a drag from something in the header that has its own press', async () => {
    const wrapper = mountFloating({}, { close: true });
    await nextTick();

    const close = wrapper.find('[data-part="close"]');
    close.element.dispatchEvent(pointer('pointerdown'));
    await nextTick();

    expect(panel(wrapper).attributes('data-dragging')).toBeUndefined();
  });

  it('names the panel from its title', async () => {
    const wrapper = mountFloating({}, { title: true });
    await nextTick();

    const id = wrapper.find('[data-part="title"]').attributes('id');

    expect(id).toBeTruthy();
    expect(panel(wrapper).attributes('aria-labelledby')).toBe(id);
    // A role that is allowed to carry a name: an element with none is `generic`,
    // which ARIA forbids naming.
    expect(panel(wrapper).attributes('role')).toBe('dialog');
  });

  it('claims nothing when there is no title to claim it from', async () => {
    const wrapper = mountFloating();
    await nextTick();

    expect(panel(wrapper).attributes('role')).toBeUndefined();
    expect(panel(wrapper).attributes('aria-labelledby')).toBeUndefined();
  });

  it('keeps the drag surfaces out of the way of the keyboard and the a11y tree', async () => {
    const wrapper = mountFloating({ resize: 'both' });
    await nextTick();

    expect(header(wrapper).attributes('style')).toContain('touch-action: none');
    expect(header(wrapper).attributes('tabindex')).toBeUndefined();
    expect(grip(wrapper, 'se').attributes('aria-hidden')).toBe('true');
    expect(grip(wrapper, 'se').attributes('tabindex')).toBeUndefined();
  });
});

describe('opening and closing', () => {
  it('stays out of the DOM until it is opened', async () => {
    const wrapper = mountFloating({ defaultOpen: false });
    await nextTick();

    expect(panel(wrapper).exists()).toBe(false);
  });

  it('publishes the phase an exit animation runs from', async () => {
    const props = reactive({ open: true });
    const wrapper = mountFloating(props);
    await nextTick();

    expect(panel(wrapper).attributes('data-open')).toBe('');

    props.open = false;
    await nextTick();

    expect(panel(wrapper).attributes('data-closed')).toBe('');
  });

  it('holds the geometry still while a gesture is in progress', async () => {
    const wrapper = mountFloating();
    await nextTick();

    header(wrapper).element.dispatchEvent(pointer('pointerdown'));
    await nextTick();

    expect(panel(wrapper).attributes('style')).toContain('transition: none');
  });
});

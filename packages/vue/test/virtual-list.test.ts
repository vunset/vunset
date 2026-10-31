import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, type Ref } from 'vue';
import { useVirtualList } from '../src';

const HEIGHT = 20;

/** jsdom has no layout; a scroller gets a viewport, a scroll position and a top. */
function sized(element: HTMLElement, box: { height?: number; top?: number }) {
  if (box.height !== undefined) Object.defineProperty(element, 'clientHeight', { configurable: true, value: box.height });
  if (box.top !== undefined) {
    Object.defineProperty(element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: box.top, bottom: 0, left: 0, right: 0, width: 0, height: 0 }),
    });
  }
}

async function frame() {
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  await nextTick();
}

function mountList(options: { count?: number; enabled?: boolean; windowed?: boolean; offset?: number } = {}) {
  const items = ref(Array.from({ length: options.count ?? 1000 }, (_, index) => index));
  const itemHeight = ref(HEIGHT);
  const scroller = ref<HTMLElement | null>(null);
  const list = ref<HTMLElement | null>(null);
  let api!: ReturnType<typeof useVirtualList<number>>;
  let first: [number, number] = [0, 0];

  const Host = defineComponent({
    setup() {
      api = useVirtualList({
        items,
        itemHeight,
        enabled: options.enabled ?? true,
        scroller: options.windowed ? undefined : scroller,
        list,
      });
      first = [api.start.value, api.end.value];
      return () =>
        h('div', { ref: scroller, class: 'scroller' }, [h('div', { ref: list, class: 'list' }, api.visible.value.map((n) => h('i', n)))]);
    },
  });

  const wrapper = mount(Host, { attachTo: document.body });
  return {
    wrapper,
    items,
    itemHeight,
    scroller: scroller as Ref<HTMLElement>,
    list: list as Ref<HTMLElement>,
    first: () => first,
    get api() {
      return api;
    },
  };
}

async function place(context: ReturnType<typeof mountList>, { viewport = 200, offset = 0 } = {}) {
  sized(context.scroller.value, { height: viewport, top: 0 });
  sized(context.list.value, { top: offset });
  window.dispatchEvent(new Event('resize'));
  await nextTick();
}

async function scrollTo(context: ReturnType<typeof mountList>, top: number) {
  context.scroller.value.scrollTop = top;
  context.scroller.value.dispatchEvent(new Event('scroll'));
  await frame();
}

describe('useVirtualList', () => {
  it('draws everything when it is off', () => {
    const { api } = mountList({ enabled: false, count: 50 });

    expect(api.visible.value).toHaveLength(50);
    expect([api.before.value, api.after.value]).toEqual([0, 0]);
  });

  it('draws the top of the list from the first render, before anything is measured', () => {
    const context = mountList();

    // Read during setup, before mount has measured anything: twice the
    // overscan, rather than an empty list for a frame.
    expect(context.first()).toEqual([0, 40]);
  });

  it('draws the viewport and the overscan, with the rest as space', async () => {
    const context = mountList();
    await place(context);

    // 200px of 20px items is 10, plus one partly shown, plus 20 of overscan.
    expect([context.api.start.value, context.api.end.value]).toEqual([0, 31]);
    expect(context.api.before.value).toBe(0);
    expect(context.api.after.value).toBe((1000 - 31) * HEIGHT);
  });

  it('follows the scroll', async () => {
    const context = mountList();
    await place(context);
    await scrollTo(context, 100 * HEIGHT);

    expect([context.api.start.value, context.api.end.value]).toEqual([80, 131]);
    expect(context.api.visible.value[0]).toBe(80);
    expect(context.api.before.value).toBe(80 * HEIGHT);
  });

  it('leaves what is drawn alone until the viewport nears its edge', async () => {
    const context = mountList();
    await place(context);
    await scrollTo(context, 100 * HEIGHT);

    // Five rows on: 25 still drawn above, 15 below — nothing to redraw.
    await scrollTo(context, 105 * HEIGHT);
    expect(context.api.start.value).toBe(80);

    // Twelve more, and only 3 are left below: redraw.
    await scrollTo(context, 117 * HEIGHT);
    expect(context.api.start.value).toBe(97);
  });

  it('jumps straight to a far scroll, in either direction', async () => {
    const context = mountList();
    await place(context);

    await scrollTo(context, 900 * HEIGHT);
    expect(context.api.start.value).toBe(880);

    await scrollTo(context, 10 * HEIGHT);
    expect(context.api.start.value).toBe(0);
  });

  it('counts from where the list starts inside the scroller', async () => {
    const context = mountList();
    // A 40px sticky header sits above the first item.
    await place(context, { offset: 40 });
    await scrollTo(context, 40 + 100 * HEIGHT);

    expect(context.api.start.value).toBe(80);
  });

  it('redraws when the list shrinks under what is drawn', async () => {
    const context = mountList();
    await place(context);
    await scrollTo(context, 100 * HEIGHT);

    context.items.value = context.items.value.slice(0, 50);
    await nextTick();

    expect(context.api.end.value).toBeLessThanOrEqual(50);
    expect(context.api.visible.value.every((n) => n < 50)).toBe(true);
    expect(context.api.after.value).toBeGreaterThanOrEqual(0);
  });

  it('redraws when the item height changes', async () => {
    const context = mountList();
    await place(context);

    context.itemHeight.value = 40;
    await nextTick();

    // 200px of 40px items: 5, plus one, plus overscan.
    expect(context.api.end.value).toBe(26);
  });

  it('follows the page when there is no scroller, from the list’s own place in it', async () => {
    const context = mountList({ windowed: true });
    sized(context.list.value, { top: -100 * HEIGHT });
    window.dispatchEvent(new Event('scroll'));
    await frame();

    expect(context.api.start.value).toBe(80);
  });

  it('scrolls an item to the top of the viewport', async () => {
    const context = mountList();
    await place(context, { offset: 40 });

    context.api.scrollToIndex(250);

    expect(context.scroller.value.scrollTop).toBe(40 + 250 * HEIGHT);
  });

  describe('in a scroller with no height of its own', () => {
    // The scroller holds all 1000 items; an ancestor 200px tall is what scrolls, 50px down the page.
    async function placeInOuter(context: ReturnType<typeof mountList>) {
      const outer = document.createElement('div');
      outer.style.overflowY = 'auto';
      context.wrapper.element.parentElement!.insertBefore(outer, context.wrapper.element);
      outer.appendChild(context.wrapper.element);

      let scrolled = 0;
      Object.defineProperty(outer, 'clientHeight', { configurable: true, value: 200 });
      Object.defineProperty(outer, 'scrollHeight', { configurable: true, value: 1000 * HEIGHT });
      Object.defineProperty(outer, 'scrollTop', {
        configurable: true,
        get: () => scrolled,
        set: (next: number) => (scrolled = next)
      });
      sized(outer, { top: 50 });

      const scroller = context.scroller.value;
      Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 1000 * HEIGHT });
      // It can't scroll: its content fits.
      Object.defineProperty(scroller, 'scrollTop', { configurable: true, get: () => 0, set: () => {} });
      Object.defineProperty(scroller, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({ top: 50 - scrolled })
      });
      Object.defineProperty(context.list.value, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({ top: 50 - scrolled })
      });
      window.dispatchEvent(new Event('resize'));
      await nextTick();

      const scrollOuter = async (top: number) => {
        scrolled = top;
        outer.dispatchEvent(new Event('scroll'));
        await frame();
      };
      return { outer, scrollOuter };
    }

    it('draws only what the ancestor shows, not every item', async () => {
      const context = mountList();
      await placeInOuter(context);

      expect([context.api.start.value, context.api.end.value]).toEqual([0, 31]);
    });

    it('follows the ancestor as it scrolls', async () => {
      const context = mountList();
      const { scrollOuter } = await placeInOuter(context);
      await scrollOuter(100 * HEIGHT);

      expect([context.api.start.value, context.api.end.value]).toEqual([80, 131]);
    });

    it('scrolls the ancestor to bring an item to the top', async () => {
      const context = mountList();
      const { outer } = await placeInOuter(context);

      context.api.scrollToIndex(250);

      expect(outer.scrollTop).toBe(250 * HEIGHT);
    });
  });

  it('stops listening when it is gone', async () => {
    const context = mountList();
    const remove = vi.spyOn(window, 'removeEventListener');

    context.wrapper.unmount();

    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything());
    remove.mockRestore();
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue';

const fetcher = vi.hoisted(() => ({ calls: [] as { url: string; options: any }[], pages: [] as unknown[] }));

vi.mock('#app', () => ({
  useRequestFetch: () => async (url: string, options: any) => {
    fetcher.calls.push({ url, options });
    return fetcher.pages.shift() ?? [];
  }
}));

const { useInfinityFetch } = await import('../src/runtime/composables/use-infinity-fetch');

const settle = async () => {
  for (let i = 0; i < 4; i += 1) await nextTick();
};

function mountList(options: Record<string, any> = {}, bottom = 2000) {
  let api!: ReturnType<typeof useInfinityFetch<number>>;
  const wrapper = mount(
    defineComponent(() => {
      const el = shallowRef<HTMLElement | null>(null);
      api = useInfinityFetch<number>('/api/items', { el, ...options });
      return () => h('div', { ref: (node: any) => (el.value = node) });
    }),
    { attachTo: document.body }
  );
  vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({ bottom } as DOMRect);
  return { wrapper, api: () => api };
}

describe('useInfinityFetch', () => {
  beforeEach(() => {
    fetcher.calls = [];
    fetcher.pages = [];
  });

  it('loads the first page once mounted, with the query and the page number', async () => {
    fetcher.pages = [[1, 2]];
    const { api } = mountList({ query: { region: 'EU' } });
    await settle();
    expect(fetcher.calls).toEqual([
      { url: '/api/items', options: { method: 'GET', query: { region: 'EU', page: 1 } } }
    ]);
    expect(api().data.value).toEqual([1, 2]);
    expect(api().currentPage.value).toBe(2);
  });

  it('sends the query as the body for POST, and reads the items from `dataKey`', async () => {
    fetcher.pages = [{ rows: [7] }];
    const { api } = mountList({ method: 'POST', dataKey: 'rows' });
    await settle();
    expect(fetcher.calls[0]!.options).toEqual({ method: 'POST', body: { page: 1 } });
    expect(api().data.value).toEqual([7]);
  });

  it('loads the next page as the end comes into view, and stops at an empty one', async () => {
    fetcher.pages = [[1], [2], []];
    const { api, wrapper } = mountList({}, 2000);
    await settle();
    expect(api().data.value).toEqual([1]);

    // Scrolled down: the list's bottom is now within the window.
    vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue({ bottom: 100 } as DOMRect);
    window.dispatchEvent(new Event('scroll'));
    await settle();
    expect(api().data.value).toEqual([1, 2]);

    window.dispatchEvent(new Event('scroll'));
    await settle();
    expect(api().status.value).toBe('end');
    const calls = fetcher.calls.length;
    window.dispatchEvent(new Event('scroll'));
    await settle();
    expect(fetcher.calls).toHaveLength(calls);
  });

  it('when `el` scrolls itself, loads the next page as it nears its own end, not as it meets the window', async () => {
    fetcher.pages = [[1], [2], [3]];
    // A capped box is always inside the window (bottom: 100): that alone would load every page.
    const { api, wrapper } = mountList({ offset: 50 }, 100);
    const box = wrapper.element;
    const metrics = { scrollTop: 0 };
    // A 300px box, 1000px taller for every page loaded.
    Object.defineProperty(box, 'scrollHeight', { get: () => api().data.value.length * 1000 });
    Object.defineProperty(box, 'clientHeight', { value: 300 });
    Object.defineProperty(box, 'scrollTop', { get: () => metrics.scrollTop });
    await settle();
    expect(api().data.value).toEqual([1]);

    metrics.scrollTop = 600; // 100px left: not yet within `offset`
    window.dispatchEvent(new Event('scroll'));
    await settle();
    expect(api().data.value).toEqual([1]);

    metrics.scrollTop = 660; // 40px left
    window.dispatchEvent(new Event('scroll'));
    await settle();
    expect(api().data.value).toEqual([1, 2]);
  });

  it('takes a component as `el`, watching its root element', async () => {
    fetcher.pages = [[1], [2], [3]];
    const Box = defineComponent(() => () => h('div', { class: 'box' }));
    let api!: ReturnType<typeof useInfinityFetch<number>>;
    const wrapper = mount(
      defineComponent(() => {
        const box = shallowRef<InstanceType<typeof Box> | null>(null);
        api = useInfinityFetch<number>('/api/items', { el: box });
        return () => h('section', [h(Box, { ref: (instance: any) => (box.value = instance) })]);
      }),
      { attachTo: document.body }
    );
    const box = wrapper.element.querySelector('.box')!;
    Object.defineProperty(box, 'scrollHeight', { get: () => api.data.value.length * 1000 });
    Object.defineProperty(box, 'clientHeight', { value: 300 });
    vi.spyOn(box, 'getBoundingClientRect').mockReturnValue({ bottom: 100 } as DOMRect);
    await settle();
    expect(api.data.value).toEqual([1]);

    Object.defineProperty(box, 'scrollTop', { value: 700 });
    window.dispatchEvent(new Event('scroll'));
    await settle();
    expect(api.data.value).toEqual([1, 2]);
  });

  it('starts over when the query changes', async () => {
    const region = ref('EU');
    fetcher.pages = [[1], [9]];
    const { api } = mountList({ query: () => ({ region: region.value }) });
    await settle();
    region.value = 'US';
    await settle();
    expect(fetcher.calls.at(-1)!.options.query).toEqual({ region: 'US', page: 1 });
    expect(api().data.value).toEqual([9]);
  });

  it('stops listening once unmounted', async () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { wrapper } = mountList();
    await settle();
    wrapper.unmount();
    expect(remove.mock.calls.map((call) => call[0])).toEqual(expect.arrayContaining(['scroll', 'resize']));
  });
});

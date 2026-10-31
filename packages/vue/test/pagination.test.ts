import { describe, it, expect, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive } from 'vue';
import {
  configureLink,
  PaginationRoot,
  PaginationPrev,
  PaginationNext,
  PaginationItem,
  PaginationEllipsis,
  paginationItems,
  routeQueryKey,
} from '../src';

function mountPagination(props: Record<string, any> = {}) {
  const Host = defineComponent({
    setup() {
      return () =>
        h(PaginationRoot as any, { class: 'pagination', ...props }, {
          default: ({ items }: any) => [
            h(PaginationPrev as any, null, { default: () => 'prev' }),
            ...items.map((item: any) =>
              item.type === 'page'
                ? h(PaginationItem as any, { key: item.key, value: item.page })
                : h(PaginationEllipsis as any, { key: item.key }),
            ),
            h(PaginationNext as any, null, { default: () => 'next' }),
          ],
        });
    },
  });

  return mount(Host, { attachTo: document.body });
}

const shown = (wrapper: VueWrapper<any>) =>
  wrapper
    .findAll('[data-part="item"], [data-part="ellipsis"]')
    .map((node) => (node.attributes('data-part') === 'ellipsis' ? '…' : node.text()));

const item = (wrapper: VueWrapper<any>, page: number) =>
  wrapper.find(`[data-part="item"][data-page="${page}"]`);

const emitted = (wrapper: VueWrapper<any>) =>
  wrapper.findComponent(PaginationRoot).emitted('update:modelValue') ?? [];

describe('which pages are shown', () => {
  const list = (current: number, total: number, siblings = 1, boundaries = 1) =>
    paginationItems(current, total, siblings, boundaries).map((entry) =>
      entry.type === 'page' ? entry.page : '…',
    );

  it('shows everything while it fits', () => {
    expect(list(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(list(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('gaps only the end that needs it', () => {
    expect(list(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(list(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
  });

  it('gaps both ends in the middle', () => {
    expect(list(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20]);
  });

  it('keeps the same width whatever page it is on', () => {
    const widths = new Set([1, 5, 10, 15, 20].map((page) => list(page, 20).length));

    expect(widths.size).toBe(1);
  });

  it('widens with siblings and boundaries', () => {
    expect(list(10, 20, 2)).toEqual([1, '…', 8, 9, 10, 11, 12, '…', 20]);
    expect(list(10, 20, 1, 2)).toEqual([1, 2, '…', 9, 10, 11, '…', 19, 20]);
  });

  it('is empty when there is nothing to page through', () => {
    expect(list(1, 0)).toEqual([]);
    expect(list(1, 1)).toEqual([1]);
  });
});

describe('the page count', () => {
  it('is taken directly when given', () => {
    expect(shown(mountPagination({ totalPages: 3 }))).toEqual(['1', '2', '3']);
  });

  it('is worked out from the total and the page size', () => {
    expect(shown(mountPagination({ total: 45, perPage: 20 }))).toEqual(['1', '2', '3']);
    expect(shown(mountPagination({ total: 40, perPage: 20 }))).toEqual(['1', '2']);
  });
});

describe('choosing a page', () => {
  it('marks the current one for the eye and for a screen reader', async () => {
    const wrapper = mountPagination({ totalPages: 5, defaultValue: 3 });

    expect(item(wrapper, 3).attributes('data-selected')).toBe('');
    expect(item(wrapper, 3).attributes('aria-current')).toBe('page');
    expect(item(wrapper, 2).attributes('aria-current')).toBeUndefined();
    expect(item(wrapper, 2).attributes('aria-label')).toBe('Page 2');
  });

  it('moves when a page is pressed', async () => {
    const wrapper = mountPagination({ totalPages: 5 });

    await item(wrapper, 4).trigger('click');

    expect(emitted(wrapper)[0]).toEqual([4]);
    expect(item(wrapper, 4).attributes('data-selected')).toBe('');
  });

  it('steps with the arrows', async () => {
    const wrapper = mountPagination({ totalPages: 5, defaultValue: 3 });

    await wrapper.find('[data-part="next"]').trigger('click');
    expect(emitted(wrapper)[0]).toEqual([4]);

    await wrapper.find('[data-part="prev"]').trigger('click');
    expect(emitted(wrapper)[1]).toEqual([3]);
  });

  it('stops at both ends', async () => {
    const first = mountPagination({ totalPages: 5 });
    expect(first.find('[data-part="prev"]').attributes('disabled')).toBeDefined();
    expect(first.find('[data-part="next"]').attributes('disabled')).toBeUndefined();

    await first.find('[data-part="prev"]').trigger('click');
    expect(emitted(first)).toHaveLength(0);

    const last = mountPagination({ totalPages: 5, defaultValue: 5 });
    expect(last.find('[data-part="next"]').attributes('disabled')).toBeDefined();
  });

  it('clamps a page that is past the end', () => {
    const wrapper = mountPagination({ totalPages: 5, modelValue: 99 });

    expect(item(wrapper, 5).attributes('data-selected')).toBe('');
  });

  it('only moves when the value it was given moves', async () => {
    const wrapper = mountPagination({ totalPages: 5, modelValue: 2 });

    await item(wrapper, 4).trigger('click');

    expect(emitted(wrapper)[0]).toEqual([4]);
    expect(item(wrapper, 2).attributes('data-selected')).toBe('');
    expect(item(wrapper, 4).attributes('data-selected')).toBeUndefined();
  });

  it('follows the value it is given', async () => {
    const props = reactive({ totalPages: 20, modelValue: 2 });
    const wrapper = mountPagination(props);

    props.modelValue = 10;
    await nextTick();

    expect(shown(wrapper)).toEqual(['1', '…', '9', '10', '11', '…', '20']);
  });
});

describe('per page', () => {
  function mountWithSize(props: Record<string, any> = {}) {
    let api: any;
    const Host = defineComponent({
      setup() {
        return () =>
          h(PaginationRoot as any, props, {
            default: (slot: any) => {
              api = slot;
              return slot.items.map((item: any) =>
                item.type === 'page' ? h(PaginationItem as any, { key: item.key, value: item.page }) : null,
              );
            },
          });
      },
    });
    const wrapper = mount(Host, { attachTo: document.body });
    return { wrapper, api: () => api, root: () => wrapper.findComponent(PaginationRoot) };
  }

  it('starts at 10 a page and works out the page count from it', () => {
    const { api } = mountWithSize({ total: 95 });
    expect(api().perPage).toBe(10);
    expect(api().totalPages).toBe(10);
  });

  it('keeps the first item on screen when the size changes', async () => {
    const { api, root } = mountWithSize({ total: 200, defaultValue: 3 });

    api().setPerPage(20);
    await nextTick();
    expect(api().page).toBe(2);
    expect(api().totalPages).toBe(10);

    api().setPerPage(5);
    await nextTick();
    expect(api().page).toBe(5);
    expect(root().emitted('update:perPage')).toEqual([[20], [5]]);
    expect(root().emitted('update:modelValue')).toEqual([[2], [5]]);
  });

  it('works the page out against the new size while per-page is controlled', async () => {
    const { api, root } = mountWithSize({ total: 200, modelValue: 4, perPage: 10 });

    api().setPerPage(50);
    await nextTick();
    // items 31–40 sit on page 1 of 50; the parent hasn't passed 50 back yet
    expect(root().emitted('update:perPage')).toEqual([[50]]);
    expect(root().emitted('update:modelValue')).toEqual([[1]]);
  });

  it('clamps to the new last page', async () => {
    const { api, root } = mountWithSize({ total: 25, defaultValue: 3, defaultPerPage: 10 });
    api().setPerPage(100);
    await nextTick();
    expect(api().page).toBe(1);
    expect(root().emitted('update:modelValue')).toEqual([[1]]);
  });

  it('ignores a size it already has, and floors one below 1 to 1', async () => {
    const { api, root } = mountWithSize({ total: 30 });
    api().setPerPage(10);
    await nextTick();
    expect(root().emitted('update:perPage')).toBeUndefined();

    api().setPerPage(0);
    await nextTick();
    expect(api().perPage).toBe(1);
    expect(api().totalPages).toBe(30);
  });
});

describe('as links', () => {
  const asLinks = (extra: Record<string, any> = {}) =>
    mountPagination({ totalPages: 5, defaultValue: 2, to: (page: number) => `#/items?page=${page}`, ...extra });

  it('renders anchors with a target instead of buttons', () => {
    const wrapper = asLinks();

    expect(item(wrapper, 3).element.tagName).toBe('A');
    expect(item(wrapper, 3).attributes('href')).toBe('#/items?page=3');
    expect(item(wrapper, 3).attributes('type')).toBeUndefined();
    expect(wrapper.find('[data-part="prev"]').attributes('href')).toBe('#/items?page=1');
  });

  it('binds `to` rather than `href` for a router link', () => {
    const Link = defineComponent({
      props: { to: { type: [String, Object], default: undefined } },
      setup: (props, { slots }) => () => h('a', { 'data-to': String(props.to) }, slots.default?.()),
    });
    const wrapper = asLinks({ link: Link });

    expect(item(wrapper, 3).attributes('data-to')).toBe('#/items?page=3');
    expect(item(wrapper, 3).attributes('href')).toBeUndefined();
  });

  it('renders configureLink’s component when no `link` is given', () => {
    const Link = defineComponent({
      props: { to: { type: [String, Object], default: undefined } },
      setup: (props, { slots }) => () => h('a', { 'data-to': String(props.to) }, slots.default?.()),
    });
    configureLink(Link);
    try {
      expect(item(asLinks(), 3).attributes('data-to')).toBe('#/items?page=3');
    } finally {
      configureLink('a');
    }
    expect(item(asLinks(), 3).attributes('href')).toBe('#/items?page=3');
  });

  it('makes a spent arrow inert by leaving it no target at all', async () => {
    const wrapper = mountPagination({ totalPages: 5, to: (page: number) => `#/items?page=${page}` });
    const prev = wrapper.find('[data-part="prev"]');

    expect(prev.attributes('href')).toBeUndefined();
    expect(prev.attributes('aria-disabled')).toBe('true');
    // An anchor has no `disabled`, so the guard is what stops it.
    expect(prev.attributes('disabled')).toBeUndefined();

    await prev.trigger('click');
    expect(emitted(wrapper)).toHaveLength(0);
  });

  it('goes nowhere at all while disabled', async () => {
    const wrapper = asLinks({ disabled: true });

    expect(item(wrapper, 3).attributes('href')).toBeUndefined();
    expect(item(wrapper, 3).attributes('aria-disabled')).toBe('true');

    // An anchor cannot be `disabled`, and `trigger` would skip a button that is,
    // so this is the only place the click guard is actually observable.
    await item(wrapper, 3).trigger('click');
    expect(emitted(wrapper)).toHaveLength(0);
  });

  it('renders a spent arrow, or a disabled page, as a plain anchor rather than the link component', () => {
    // A router link can't render without its `to`, which an inert one hasn't got.
    const Link = defineComponent({
      props: { to: { type: [String, Object], required: true } },
      setup: (props, { slots }) => () => h('a', { 'data-to': String(props.to) }, slots.default?.()),
    });

    const first = asLinks({ link: Link, defaultValue: 1 });
    const prev = first.find('[data-part="prev"]');
    expect(prev.element.tagName).toBe('A');
    expect(prev.attributes('data-to')).toBeUndefined();
    expect(prev.attributes('aria-disabled')).toBe('true');
    expect(first.find('[data-part="next"]').attributes('data-to')).toBe('#/items?page=2');

    const off = asLinks({ link: Link, disabled: true });
    expect(item(off, 3).element.tagName).toBe('A');
    expect(item(off, 3).attributes('data-to')).toBeUndefined();
  });

  it('still reports the page it was asked for, so a route can be the source', async () => {
    const wrapper = asLinks();

    await item(wrapper, 4).trigger('click');

    expect(emitted(wrapper)[0]).toEqual([4]);
  });
});

describe('disabled', () => {
  it('turns every control off', async () => {
    const wrapper = mountPagination({ totalPages: 5, defaultValue: 3, disabled: true });

    expect(wrapper.find('[data-part="pagination"]').attributes('data-disabled')).toBe('');
    expect(item(wrapper, 4).attributes('disabled')).toBeDefined();
    expect(wrapper.find('[data-part="next"]').attributes('disabled')).toBeDefined();

    await item(wrapper, 4).trigger('click');
    expect(emitted(wrapper)).toHaveLength(0);
  });
});

describe('what it announces', () => {
  it('is a labeled navigation landmark', () => {
    const wrapper = mountPagination({ totalPages: 3 });
    const nav = wrapper.find('[data-part="pagination"]');

    expect(nav.element.tagName).toBe('NAV');
    expect(nav.attributes('aria-label')).toBe('Pagination');
  });

  it('hides the gaps, which stand for nothing that can be read', () => {
    const wrapper = mountPagination({ totalPages: 20, defaultValue: 10 });

    expect(wrapper.find('[data-part="ellipsis"]').attributes('aria-hidden')).toBe('true');
  });

  it('lets the caller overrule the labels it chose', () => {
    const wrapper = mountPagination({ totalPages: 3, 'aria-label': 'Search results' });

    expect(wrapper.find('[data-part="pagination"]').attributes('aria-label')).toBe('Search results');
  });
});

describe('the page in the URL', () => {
  // The app's route, as the Nuxt module provides it: a write navigates, and the query follows.
  function mountWithRoute(props: Record<string, any> = {}, initial: Record<string, string> = {}, many = true) {
    const query = reactive<Record<string, string | undefined>>({ ...initial });
    const set = vi.fn((key: string, value: string | undefined) => (query[key] = value));
    const setMany = vi.fn((entries: Record<string, string | undefined>) => Object.assign(query, entries));
    let api: any;
    const Host = defineComponent({
      setup() {
        return () =>
          h(PaginationRoot as any, props, {
            default: (slot: any) => {
              api = slot;
              return slot.items.map((entry: any) =>
                entry.type === 'page' ? h(PaginationItem as any, { key: entry.key, value: entry.page }) : null,
              );
            },
          });
      },
    });
    const wrapper = mount(Host, {
      global: { provide: { [routeQueryKey as symbol]: { get: (key: string) => query[key], set, ...(many ? { setMany } : {}) } } },
      attachTo: document.body,
    });
    return { wrapper, query, set, setMany, api: () => api };
  }
  const settle = async () => {
    await Promise.resolve();
    await nextTick();
  };

  it('starts from ?page= and ?perPage=, and writes a new page back', async () => {
    const { wrapper, query, api } = mountWithRoute({ total: 500, query: true }, { page: '3', perPage: '50' });
    expect(api().page).toBe(3);
    expect(api().perPage).toBe(50);

    await item(wrapper, 4).trigger('click');
    await settle();
    expect(query.page).toBe('4');
    expect(api().page).toBe(4);
  });

  it('leaves page 1 and the default size out of the URL', async () => {
    const { wrapper, query, api } = mountWithRoute({ total: 500, query: true }, { page: '2', perPage: '50' });

    await item(wrapper, 1).trigger('click');
    api().setPerPage(10);
    await settle();
    expect(query).toEqual({ page: undefined, perPage: undefined });
  });

  it('writes a new size and the page it moves to in one navigation', async () => {
    const { query, setMany, set, api } = mountWithRoute({ total: 500, query: true }, { page: '3' });

    api().setPerPage(20);
    await settle();
    expect(setMany).toHaveBeenCalledTimes(1);
    expect(set).not.toHaveBeenCalled();
    expect(query).toEqual({ page: '2', perPage: '20' });
    expect(api().page).toBe(2);
  });

  it('falls back to one set each without setMany, under keys of its own', async () => {
    const { query, api } = mountWithRoute({ total: 500, query: { page: 'p', perPage: 'size' } }, { p: '3' }, false);

    api().setPerPage(20);
    await settle();
    expect(query).toEqual({ p: '2', size: '20' });
  });

  it('leaves the URL alone without query, or for a bound v-model', async () => {
    const off = mountWithRoute({ total: 500 }, { page: '3' });
    expect(off.api().page).toBe(1);
    off.wrapper.unmount();

    const bound = mountWithRoute({ total: 500, query: true, modelValue: 2 }, { page: '3' });
    expect(bound.api().page).toBe(2);
    await item(bound.wrapper, 4).trigger('click');
    await settle();
    expect(bound.query.page).toBe('3');
  });
});

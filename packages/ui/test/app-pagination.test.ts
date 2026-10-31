import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import { AppPagination } from '../src';

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

function mountPagination(props: Record<string, unknown> = {}) {
  wrapper = mount(AppPagination as any, { props, attachTo: document.body });
  return wrapper;
}

const pages = () =>
  [...document.querySelectorAll<HTMLElement>('[data-part="item"], [data-part="ellipsis"]')].map((el) =>
    el.dataset.part === 'ellipsis' ? '…' : el.textContent!.trim()
  );
const page = (n: number) => document.querySelector<HTMLElement>(`[data-part="item"][data-page="${n}"]`)!;
const select = () => document.querySelector<HTMLElement>('.app-pagination-per-page .form-select-trigger');
const option = (label: string) =>
  [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((el) => el.textContent!.trim() === label)!;

describe('AppPagination', () => {
  it('lists the pages with gaps, between two arrows', () => {
    mountPagination({ totalPages: 20, defaultValue: 10 });

    expect(pages()).toEqual(['1', '…', '9', '10', '11', '…', '20']);
    expect(document.querySelector('[data-part="prev"]')!.getAttribute('aria-label')).toBe('Previous page');
    expect(page(10).getAttribute('aria-current')).toBe('page');
  });

  it('moves on a press, for v-model', async () => {
    const w = mountPagination({ totalPages: 5, modelValue: 1 });
    await later();
    page(3).click();
    await nextTick();
    expect(w.emitted('update:modelValue')![0]).toEqual([3]);
  });

  it('shows the per-page select with total-pages too, for a server that pages by it', async () => {
    const w = mountPagination({ totalPages: 5 });
    expect(select()!.textContent!.trim()).toBe('25');
    expect(pages().at(-1)).toBe('5');

    (w.findComponent({ name: 'FormSelect' }).vm as any).$emit('update:modelValue', 50);
    await nextTick();
    expect(w.emitted('update:perPage')).toEqual([[50]]);
  });

  it('shows the per-page select with a total, at 25 a page', () => {
    mountPagination({ total: 95 });
    expect(select()!.textContent!.trim()).toBe('25');
    expect(select()!.getAttribute('aria-label')).toBe('Per page');
    expect(pages().at(-1)).toBe('4');
  });

  it('hides it given no sizes to offer', () => {
    mountPagination({ total: 95, perPageOptions: [] });
    expect(select()).toBeNull();
  });

  it('heads the open list with its label', async () => {
    mountPagination({ total: 95, perPageLabel: 'Rows per page' });
    await later();
    select()!.click();
    await settle();

    const group = document.querySelector('[role="group"]')!;
    const heading = document.getElementById(group.getAttribute('aria-labelledby')!)!;
    expect(heading.textContent!.trim()).toBe('Rows per page');
    expect(select()!.getAttribute('aria-label')).toBe('Rows per page');
  });

  it('aligns the chosen size with the trigger', async () => {
    mountPagination({ total: 95 });
    await later();
    select()!.click();
    await settle();
    expect(document.querySelector('[data-part="positioner"]')!.getAttribute('data-align')).toBe('item');
  });

  it('changes the size, keeping the first item on screen', async () => {
    const w = mountPagination({ total: 200, defaultValue: 3, defaultPerPage: 10, perPageOptions: [10, 20, 50] });
    await later();
    select()!.click();
    await settle();
    option('20').click();
    await settle();

    expect(w.emitted('update:perPage')![0]).toEqual([20]);
    expect(w.emitted('update:modelValue')![0]).toEqual([2]);
    expect(page(2).getAttribute('aria-current')).toBe('page');
    expect(pages().at(-1)).toBe('10');
  });

  it('offers the current size even when it is not among the options', () => {
    mountPagination({ total: 95, defaultPerPage: 25 });
    expect(select()!.textContent!.trim()).toBe('25');
  });

  it('draws every page and arrow as a button in one group, the current page selected', () => {
    mountPagination({ totalPages: 9, defaultValue: 2 });
    const group = document.querySelector('.app-pagination-group')!;
    const items = [...group.querySelectorAll<HTMLElement>('.app-pagination-item:not(.app-pagination-ellipsis)')];

    expect(items.length).toBeGreaterThan(2);
    expect(items.every((el) => el.tagName === 'BUTTON')).toBe(true);
    expect(group.querySelector('.app-pagination-ellipsis')).not.toBeNull();
    expect(page(2).hasAttribute('data-selected')).toBe(true);
    expect(page(3).hasAttribute('data-selected')).toBe(false);
    expect(page(3).getAttribute('role')).toBeNull();
  });

  it('keeps them links, with an inert end, when pages have a target', () => {
    mountPagination({ totalPages: 5, defaultValue: 1, to: (n: number) => `#/p${n}`, perPageOptions: [] });
    const prev = document.querySelector<HTMLElement>('[data-part="prev"]')!;

    expect(page(3).tagName).toBe('A');
    expect(page(3).getAttribute('href')).toBe('#/p3');
    expect(page(3).classList.contains('app-pagination-item')).toBe(true);
    expect(page(3).getAttribute('role')).toBeNull();
    expect(prev.tagName).toBe('A');
    expect(prev.hasAttribute('href')).toBe(false);
    expect(prev.getAttribute('aria-disabled')).toBe('true');
  });

  it('adds item-class to every page and arrow, and per-page-class to the select', () => {
    mountPagination({ total: 30, itemClass: 'mine', perPageClass: 'wide' });
    const items = document.querySelectorAll('.app-pagination-item');
    expect([...items].every((el) => el.classList.contains('mine'))).toBe(true);
    expect(items.length).toBe(4);
    expect(select()!.classList.contains('wide')).toBe(true);
  });
});

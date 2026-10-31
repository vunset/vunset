import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import {
  TableRoot,
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHeadCell,
  TableCell,
} from '../src';

function mountTable(root: Record<string, any> = {}, head: Record<string, any> = {}, cell: Record<string, any> = {}, row: Record<string, any> = {}) {
  const Host = defineComponent({
    setup: () => () =>
      h(TableRoot as any, { class: 'mine', ...root }, () => [
        h(TableCaption as any, null, () => 'Users'),
        h(TableHeader as any, null, () => h(TableRow as any, null, () => h(TableHeadCell as any, head, () => 'Name'))),
        h(TableBody as any, null, () => h(TableRow as any, row, () => h(TableCell as any, cell, () => 'Ada'))),
        h(TableFooter as any, null, () => h(TableRow as any, null, () => h(TableCell as any, null, () => '1 user'))),
      ]),
  });
  return mount(Host, { attachTo: document.body });
}

const part = (wrapper: ReturnType<typeof mountTable>, name: string) => wrapper.find(`[data-part="${name}"]`);

describe('TableRoot', () => {
  it('wraps a real table in the one container that scrolls', () => {
    const wrapper = mountTable();
    const container = part(wrapper, 'table-container');

    expect(container.element.tagName).toBe('DIV');
    expect(container.attributes('style')).toContain('overflow: auto');
    expect(container.find('table').attributes('data-part')).toBe('table');
    expect(wrapper.find('caption').text()).toBe('Users');
  });

  it('gives the container the caller’s attributes', () => {
    expect(part(mountTable(), 'table-container').classes()).toContain('mine');
  });

  it('marks every part for the stylesheet', () => {
    const wrapper = mountTable();

    for (const [name, tag] of [
      ['table-header', 'THEAD'],
      ['table-body', 'TBODY'],
      ['table-footer', 'TFOOT'],
      ['table-row', 'TR'],
      ['table-head-cell', 'TH'],
      ['table-cell', 'TD'],
      ['table-caption', 'CAPTION'],
    ]) {
      expect(part(wrapper, name!).element.tagName).toBe(tag);
    }
  });
});

describe('sticky header and footer', () => {
  it('pins the header to the top of the container when asked', () => {
    const header = part(mountTable({ stickyHeader: true }), 'table-header');

    expect(header.attributes('data-sticky')).toBe('');
    expect(header.attributes('style')).toContain('position: sticky');
    expect(header.attributes('style')).toContain('top: 0');
  });

  it('leaves both in the flow otherwise', () => {
    const wrapper = mountTable();

    expect(part(wrapper, 'table-header').attributes('style')).toBeUndefined();
    expect(part(wrapper, 'table-footer').attributes('style')).toBeUndefined();
  });

  it('pins the footer to the bottom', () => {
    const footer = part(mountTable({ stickyFooter: true }), 'table-footer');

    expect(footer.attributes('style')).toContain('bottom: 0');
    expect(part(mountTable({ stickyFooter: true }), 'table-header').attributes('data-sticky')).toBeUndefined();
  });

  it('keeps a numbered header that far below the top, clear of an app bar', () => {
    const wrapper = mountTable({ stickyHeader: 56 });

    expect(part(wrapper, 'table-header').attributes('style')).toContain('top: 56px');
    expect(part(wrapper, 'table-container').attributes('data-sticky-header')).toBe('');
  });

  it('keeps a numbered footer that far above the bottom', () => {
    expect(part(mountTable({ stickyFooter: 24 }), 'table-footer').attributes('style')).toContain('bottom: 24px');
  });

  it('treats a zero offset as sticking at the edge, not as off', () => {
    const header = part(mountTable({ stickyHeader: 0 }), 'table-header');

    expect(header.attributes('data-sticky')).toBe('');
    expect(header.attributes('style')).toContain('top: 0px');
  });

  it('works outside a root, just without sticking', () => {
    const wrapper = mount(TableHeader as any, { slots: { default: '<tr><th>x</th></tr>' } });

    expect(wrapper.attributes('data-part')).toBe('table-header');
    expect(wrapper.attributes('style')).toBeUndefined();
  });
});

describe('TableRow', () => {
  it('stripes by its position in the data, not by :nth-child', () => {
    const odd = part(mountTable({}, {}, {}, { index: 3 }), 'table-body').find('tr');
    const even = part(mountTable({}, {}, {}, { index: 4 }), 'table-body').find('tr');

    expect(odd.attributes('data-index')).toBe('3');
    expect(odd.attributes('data-odd')).toBe('');
    expect(odd.attributes('data-even')).toBeUndefined();
    expect(even.attributes('data-even')).toBe('');
  });

  it('publishes selected and expanded', () => {
    const row = part(mountTable({}, {}, {}, { selected: true, expanded: true }), 'table-body').find('tr');

    expect(row.attributes('data-selected')).toBe('');
    expect(row.attributes('data-expanded')).toBe('');
  });

  it('claims nothing without an index', () => {
    const row = part(mountTable(), 'table-body').find('tr');

    expect(row.attributes('data-index')).toBeUndefined();
    expect(row.attributes('data-odd')).toBeUndefined();
    expect(row.attributes('data-even')).toBeUndefined();
  });
});

describe('TableHeadCell', () => {
  const head = (props: Record<string, any>) => part(mountTable({}, props), 'table-head-cell');

  it('is a column header', () => {
    expect(head({}).attributes('scope')).toBe('col');
  });

  it('says how it is sorted, and only when it can be', () => {
    expect(head({}).attributes('aria-sort')).toBeUndefined();
    expect(head({ sort: false }).attributes('aria-sort')).toBe('none');
    expect(head({ sort: 'asc' }).attributes('aria-sort')).toBe('ascending');
    expect(head({ sort: 'desc' }).attributes('aria-sort')).toBe('descending');
    expect(head({ sort: 'desc' }).attributes('data-sort')).toBe('desc');
    expect(head({ sort: false }).attributes('data-sort')).toBeUndefined();
  });
});

describe('pinning and width', () => {
  const style = (element: Element) => (element as HTMLElement).style;

  it('sticks a pinned column to its edge, head and cell alike', () => {
    const wrapper = mountTable({}, { pinned: 'start', offset: 40 }, { pinned: 'start', offset: 40 });

    for (const name of ['table-head-cell', 'table-cell']) {
      const node = part(wrapper, name);
      expect(node.attributes('data-pinned')).toBe('start');
      expect(style(node.element).position).toBe('sticky');
      expect(style(node.element).getPropertyValue('inset-inline-start')).toBe('40px');
    }
  });

  it('measures an end-pinned column from the far edge', () => {
    const cell = part(mountTable({}, {}, { pinned: 'end' }), 'table-cell');

    expect(style(cell.element).getPropertyValue('inset-inline-end')).toBe('0px');
    expect(style(cell.element).getPropertyValue('inset-inline-start')).toBe('');
  });

  it('holds a width with all three properties, so auto layout cannot stretch it', () => {
    const cell = style(part(mountTable({}, {}, { width: 120 }), 'table-cell').element);

    expect([cell.width, cell.minWidth, cell.maxWidth]).toEqual(['120px', '120px', '120px']);
    expect(style(part(mountTable({}, { width: '10rem' }), 'table-head-cell').element).width).toBe('10rem');
  });

  it('draws a width as the whole cell, padding included', () => {
    // Otherwise a pinned neighbor, offset by that width, is out by the padding.
    expect(style(part(mountTable({}, {}, { width: 120 }), 'table-cell').element).boxSizing).toBe('border-box');
  });

  it('sets no position on a column that is not pinned', () => {
    expect(style(part(mountTable(), 'table-cell').element).position).toBe('');
  });
});

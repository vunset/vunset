import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h } from 'vue';
import { TableHeader, TableBody, TableRow, TableHeadCell, TableCell } from '@vunset/vue';
import { AppTable } from '../src';

let wrapper: VueWrapper<any> | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

function mountTable(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  wrapper = mount(AppTable as any, {
    props,
    attrs,
    slots: {
      default: () => [
        h(TableHeader, () => h(TableRow, () => h(TableHeadCell, () => 'Name'))),
        h(TableBody, () => h(TableRow, { index: 0 }, () => h(TableCell, () => 'Ada')))
      ]
    }
  });
  return wrapper;
}

const container = () => wrapper!.find('[data-part="table-container"]');

describe('AppTable', () => {
  it('is a TableRoot in the app-table class, the caller’s class and attributes on the container', () => {
    mountTable({}, { class: 'app-table-striped', 'aria-label': 'People' });

    expect(container().classes()).toEqual(expect.arrayContaining(['app-table', 'app-table-striped']));
    expect(container().attributes('aria-label')).toBe('People');
    expect(container().find('table th').text()).toBe('Name');
    expect(container().find('table td').text()).toBe('Ada');
  });

  it('puts `table-class` on the table, not the container', () => {
    mountTable({ tableClass: ['mine', { other: true }] });

    expect(container().find('table').classes()).toEqual(['mine', 'other']);
    expect(container().classes()).not.toContain('mine');
  });

  it('sticks nothing unless asked', () => {
    mountTable();
    expect(container().attributes('data-sticky-header')).toBeUndefined();
    expect(container().attributes('data-sticky-footer')).toBeUndefined();
    expect(wrapper!.find('thead').attributes('style')).toBeUndefined();
  });

  it('passes sticky-header, sticky-footer and row-count on', () => {
    mountTable({ stickyHeader: 48, stickyFooter: true, rowCount: 500 });

    expect(container().attributes('data-sticky-header')).toBe('');
    expect(container().attributes('data-sticky-footer')).toBe('');
    expect(wrapper!.find('thead').attributes('style')).toContain('top: 48px');
    expect(wrapper!.find('table').attributes('aria-rowcount')).toBe('500');
  });
});

import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import type { DataTableColumn } from '@vunset/ui/data-table';
import { routeQueryKey } from '@vunset/vue';
import { AppDataTable } from '../src/data-table';

interface Person {
  id: string;
  name: string;
  age: number;
  members?: Person[];
}

const PEOPLE: Person[] = [
  { id: 'grace', name: 'Grace', age: 85 },
  { id: 'ada', name: 'Ada', age: 36 },
  {
    id: 'team',
    name: 'Team',
    age: 0,
    members: [{ id: 'alan', name: 'Alan', age: 41 }]
  }
];

const COLUMNS: DataTableColumn<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age', meta: { class: 'app-table-numeric' } }
];

let wrapper: VueWrapper<any> | undefined;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

function mountTable(props: Record<string, unknown> = {}, slots: Record<string, any> = {}, attrs = {}) {
  wrapper = mount(AppDataTable as any, {
    props: { data: PEOPLE, columns: COLUMNS, getRowId: (row: Person) => row.id, ...props },
    attrs,
    slots,
    attachTo: document.body
  });
  return wrapper;
}

const names = () => wrapper!.findAll('tbody td[data-column="name"]').map((td) => td.text());
const sortIcon = (id: string) => wrapper!.find(`th[data-column="${id}"] [data-part="table-sort-icon"]`);
const activePaths = (id: string) => sortIcon(id).findAll('path[data-active]');

describe('AppDataTable', () => {
  it('passes each class prop on to its element', () => {
    mountTable({ tableClass: 'on-table', headerClass: 'on-header', bodyClass: 'on-body', rowClass: 'on-row', thClass: 'on-th', tdClass: 'on-td' });
    const root = wrapper!.find('[data-part="table-container"]');

    expect(root.find('table').classes()).toContain('on-table');
    expect(root.find('thead').classes()).toContain('on-header');
    expect(root.find('tbody').classes()).toContain('on-body');
    expect(root.find('tbody tr').classes()).toContain('on-row');
    expect(root.find('thead th').classes()).toContain('on-th');
    expect(root.find('tbody td').classes()).toContain('on-td');
    // None of them is left on the container.
    expect(root.attributes('table-class')).toBeUndefined();
    expect(root.classes()).not.toContain('on-td');
  });

  it('is a DataTable in the .app-table look, the caller’s class and attributes on the container', () => {
    mountTable({}, {}, { class: 'mine', 'aria-label': 'People' });
    const root = wrapper!.find('[data-part="table-container"]');

    expect(root.classes()).toEqual(expect.arrayContaining(['app-table', 'app-data-table', 'mine']));
    expect(root.attributes('aria-label')).toBe('People');
    expect(root.attributes('data-table')).toBe('data');
  });

  it('stripes its rows with striped, by Data table’s hook rather than a class', () => {
    mountTable({ striped: true });
    const root = wrapper!.find('[data-part="table-container"]');

    expect(root.attributes('data-striped')).toBe('');
    expect(root.classes()).not.toContain('app-table-striped');
  });

  it('draws Data table’s sort icon, both ways faint while unsorted and the sorted one marked', async () => {
    mountTable();
    expect(sortIcon('age').attributes('data-direction')).toBeUndefined();
    expect(activePaths('age')).toHaveLength(0);

    await wrapper!.find('th[data-column="age"] [data-part="table-sort"]').trigger('click');

    expect(sortIcon('age').attributes('data-direction')).toBe('desc');
    expect(activePaths('age')).toHaveLength(1);
    expect(wrapper!.emitted('update:sorting')).toEqual([[[{ id: 'age', desc: true }]]]);
  });

  it('follows a sort it is given', async () => {
    mountTable({ sorting: [{ id: 'name', desc: false }] });
    expect(names()).toEqual(['Ada', 'Grace', 'Team']);
    expect(sortIcon('name').attributes('data-direction')).toBe('asc');

    await wrapper!.setProps({ sorting: [{ id: 'name', desc: true }] });
    expect(names()).toEqual(['Team', 'Grace', 'Ada']);
  });

  it('takes a sort icon of the caller’s own', () => {
    mountTable({}, { sort: '<template #sort="{ direction }"><i class="own">{{ direction || "-" }}</i></template>' });
    expect(wrapper!.find('th[data-column="age"] .own').text()).toBe('-');
    expect(sortIcon('age').exists()).toBe(false);
  });

  it('passes the per-column slots through', () => {
    mountTable(
      {},
      {
        'cell-age': '<template #cell-age="{ cell }">{{ cell }} y</template>',
        'head-name': '<template #head-name>Who</template>',
        'foot-age': '<template #foot-age="{ getValues }">{{ getValues().length }} rows</template>'
      }
    );

    expect(wrapper!.find('tbody td[data-column="age"]').text()).toBe('85 y');
    expect(wrapper!.find('th[data-column="name"]').text()).toBe('Who');
    expect(wrapper!.find('tfoot td[data-column="age"]').text()).toBe('3 rows');
  });

  it('takes a body cell slot under its bare column id too', () => {
    mountTable({}, { age: '<template #age="{ cell }">{{ cell }} y</template>' });

    expect(wrapper!.find('tbody td[data-column="age"]').text()).toBe('85 y');
  });

  it('puts a column’s meta class on its cells', () => {
    mountTable();
    expect(wrapper!.find('tbody td[data-column="age"]').classes()).toContain('app-table-numeric');
  });

  it('expands a nested row from its button, and reports it', async () => {
    mountTable({ nestedKey: 'members' });
    const button = wrapper!.find('[data-part="table-expander"]');

    expect(button.find('svg').exists()).toBe(true);
    expect(button.attributes('aria-label')).toBe('Expand row');

    await button.trigger('click');

    expect(names()).toEqual(['Grace', 'Ada', 'Team', 'Alan']);
    expect(wrapper!.findAll('tbody tr')[3]!.attributes('data-depth')).toBe('1');
    expect(wrapper!.emitted('update:expanded')).toEqual([[{ team: true }]]);
  });

  it('starts from default-sort', () => {
    mountTable({ defaultSort: 'name:asc' });
    expect(names()).toEqual([...names()].sort());
    expect(wrapper!.find('th[data-column="name"]').attributes('aria-sort')).toBe('ascending');
  });

  it('keeps a manual sort in the URL the app provides', async () => {
    const set = vi.fn();
    wrapper = mount(AppDataTable as any, {
      props: { data: PEOPLE, columns: COLUMNS, getRowId: (row: Person) => row.id, manualSorting: true },
      global: { provide: { [routeQueryKey as symbol]: { get: () => 'name:desc', set } } },
      attachTo: document.body
    });
    expect(wrapper.find('th[data-column="name"]').attributes('aria-sort')).toBe('descending');

    await wrapper.find('th[data-column="name"] [data-part="table-sort"]').trigger('click');
    expect(set).toHaveBeenCalledWith('sortBy', undefined);
  });

  it('passes the other v-models’ changes on', async () => {
    mountTable({ columnVisibility: { age: false } });
    expect(wrapper!.find('th[data-column="age"]').exists()).toBe(false);

    wrapper!.vm.table.getColumn('age').toggleVisibility(true);
    await nextTick();
    expect(wrapper!.emitted('update:columnVisibility')).toEqual([[{ age: true }]]);
  });

  it('says so when there are no rows, in its text or the caller’s', async () => {
    mountTable({ data: [] });
    const empty = () => wrapper!.find('tbody tr[data-empty] td');

    expect(empty().attributes('colspan')).toBe('2');
    expect(empty().find('.app-data-table-empty').text()).toBe('Nothing to show');

    await wrapper!.setProps({ emptyText: 'No people yet' });
    expect(empty().text()).toBe('No people yet');

    wrapper!.unmount();
    mountTable({ data: [] }, { empty: '<b class="own">None</b>' });
    expect(empty().find('.own').text()).toBe('None');
    expect(empty().find('.app-data-table-empty').exists()).toBe(false);
  });

  it('exposes the TanStack table', () => {
    mountTable();
    expect(wrapper!.vm.table.getRowModel().rows).toHaveLength(3);
  });
});

import { describe, it, expect, onTestFinished, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted, reactive } from 'vue';
import { DataTable, formatSort, parseSort, type DataTableColumn } from '../src/data-table';
import { CheckboxRoot, Deferred, routeQueryKey } from '../src';

interface User {
  id: string;
  name: string;
  age: number;
  city: string;
  children?: User[];
}

const USERS: User[] = [
  { id: 'u1', name: 'Grace', age: 85, city: 'Arlington' },
  { id: 'u2', name: 'Ada', age: 36, city: 'London' },
  { id: 'u3', name: 'Alan', age: 41, city: 'Wilmslow' }
];

const COLUMNS: DataTableColumn<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
  { accessorKey: 'city', header: 'City' }
];

function mountTable(props: Record<string, any> = {}, slots: Record<string, any> = {}) {
  return mount(DataTable as any, {
    props: { data: USERS, columns: COLUMNS, getRowId: (row: User) => row.id, ...props },
    slots,
    attachTo: document.body
  });
}

const heads = (wrapper: VueWrapper<any>) => wrapper.findAll('thead th').map((th) => th.text());
/** A width as drawn: the value itself, or the `var(--dt-col-n)` it names, from the table's container. */
const px = (cell: Element, value: string) => {
  const name = /^var\((--[\w-]+)\)$/.exec(value)?.[1];
  return name ? cell.closest<HTMLElement>('[data-part="table-container"]')!.style.getPropertyValue(name) : value;
};
const widths = (cell: Element) => {
  const style = (cell as HTMLElement).style;
  return [style.width, style.minWidth, style.maxWidth].map((value) => px(cell, value));
};
const column = (wrapper: VueWrapper<any>, id: string) =>
  wrapper.findAll(`tbody td[data-column="${id}"]`).map((td) => td.text());
const headOf = (wrapper: VueWrapper<any>, id: string) => wrapper.find(`thead th[data-column="${id}"]`);

describe('DataTable', () => {
  it('draws the columns and the rows through the Table parts', () => {
    const wrapper = mountTable();

    expect(wrapper.find('[data-part="table-container"]').attributes('data-table')).toBe('data');
    expect(heads(wrapper)).toEqual(['Name', 'Age', 'City']);
    expect(column(wrapper, 'name')).toEqual(['Grace', 'Ada', 'Alan']);
    expect(wrapper.findAll('tbody tr').map((tr) => tr.attributes('data-index'))).toEqual(['0', '1', '2']);
  });

  it('takes the columns from a helper', () => {
    const wrapper = mountTable({
      columns: (helper: any) => [
        helper.accessor('name', { header: 'Who' }),
        helper.accessor('city', { header: 'Where' })
      ]
    });

    expect(heads(wrapper)).toEqual(['Who', 'Where']);
    expect(column(wrapper, 'city')).toEqual(['Arlington', 'London', 'Wilmslow']);
  });

  it('follows the data it is given', async () => {
    const props = reactive({ data: [...USERS], columns: COLUMNS });
    const Host = defineComponent({ setup: () => () => h(DataTable as any, props) });
    const wrapper = mount(Host, { attachTo: document.body });

    props.data = [USERS[1]!];
    await nextTick();

    expect(column(wrapper as any, 'name')).toEqual(['Ada']);
  });

  it('keys a row by its data object without getRowId, so a filter keeps each row its own <tr>', async () => {
    const props = reactive({ data: [...USERS], columns: COLUMNS });
    const Host = defineComponent({ setup: () => () => h(DataTable as any, props) });
    const wrapper = mount(Host, { attachTo: document.body });
    const alan = wrapper.findAll('tbody tr')[2]!.element;

    props.data = [USERS[2]!];
    await nextTick();

    expect(wrapper.find('tbody tr').element).toBe(alan);
  });

  it('shows the empty slot across every column when there are no rows', () => {
    const wrapper = mountTable({ data: [] }, { empty: 'Nobody here' });
    const cell = wrapper.find('tbody [data-empty] td');

    expect(cell.text()).toBe('Nobody here');
    expect(cell.attributes('colspan')).toBe('3');
  });

  it('passes a row’s attributes through to its <tr>', () => {
    const wrapper = mountTable({ rowAttrs: (row: User) => ({ 'data-city': row.city }) });

    expect(wrapper.findAll('tbody tr').map((tr) => tr.attributes('data-city'))).toEqual([
      'Arlington',
      'London',
      'Wilmslow'
    ]);
  });
});

describe('class props', () => {
  const CLASSES = {
    tableClass: 'on-table',
    headerClass: 'on-header',
    bodyClass: 'on-body',
    footerClass: 'on-footer',
    rowClass: 'on-row',
    thClass: 'on-th',
    tdClass: 'on-td',
    tfClass: 'on-tf'
  };
  const mountClassed = (columns: DataTableColumn<User>[] = COLUMNS) =>
    mountTable(
      { ...CLASSES, columns: columns.map((column) => ({ ...column, footer: 'Total' })) },
      { empty: () => 'None' }
    );

  it('puts each on its own element, and `class` on the container', () => {
    const wrapper = mount(DataTable as any, {
      props: { data: USERS, columns: COLUMNS.map((column) => ({ ...column, footer: 'Total' })), ...CLASSES },
      attrs: { class: 'on-container' },
      attachTo: document.body
    });
    const every = (selector: string, name: string) =>
      wrapper.findAll(selector).length > 0 && wrapper.findAll(selector).every((node) => node.classes().includes(name));

    expect(wrapper.find('[data-part="table-container"]').classes()).toContain('on-container');
    expect(wrapper.find('table').classes()).toEqual(['on-table']);
    expect(wrapper.find('thead').classes()).toContain('on-header');
    expect(wrapper.find('tbody').classes()).toContain('on-body');
    expect(wrapper.find('tfoot').classes()).toContain('on-footer');
    expect(every('tbody tr', 'on-row')).toBe(true);
    expect(every('thead th', 'on-th')).toBe(true);
    expect(every('tbody td', 'on-td')).toBe(true);
    expect(every('tfoot td', 'on-tf')).toBe(true);
    // Each stays on its own part.
    expect(wrapper.find('thead tr').classes()).not.toContain('on-row');
    expect(wrapper.find('tbody td').classes()).not.toContain('on-th');
  });

  it('keeps a column’s own classes beside them', () => {
    const wrapper = mountClassed([
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { class: 'col', thClass: 'col-th', tdClass: () => 'col-td', tfClass: 'col-tf' }
      }
    ]);

    expect(wrapper.find('thead th').classes()).toEqual(expect.arrayContaining(['on-th', 'col', 'col-th']));
    expect(wrapper.find('tbody td').classes()).toEqual(expect.arrayContaining(['on-td', 'col', 'col-td']));
    expect(wrapper.find('tfoot td').classes()).toEqual(expect.arrayContaining(['on-tf', 'col', 'col-tf']));
  });

  it('merges `row-class` with a row’s own `row-attrs` class', () => {
    const wrapper = mountTable({ rowClass: 'on-row', rowAttrs: (row: User) => ({ class: `row-${row.id}` }) });

    expect(wrapper.find('tbody tr').classes()).toEqual(expect.arrayContaining(['on-row', 'row-u1']));
  });
});

describe('sorting', () => {
  const sortButton = (wrapper: VueWrapper<any>, id: string) => headOf(wrapper, id).find('[data-part="table-sort"]');

  it('sorts from a real button in the header, and says so on the cell', async () => {
    const wrapper = mountTable();

    await sortButton(wrapper, 'name').trigger('click');
    expect(headOf(wrapper, 'name').attributes('aria-sort')).toBe('ascending');
    expect(column(wrapper, 'name')).toEqual(['Ada', 'Alan', 'Grace']);

    await sortButton(wrapper, 'name').trigger('click');
    expect(headOf(wrapper, 'name').attributes('aria-sort')).toBe('descending');
    expect(column(wrapper, 'name')).toEqual(['Grace', 'Alan', 'Ada']);
  });

  it('sorts numbers largest first, as TanStack does', async () => {
    const wrapper = mountTable();

    await sortButton(wrapper, 'age').trigger('click');

    expect(headOf(wrapper, 'age').attributes('aria-sort')).toBe('descending');
    expect(column(wrapper, 'age')).toEqual(['85', '41', '36']);
  });

  it('marks a sortable column that is not sorted as none', () => {
    const wrapper = mountTable();

    expect(headOf(wrapper, 'name').attributes('aria-sort')).toBe('none');
    expect(sortButton(wrapper, 'name').element.tagName).toBe('BUTTON');
  });

  it('reports the new sort', async () => {
    const wrapper = mountTable();

    await sortButton(wrapper, 'name').trigger('click');

    expect(wrapper.emitted('update:sorting')![0]).toEqual([[{ id: 'name', desc: false }]]);
  });

  it('starts from a sort it is given', () => {
    const wrapper = mountTable({ sorting: [{ id: 'name', desc: false }] });

    expect(column(wrapper, 'name')).toEqual(['Ada', 'Alan', 'Grace']);
  });

  it('starts from a default sort written as `column:direction`, then sorts on its own', async () => {
    const wrapper = mountTable({ defaultSort: 'name:desc' });
    expect(column(wrapper, 'name')).toEqual(['Grace', 'Alan', 'Ada']);
    expect(headOf(wrapper, 'name').attributes('aria-sort')).toBe('descending');

    await sortButton(wrapper, 'age').trigger('click');
    expect(column(wrapper, 'age')).toEqual(['85', '41', '36']);
    expect(wrapper.emitted('update:sorting')![0]).toEqual([[{ id: 'age', desc: true }]]);
  });

  it('reads a default sort as ascending without a direction, and as TanStack’s own form', () => {
    expect(column(mountTable({ defaultSort: 'name' }), 'name')).toEqual(['Ada', 'Alan', 'Grace']);
    expect(column(mountTable({ defaultSort: [{ id: 'age', desc: false }] }), 'age')).toEqual(['36', '41', '85']);
  });

  it('leaves a bound sort alone', () => {
    const wrapper = mountTable({ sorting: [], defaultSort: 'name:desc' });
    expect(column(wrapper, 'name')).toEqual(['Grace', 'Ada', 'Alan']);
  });

  it('leaves the order to the server when sorting is manual', async () => {
    const wrapper = mountTable({ manualSorting: true });

    await sortButton(wrapper, 'name').trigger('click');

    // The state moved and is reported; the rows are left as the server sent them.
    expect(headOf(wrapper, 'name').attributes('aria-sort')).toBe('ascending');
    expect(column(wrapper, 'name')).toEqual(['Grace', 'Ada', 'Alan']);
  });

  it('draws no sort buttons when sorting is off', () => {
    const wrapper = mountTable({ enableSorting: false });

    expect(wrapper.find('[data-part="table-sort"]').exists()).toBe(false);
    expect(headOf(wrapper, 'name').attributes('aria-sort')).toBeUndefined();
  });

  it('marks the direction on the default icon, and takes an icon of the caller’s own', async () => {
    const plain = mountTable({ sorting: [{ id: 'age', desc: true }] });
    expect(headOf(plain, 'age').find('[data-part="table-sort-icon"]').attributes('data-direction')).toBe('desc');

    const own = mountTable(
      {},
      { sort: '<template #sort="{ direction }"><i class="mine">{{ direction || "-" }}</i></template>' }
    );
    expect(headOf(own, 'age').find('.mine').text()).toBe('-');
  });
});

describe('slots', () => {
  it('renders a cell through #cell-{id}, with the row and the value', () => {
    const wrapper = mountTable(
      {},
      { 'cell-name': '<template #cell-name="{ cell, row }"><b>{{ cell }} ({{ row.age }})</b></template>' }
    );

    expect(column(wrapper, 'name')).toEqual(['Grace (85)', 'Ada (36)', 'Alan (41)']);
  });

  it('renders a body cell through #{id} as well as #cell-{id}', () => {
    const wrapper = mountTable({}, { age: '<template #age="{ cell }">{{ cell }} y</template>' });

    expect(column(wrapper, 'age')).toEqual(['85 y', '36 y', '41 y']);
  });

  it('puts #head-{id}-start and -end beside the header text, sorting or not', () => {
    const slots = {
      'head-age-start': '<template #head-age-start><i>s</i></template>',
      'head-age-end': '<template #head-age-end="{ getValues }"><b>{{ getValues().length }}</b></template>'
    };
    const sorting = mountTable({}, slots);
    expect(headOf(sorting, 'age').find('[data-part="table-sort"]').text()).toBe('sAge3');
    sorting.unmount();

    const plain = mountTable({ enableSorting: false }, slots);
    expect(headOf(plain, 'age').find('[data-part="table-sort"]').exists()).toBe(false);
    expect(headOf(plain, 'age').text()).toBe('sAge3');
  });

  it('renders a header through #head-{id}, still inside the sort button', () => {
    const wrapper = mountTable({}, { 'head-age': '<template #head-age><em>Years</em></template>' });

    expect(headOf(wrapper, 'age').find('[data-part="table-sort"] em').text()).toBe('Years');
  });

  it('draws a footer only when a column has one', () => {
    expect(mountTable().find('tfoot').exists()).toBe(false);

    const wrapper = mountTable(
      {},
      {
        'foot-age':
          '<template #foot-age="{ getValues }">{{ getValues().reduce((sum, age) => sum + age, 0) }}</template>'
      }
    );

    expect(wrapper.find('tfoot td[data-column="age"]').text()).toBe('162');
  });

  it('renders a footer from its column definition too', () => {
    const wrapper = mountTable({
      columns: [
        { accessorKey: 'name', header: 'Name', footer: 'Total' },
        { accessorKey: 'age', header: 'Age' }
      ]
    });

    expect(wrapper.find('tfoot td[data-column="name"]').text()).toBe('Total');
  });
});

describe('columns', () => {
  it('marks the container data-striped with striped, and leaves classes to the app', () => {
    const plain = mountTable();
    expect(plain.find('[data-part="table-container"]').attributes('data-striped')).toBeUndefined();
    plain.unmount();

    const striped = mountTable({ striped: true });
    expect(striped.find('[data-part="table-container"]').attributes('data-striped')).toBe('');
    expect(striped.find('[data-part="table-container"]').attributes('class') ?? '').not.toMatch(/app-/);
  });

  it('holds a width only for a column that was given one, on every cell of it, marked to clip', () => {
    const wrapper = mountTable({
      columns: [{ accessorKey: 'name', header: 'Name', size: 200 }, { accessorKey: 'age' }]
    });
    const style = (selector: string) => (wrapper.find(selector).element as HTMLElement).style;

    expect(widths(wrapper.find('thead th[data-column="name"]').element)).toEqual(['200px', '200px', '200px']);
    expect(style('thead th[data-column="age"]').width).toBe('');
    // Every cell holds it, so a long value is clipped instead of widening the column. They all
    // read one value on the container, which a resize rewrites alone.
    expect(style('[data-part="table-container"]').getPropertyValue('--dt-col-0')).toBe('200px');
    for (const td of wrapper.findAll('tbody td[data-column="name"]')) {
      expect((td.element as HTMLElement).style.width).toBe('var(--dt-col-0)');
      expect(widths(td.element)).toEqual(['200px', '200px', '200px']);
      expect(td.attributes('data-sized')).toBe('');
    }
    for (const td of wrapper.findAll('tbody td[data-column="age"]')) {
      expect((td.element as HTMLElement).style.width).toBe('');
      expect(td.attributes('data-sized')).toBeUndefined();
    }
  });

  it('hides a column its definition says to, until it is shown', async () => {
    const columns: DataTableColumn<User>[] = [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'age', header: 'Age', meta: { show: false } }
    ];
    const hidden = mountTable({ columns });
    expect(heads(hidden)).toEqual(['Name']);

    const shown = mountTable({ columns, columnVisibility: { age: true } });
    expect(heads(shown)).toEqual(['Name', 'Age']);
  });

  it('gives a pinned column a width even without a size, since its neighbors are offset by it', () => {
    const wrapper = mountTable({
      columns: [{ accessorKey: 'name', header: 'Name', meta: { pin: 'start' } }, { accessorKey: 'age' }]
    });

    expect(widths(wrapper.find('thead th[data-column="name"]').element)[0]).toBe('150px');
  });

  it('pins columns to their edges, each after the one before it', () => {
    const wrapper = mountTable({
      columns: [
        { accessorKey: 'name', header: 'Name', size: 120, meta: { pin: 'start' } },
        { accessorKey: 'age', header: 'Age', size: 60, meta: { pin: 'start' } },
        { accessorKey: 'city', header: 'City', meta: { pin: 'end' } }
      ]
    });
    const cell = (id: string) => wrapper.find(`tbody td[data-column="${id}"]`);
    const inset = (id: string, side: string) => (cell(id).element as HTMLElement).style.getPropertyValue(side);

    expect(cell('name').attributes('data-pinned')).toBe('start');
    expect(inset('name', 'inset-inline-start')).toBe('0px');
    expect(inset('age', 'inset-inline-start')).toBe('120px');
    expect(inset('city', 'inset-inline-end')).toBe('0px');

    // The last start column and the first end column are the ones the rest slide under.
    expect(cell('name').attributes('data-pinned-edge')).toBeUndefined();
    expect(cell('age').attributes('data-pinned-edge')).toBe('');
    expect(cell('city').attributes('data-pinned-edge')).toBe('');
  });

  it('offsets end-pinned columns from the far edge, inward', () => {
    const wrapper = mountTable({
      columns: [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'age', header: 'Age', size: 60, meta: { pin: 'end' } },
        { accessorKey: 'city', header: 'City', size: 90, meta: { pin: 'end' } }
      ]
    });
    const inset = (id: string) =>
      (wrapper.find(`tbody td[data-column="${id}"]`).element as HTMLElement).style.getPropertyValue('inset-inline-end');

    // `city` is at the edge; `age` sits inside it, by city's width.
    expect(inset('city')).toBe('0px');
    expect(inset('age')).toBe('90px');
  });

  it('draws column groups as a row of their own', () => {
    const wrapper = mountTable({
      columns: [
        { accessorKey: 'name', header: 'Name' },
        {
          id: 'details',
          header: 'Details',
          columns: [
            { accessorKey: 'age', header: 'Age' },
            { accessorKey: 'city', header: 'City' }
          ]
        }
      ]
    });
    const rows = wrapper.findAll('thead tr');

    expect(rows).toHaveLength(2);
    expect(rows[0]!.find('th[data-column="details"]').attributes('colspan')).toBe('2');
    expect(rows[1]!.findAll('th').map((th) => th.text())).toEqual(['Name', 'Age', 'City']);
  });

  it('puts the meta classes on the right cells', () => {
    const wrapper = mountTable({
      columns: [
        {
          accessorKey: 'age',
          header: 'Age',
          meta: {
            class: 'num',
            thClass: 'head',
            tdClass: (context: any) => (context.getValue() > 40 ? 'old' : undefined)
          }
        }
      ]
    });

    expect(headOf(wrapper, 'age').classes()).toEqual(expect.arrayContaining(['num', 'head']));
    expect(wrapper.findAll('tbody td').map((td) => td.classes().includes('old'))).toEqual([true, false, true]);
  });

  describe('resizing', () => {
    /**
     * jsdom has no layout. The header stands in for the browser: asked for no
     * width, it settles at 90px — its content — and otherwise draws at the
     * width it was given. As in a table, its column is no narrower than any of
     * its body cells' `min-width`, nor than their content where nothing holds
     * them (`body`).
     */
    /** What each column's header needs; it is drawn at no less. */
    let content: Record<string, number> = {};
    /** What each column's body content needs, where its cells hold no width. */
    let body: Record<string, number> = {};
    /** Spare room the table shares among its columns, when it is wider than they are. */
    let spare = 0;

    function mountResizable(props: Record<string, any> = {}) {
      content = { name: 90 };
      body = {};
      spare = 0;
      // Stubbed on the prototype, so it is in place before the first render
      // measures anything. Only the header cells are asked.
      const original = HTMLTableCellElement.prototype.getBoundingClientRect;
      Object.defineProperty(HTMLTableCellElement.prototype, 'getBoundingClientRect', {
        configurable: true,
        value(this: HTMLElement) {
          const [width] = widths(this);
          const collapsed = width === '0px';
          const given = collapsed ? 0 : parseFloat(width!) || 0;
          const column = this.dataset.column ?? '';
          const cells = [...document.querySelectorAll<HTMLElement>(`tbody td[data-column="${column}"]`)];
          const held = Math.max(0, ...cells.map((cell) => parseFloat(widths(cell)[1]!) || 0));
          const free = cells.some((cell) => cell.style.maxWidth === '') ? (body[column] ?? 0) : 0;
          const needs = Math.max(content[column] ?? 0, held, free);
          // A collapsed column is at its content; the spare room goes elsewhere.
          return { width: Math.max(given, needs) + (collapsed ? 0 : spare) };
        }
      });
      onTestFinished(() => {
        Object.defineProperty(HTMLTableCellElement.prototype, 'getBoundingClientRect', {
          configurable: true,
          value: original
        });
      });
      return mountTable({
        columns: [{ accessorKey: 'name', header: 'Name', size: 200, enableResizing: true }, { accessorKey: 'age' }],
        ...props
      });
    }

    async function resize(wrapper: VueWrapper<any>, from: number, to: number) {
      const handle = headOf(wrapper, 'name').find('[data-part="table-resizer"]');
      handle.element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: from }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: to }));
      document.dispatchEvent(new MouseEvent('mouseup', { clientX: to }));
      await nextTick();
    }

    const width = (wrapper: VueWrapper<any>) => widths(headOf(wrapper, 'name').element)[0];

    it('grows and shrinks with the pointer', async () => {
      const wrapper = mountResizable();

      await resize(wrapper, 200, 260);

      expect(width(wrapper)).toBe('260px');
    });

    it('stops at the narrowest the column can really be drawn', async () => {
      const wrapper = mountResizable();

      // Asked for 50px; the content will not go below 90.
      await resize(wrapper, 200, 50);

      expect(width(wrapper)).toBe('90px');
      expect(wrapper.emitted('update:columnSizing')!.at(-1)).toEqual([{ name: 90 }]);
      // Never below it on the way, either: nothing is drawn at a size the content refuses.
      expect(wrapper.emitted('update:columnSizing')!.every(([next]: any) => next.name >= 90)).toBe(true);
    });

    it('grows again at once from the floor, with no dead zone to drag through', async () => {
      const wrapper = mountResizable();

      await resize(wrapper, 200, 50);
      await resize(wrapper, 100, 160);

      expect(width(wrapper)).toBe('150px');
    });

    it('holds a column at its width however long a value in it, clipping the value', async () => {
      const NESTED = [
        {
          id: 'team',
          name: 'Team',
          age: 0,
          city: '-',
          children: [{ id: 'c', name: 'A much longer child name', age: 1, city: '-' }]
        }
      ];
      const wrapper = mountResizable({ data: NESTED, nestedKey: 'children' });
      body = { name: 400 };

      await resize(wrapper, 200, 50);
      expect(width(wrapper)).toBe('90px');

      await wrapper.find('[data-part="table-expander"]').trigger('click');
      await nextTick();

      expect(width(wrapper)).toBe('90px');
      expect(wrapper.emitted('update:columnSizing')!.every(([next]: any) => next.name <= 200)).toBe(true);
    });

    it('widens a column whose header outgrows it, as one that counts its rows', async () => {
      const wrapper = mountResizable();

      await resize(wrapper, 200, 50);
      expect(width(wrapper)).toBe('90px');

      content = { name: 170 };
      await wrapper.setProps({ data: [...USERS] });
      await nextTick();

      expect(width(wrapper)).toBe('170px');
      expect(wrapper.emitted('update:columnSizing')!.at(-1)).toEqual([{ name: 170 }]);
    });

    it('does not narrow a column when its content does', async () => {
      const wrapper = mountResizable();

      await resize(wrapper, 200, 260);
      content = { name: 40 };
      await wrapper.setProps({ data: [USERS[0]] });
      await nextTick();

      expect(width(wrapper)).toBe('260px');
    });

    it('fits a pinned column whose given size is narrower than its content from the start', async () => {
      const wrapper = mountResizable({
        columns: [{ accessorKey: 'name', header: 'Name', size: 60, meta: { pin: 'start' } }, { accessorKey: 'age' }]
      });
      await nextTick();

      // Otherwise its neighbors are offset by 60 while it is drawn at 90.
      expect(width(wrapper)).toBe('90px');
    });

    it('does not take the table’s spare room into a column’s size', async () => {
      const wrapper = mountResizable();

      // Every column drawn 40px wider than it was sized, content unchanged.
      spare = 40;
      await wrapper.setProps({ data: [...USERS] });
      await nextTick();

      expect(width(wrapper)).toBe('200px');
      expect(wrapper.emitted('update:columnSizing')).toBeUndefined();
    });

    it('never freezes a width onto a column that has none', async () => {
      const wrapper = mountResizable();

      content = { name: 90, age: 300 };
      await wrapper.setProps({ data: [...USERS] });
      await nextTick();

      expect((headOf(wrapper, 'age').element as HTMLElement).style.width).toBe('');
      expect(wrapper.emitted('update:columnSizing')).toBeUndefined();
    });

    it('puts the column back as it was after measuring it, even when nothing moves', async () => {
      const wrapper = mountResizable();

      // A press with no drag — the first half of a double-click reset. Nothing
      // re-renders, so nothing would put the measured-away width back.
      await resize(wrapper, 200, 200);

      expect(widths(headOf(wrapper, 'name').element)).toEqual(['200px', '200px', '200px']);
    });
  });

  it('draws a resize handle only on a resizable column', () => {
    const wrapper = mountTable({
      columns: [
        { accessorKey: 'name', header: 'Name', enableResizing: true },
        { accessorKey: 'age', header: 'Age' }
      ]
    });

    expect(headOf(wrapper, 'name').find('[data-part="table-resizer"]').exists()).toBe(true);
    expect(headOf(wrapper, 'age').find('[data-part="table-resizer"]').exists()).toBe(false);
  });
});

describe('nested rows', () => {
  const NESTED: User[] = [
    {
      id: 'team',
      name: 'Team',
      age: 0,
      city: '—',
      children: [
        { id: 'c1', name: 'Child one', age: 1, city: 'A' },
        { id: 'c2', name: 'Child two', age: 2, city: 'B' }
      ]
    },
    { id: 'solo', name: 'Solo', age: 3, city: 'C' }
  ];

  const mountNested = (props: Record<string, any> = {}, slots: Record<string, any> = {}) =>
    mountTable({ data: NESTED, nestedKey: 'children', ...props }, slots);

  it('adds an expander column, pinned to the start', () => {
    const wrapper = mountNested();

    expect(wrapper.find('thead th[data-column="expander"]').attributes('data-pinned')).toBe('start');
    // Only a row with children gets a button.
    expect(wrapper.findAll('[data-part="table-expander"]')).toHaveLength(1);
  });

  it('draws an icon of the caller’s own inside the button, which still toggles', async () => {
    const wrapper = mountNested(
      {},
      {
        'expander-icon':
          '<template #expander-icon="{ expanded }"><i class="mine">{{ expanded ? "-" : "+" }}</i></template>'
      }
    );
    const button = () => wrapper.find('[data-part="table-expander"]');

    expect(button().find('svg').exists()).toBe(false);
    expect(button().find('.mine').text()).toBe('+');
    await button().trigger('click');
    expect(button().find('.mine').text()).toBe('-');
    expect(button().attributes('aria-expanded')).toBe('true');
  });

  it('tells a cell slot whether its row is nested', async () => {
    const wrapper = mountNested(
      { expanded: true },
      { 'cell-name': '<template #cell-name="{ cell, isNested }">{{ isNested ? "↳ " : "" }}{{ cell }}</template>' }
    );

    expect(wrapper.findAll('tbody td[data-column="name"]').map((cell) => cell.text())).toEqual([
      'Team',
      '↳ Child one',
      '↳ Child two',
      'Solo'
    ]);
  });

  it('opens and closes a row from its button', async () => {
    const wrapper = mountNested();
    const button = () => wrapper.find('[data-part="table-expander"]');

    expect(column(wrapper, 'name')).toEqual(['Team', 'Solo']);
    expect(button().attributes('aria-expanded')).toBe('false');

    await button().trigger('click');

    expect(column(wrapper, 'name')).toEqual(['Team', 'Child one', 'Child two', 'Solo']);
    expect(button().attributes('aria-expanded')).toBe('true');
    expect(wrapper.findAll('tbody tr')[1]!.attributes('data-depth')).toBe('1');
    expect(wrapper.findAll('tbody tr')[0]!.attributes('data-expanded')).toBe('');
  });

  it('opens a row from anywhere on it when asked, and the button does not toggle it twice', async () => {
    const wrapper = mountNested({ expandOnRowClick: true });

    await wrapper.findAll('tbody tr')[0]!.trigger('click');
    expect(column(wrapper, 'name')).toHaveLength(4);

    await wrapper.find('[data-part="table-expander"]').trigger('click');
    expect(column(wrapper, 'name')).toHaveLength(2);
  });

  it('leaves a row closed when only the row, not its button, is pressed', async () => {
    const wrapper = mountNested();

    await wrapper.findAll('tbody tr')[0]!.trigger('click');

    expect(column(wrapper, 'name')).toEqual(['Team', 'Solo']);
  });

  it('reports what is open', async () => {
    const wrapper = mountNested();

    await wrapper.find('[data-part="table-expander"]').trigger('click');

    expect(wrapper.emitted('update:expanded')![0]).toEqual([{ team: true }]);
  });
});

describe('virtual rows', () => {
  const MANY = Array.from({ length: 1000 }, (_, index) => ({
    id: `r${index}`,
    name: `Person ${index}`,
    age: index % 90,
    city: 'Somewhere'
  }));

  async function mountVirtual(props: Record<string, any> = {}, slots: Record<string, any> = {}) {
    const wrapper = mountTable({ data: MANY, virtual: 20, ...props }, slots);
    const container = wrapper.find('[data-part="table-container"]').element as HTMLElement;
    const body = wrapper.find('tbody').element as HTMLElement;

    // jsdom has no layout: a 200px viewport, and the body 30px down, under the header.
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(container, 'getBoundingClientRect', { configurable: true, value: () => ({ top: 0 }) });
    Object.defineProperty(body, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 30 - container.scrollTop })
    });
    window.dispatchEvent(new Event('resize'));
    await nextTick();

    const scrollTo = async (top: number) => {
      container.scrollTop = top;
      container.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await nextTick();
    };

    return { wrapper, scrollTo };
  }

  const drawn = (wrapper: VueWrapper<any>) => wrapper.findAll('tbody tr[data-index]');
  const spacers = (wrapper: VueWrapper<any>) =>
    wrapper.findAll('tbody [data-part="table-spacer"] td').map((td) => (td.element as HTMLElement).style.height);

  it('draws the rows near the viewport, not all thousand', async () => {
    const { wrapper } = await mountVirtual();

    expect(drawn(wrapper)).toHaveLength(19);
    expect(spacers(wrapper)).toEqual([`${(1000 - 19) * 20}px`]);
  });

  it('draws as many rows past the viewport as it is told', async () => {
    const { wrapper } = await mountVirtual({ virtual: { rowHeight: 20, overscan: 20 } });

    // 200px of 20px rows is 10, plus one partly shown, plus 20 below.
    expect(drawn(wrapper)).toHaveLength(31);
  });

  describe('reusing rows', () => {
    const NameCell = defineComponent({
      props: { name: String },
      setup(props) {
        onMounted(() => (mounts.count += 1));
        return () => h('button', props.name);
      }
    });
    const mounts = { count: 0 };
    const slots = { 'cell-name': ({ cell }: { cell: string }) => h(NameCell, { name: cell }) };
    const names = (wrapper: VueWrapper<any>) => drawn(wrapper).map((tr) => tr.find('td[data-column="name"]').text());

    it("hands a jump's rows to the elements and components already drawn", async () => {
      const { wrapper, scrollTo } = await mountVirtual({}, slots);
      // Mid-table the window is wider than at the top, overscan on both sides: draw that once.
      await scrollTo(30 + 300 * 20);
      const elements = drawn(wrapper).map((tr) => tr.element);
      mounts.count = 0;

      await scrollTo(30 + 500 * 20);

      expect(mounts.count).toBe(0);
      expect(new Set(drawn(wrapper).map((tr) => tr.element))).toEqual(new Set(elements));
      expect(names(wrapper)).toEqual(Array.from({ length: 27 }, (_, offset) => `Person ${492 + offset}`));
    });

    it('leaves the rows still in view as they are on a wheel step', async () => {
      const { wrapper, scrollTo } = await mountVirtual({}, slots);
      await scrollTo(30 + 500 * 20);
      const kept = drawn(wrapper).find((tr) => tr.attributes('data-index') === '500')!.element;
      mounts.count = 0;

      // Five rows on: five leave the top, and five come in at the bottom in their elements.
      await scrollTo(30 + 505 * 20);

      expect(mounts.count).toBe(0);
      expect(names(wrapper)[0]).toBe('Person 497');
      expect(names(wrapper).at(-1)).toBe('Person 523');
      expect(drawn(wrapper).find((tr) => tr.attributes('data-index') === '500')!.element).toBe(kept);
    });

    it('starts what a cell holds over for the row it is handed', async () => {
      const { wrapper, scrollTo } = await mountVirtual(
        {},
        {
          'cell-name': () =>
            h(Deferred, null, {
              default: () => h('button', { class: 'real' }),
              placeholder: () => h('button', { class: 'stand-in' })
            })
        }
      );
      const cell = () => drawn(wrapper)[0]!.find('td[data-column="name"]');

      // Vue drops an event stamped in the millisecond its listener was attached.
      await new Promise((resolve) => setTimeout(resolve, 5));
      await cell().find('.stand-in').trigger('pointerenter');
      expect(cell().find('.real').exists()).toBe(true);

      await scrollTo(30 + 500 * 20);
      await scrollTo(0);

      // Row 0 again, in whichever element it landed: as it was never touched.
      expect(cell().find('.stand-in').exists()).toBe(true);
      expect(wrapper.findAll('.real')).toHaveLength(0);
    });

    it('starts a part that owns its value over for the row it is handed', async () => {
      const { wrapper, scrollTo } = await mountVirtual(
        {},
        { 'cell-name': () => h(CheckboxRoot, { 'aria-label': 'Pick' }) }
      );
      const box = () => drawn(wrapper)[0]!.find('[role="checkbox"]');

      await new Promise((resolve) => setTimeout(resolve, 5));
      await box().trigger('click');
      expect(box().attributes('aria-checked')).toBe('true');

      await scrollTo(30 + 500 * 20);
      await scrollTo(0);

      expect(wrapper.findAll('[role="checkbox"][aria-checked="true"]')).toHaveLength(0);
    });

    it('keeps a row its own elements when it is not virtual', async () => {
      const wrapper = mountTable({}, slots);
      const ada = wrapper.findAll('tbody tr')[1]!.element;

      await wrapper.setProps({ data: [...USERS].reverse() });

      expect(wrapper.findAll('tbody tr')[1]!.element).toBe(ada);
      expect(wrapper.findAll('tbody tr')[0]!.text()).toContain('Alan');
    });
  });

  it('keeps each row its place in the whole table as it scrolls', async () => {
    const { wrapper, scrollTo } = await mountVirtual();

    await scrollTo(30 + 500 * 20);

    const first = drawn(wrapper)[0]!;
    // Stripes and position come from the index in the data, not in the DOM.
    expect(first.attributes('data-index')).toBe('492');
    expect(first.attributes('data-even')).toBe('');
    expect(spacers(wrapper)[0]).toBe(`${492 * 20}px`);
  });

  it('tells a screen reader how many rows there are, and where each is', async () => {
    const { wrapper, scrollTo } = await mountVirtual();
    await scrollTo(30 + 500 * 20);

    expect(wrapper.find('table').attributes('aria-rowcount')).toBe('1001');
    expect(wrapper.find('thead tr').attributes('aria-rowindex')).toBe('1');
    // After one header row, row 492 of the data is row 494 of the table.
    expect(drawn(wrapper)[0]!.attributes('aria-rowindex')).toBe('494');
  });

  it('spans the spacer across every column, and hides it', async () => {
    const { wrapper, scrollTo } = await mountVirtual();
    await scrollTo(30 + 500 * 20);

    const spacer = wrapper.find('tbody [data-part="table-spacer"]');
    expect(spacer.attributes('aria-hidden')).toBe('true');
    expect(spacer.find('td').attributes('colspan')).toBe('3');
  });

  it('measures the row height too when the object leaves it out', async () => {
    // `test/setup.ts` draws every element 32px tall.
    const { wrapper, scrollTo } = await mountVirtual({ virtual: { overscan: 20 } });
    await scrollTo(30 + 500 * 32);

    expect(drawn(wrapper)[0]!.attributes('data-index')).toBe('480');
  });

  it('takes an inline object again, new each render, without redrawing', async () => {
    const { wrapper, scrollTo } = await mountVirtual({ virtual: { rowHeight: 20 } });
    await scrollTo(30 + 500 * 20);
    const first = drawn(wrapper)[0]!;

    await wrapper.setProps({ virtual: { rowHeight: 20 } });

    expect(drawn(wrapper)[0]!.element).toBe(first.element);
    expect(drawn(wrapper)[0]!.attributes('data-index')).toBe(first.attributes('data-index'));
  });

  it('measures the row height from the first row when given only true', async () => {
    // `test/setup.ts` draws every element 32px tall.
    const { wrapper, scrollTo } = await mountVirtual({ virtual: true });
    await scrollTo(30 + 500 * 32);

    expect(drawn(wrapper)[0]!.attributes('data-index')).toBe('492');
  });

  it('follows sorting through the virtual rows', async () => {
    const { wrapper } = await mountVirtual();

    expect(drawn(wrapper)[0]!.find('td[data-column="age"]').text()).toBe('0');

    // Numbers sort largest first; the drawn slice is the top of the sorted rows.
    await headOf(wrapper, 'age').find('[data-part="table-sort"]').trigger('click');
    await nextTick();

    expect(drawn(wrapper)).toHaveLength(19);
    expect(drawn(wrapper)[0]!.find('td[data-column="age"]').text()).toBe('89');
  });

  it('draws everything, and claims no row count, when it is off', () => {
    const wrapper = mountTable({ data: MANY.slice(0, 60) });

    expect(drawn(wrapper)).toHaveLength(60);
    expect(wrapper.find('[data-part="table-spacer"]').exists()).toBe(false);
    expect(wrapper.find('table').attributes('aria-rowcount')).toBeUndefined();
    expect(drawn(wrapper)[0]!.attributes('aria-rowindex')).toBeUndefined();
  });
});

describe('sort in the URL', () => {
  // The app's route, as the Nuxt module provides it: a write navigates, and the query follows.
  function mountWithRoute(props: Record<string, any> = {}, initial: Record<string, string> = {}) {
    const query = reactive<Record<string, string | undefined>>({ ...initial });
    const set = vi.fn((key: string, value: string | undefined) => (query[key] = value));
    const wrapper = mount(DataTable as any, {
      props: { data: USERS, columns: COLUMNS, getRowId: (row: User) => row.id, ...props },
      global: { provide: { [routeQueryKey as symbol]: { get: (key: string) => query[key], set } } },
      attachTo: document.body
    });
    return { wrapper, query, set };
  }
  const sortOf = (wrapper: VueWrapper<any>, id: string) => headOf(wrapper, id).attributes('aria-sort');
  const press = (wrapper: VueWrapper<any>, id: string) =>
    headOf(wrapper, id).find('[data-part="table-sort"]').trigger('click');

  it('with manual sorting, starts from ?sortBy= and writes each change back', async () => {
    const { wrapper, set } = mountWithRoute({ manualSorting: true }, { sortBy: 'name:desc' });
    expect(sortOf(wrapper, 'name')).toBe('descending');

    await press(wrapper, 'age');
    expect(set).toHaveBeenLastCalledWith('sortBy', 'age:desc');
    expect(sortOf(wrapper, 'age')).toBe('descending');
    expect(wrapper.emitted('update:sorting')![0]).toEqual([[{ id: 'age', desc: true }]]);
  });

  it('follows the URL as it changes, back and forward included', async () => {
    const { wrapper, query } = mountWithRoute({ manualSorting: true });
    query.sortBy = 'name:asc';
    await nextTick();
    expect(sortOf(wrapper, 'name')).toBe('ascending');
  });

  it('starts from default-sort while the URL has none, and clears the key when the sort is', async () => {
    const { wrapper, set } = mountWithRoute({ manualSorting: true, defaultSort: 'name:desc' });
    expect(sortOf(wrapper, 'name')).toBe('descending');

    await press(wrapper, 'name');
    expect(set).toHaveBeenLastCalledWith('sortBy', undefined);
  });

  it('takes another key, or none, and opts client sorting in', async () => {
    const own = mountWithRoute({ manualSorting: true, sortQuery: 'sortBy:orders' }, { 'sortBy:orders': 'age:asc' });
    expect(sortOf(own.wrapper, 'age')).toBe('ascending');
    own.wrapper.unmount();

    const off = mountWithRoute({ manualSorting: true, sortQuery: false }, { sortBy: 'age:asc' });
    expect(sortOf(off.wrapper, 'age')).toBe('none');
    await press(off.wrapper, 'name');
    expect(off.set).not.toHaveBeenCalled();
    off.wrapper.unmount();

    const client = mountWithRoute({ sortQuery: 'sortBy' }, { sortBy: 'name:asc' });
    expect(column(client.wrapper, 'name')).toEqual(['Ada', 'Alan', 'Grace']);
  });

  it('leaves the URL alone without manual sorting, or with a bound sort', async () => {
    const client = mountWithRoute({}, { sortBy: 'age:asc' });
    expect(sortOf(client.wrapper, 'age')).toBe('none');
    await press(client.wrapper, 'name');
    expect(client.set).not.toHaveBeenCalled();
    client.wrapper.unmount();

    const bound = mountWithRoute({ manualSorting: true, sorting: [] }, { sortBy: 'age:asc' });
    expect(sortOf(bound.wrapper, 'age')).toBe('none');
    await press(bound.wrapper, 'name');
    expect(bound.set).not.toHaveBeenCalled();
  });
});

describe('formatSort', () => {
  it('writes what parseSort reads', () => {
    expect(
      formatSort([
        { id: 'a', desc: false },
        { id: 'b', desc: true }
      ])
    ).toBe('a:asc,b:desc');
    expect(parseSort(formatSort([{ id: 'company_name', desc: true }]))).toEqual([{ id: 'company_name', desc: true }]);
    expect(formatSort([])).toBe('');
  });
});

describe('parseSort', () => {
  it('reads columns, directions and lists', () => {
    expect(parseSort('company_name:asc')).toEqual([{ id: 'company_name', desc: false }]);
    expect(parseSort('a:DESC, b')).toEqual([
      { id: 'a', desc: true },
      { id: 'b', desc: false }
    ]);
    // Only a direction after the last `:` is one.
    expect(parseSort('meta:created')).toEqual([{ id: 'meta:created', desc: false }]);
    expect(parseSort('meta:created:desc')).toEqual([{ id: 'meta:created', desc: true }]);
    expect(parseSort('')).toEqual([]);
    expect(parseSort(undefined)).toEqual([]);
  });
});

<script lang="ts">
import {
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type CellContext,
  type Column,
  type ColumnDef,
  type ColumnHelper,
  type Row,
  type RowData,
  type SortingState
} from '@tanstack/vue-table';
import { defineComponent } from 'vue';
import { provideRecycle } from '../../shared/recycle';

export interface DataTableColumnMeta {
  /** On every cell of the column: head, body and foot. */
  class?: string;
  /** On its head cell. */
  thClass?: string;
  /** On its body cells, or worked out per cell. */
  tdClass?: string | ((context: CellContext<any, any, any>) => string | undefined);
  /** On its foot cell. */
  tfClass?: string;
  /** Whether it shows at first, before `columnVisibility` says otherwise. */
  show?: boolean;
  /** Pins it to an edge at first, before `columnPinning` says otherwise. */
  pin?: 'start' | 'end';
}

export const dataTableFeatures = tableFeatures({
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic, datetime: sortFn_datetime },
  columnMeta: {} as DataTableColumnMeta
});

export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;
export type DataTableColumnHelper<TData extends RowData> = ColumnHelper<DataTableFeatures, TData>;

export const EXPANDER_COLUMN = 'expander';

export interface DataTableCellSlotProps<TData, TValue = unknown> {
  cell: TValue;
  row: TData;
  depth: number;
  isNested: boolean;
  expanded: boolean;
}

export interface DataTableHeadSlotProps<TData extends RowData> {
  column: Column<DataTableFeatures, TData, unknown>;
  getValues: () => unknown[];
}

// Typed per key for the row's own fields; any other column id (a nested accessor, a display
// column) falls back to `unknown`. Where several halves match a name Vue reads the last one, so
// they run from loosest to most specific; the bare `#<id>` (the old name) is the loosest of all.
export type DataTableSlots<TData extends RowData> = {
  [name: string]: (props: DataTableCellSlotProps<TData>) => any;
} & {
  [name: `cell-${string}`]: (props: DataTableCellSlotProps<TData>) => any;
  [name: `head-${string}`]: (
    props: Partial<Pick<DataTableHeadSlotProps<TData>, 'column'>> & Pick<DataTableHeadSlotProps<TData>, 'getValues'>
  ) => any;
  [name: `foot-${string}`]: (props: DataTableHeadSlotProps<TData>) => any;
  [name: `sort-${string}`]: (props: { direction: false | 'asc' | 'desc' }) => any;
  sort?: (props: { direction: false | 'asc' | 'desc' }) => any;
  expander?: (props: { row: Row<DataTableFeatures, TData>; expanded: boolean; toggle: () => void }) => any;
  'expander-icon'?: (props: { expanded: boolean }) => any;
  empty?: () => any;
} & {
  [K in keyof TData & string as `cell-${K}`]?: (props: DataTableCellSlotProps<TData, TData[K]>) => any;
} & {
  /** @deprecated The old name for `#cell-<id>`. */
  [K in Exclude<keyof TData & string, 'sort' | 'expander' | 'expander-icon' | 'empty'>]?: (
    props: DataTableCellSlotProps<TData, TData[K]>
  ) => any;
};

// Around each body row: what it is drawn for, which a virtual table changes in place.
const RowScope = defineComponent({
  props: { item: { type: null, required: true } },
  setup(props, { slots }) {
    provideRecycle(() => props.item);
    return () => slots.default?.();
  }
});

/** A sort: `'name:asc'`, `'name:desc'`, or `'name'` for ascending, several joined by `,`; or TanStack's `[{ id, desc }]`. */
export type DataTableSort = string | SortingState;

/** `virtual` in full. Every field is optional. */
export interface DataTableVirtual {
  /** Every row's height, in pixels. Left out, it is measured from the first row. */
  rowHeight?: number;
  /** Rows drawn past each edge of the viewport. Fewer mount less at once as it scrolls. @default 8 */
  overscan?: number;
}

export function parseSort(input: DataTableSort | undefined): SortingState {
  if (input === undefined) return [];
  if (typeof input !== 'string') return input;

  return input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      // The last `:`, and only a direction after it: a column id may hold one too.
      const at = part.lastIndexOf(':');
      const direction =
        at === -1
          ? ''
          : part
              .slice(at + 1)
              .trim()
              .toLowerCase();
      const known = direction === 'asc' || direction === 'desc';
      return { id: known ? part.slice(0, at).trim() : part, desc: direction === 'desc' };
    });
}

/** A sort as `parseSort` reads it: `'name:asc,age:desc'`. */
export function formatSort(sorting: SortingState): string {
  return sorting.map(({ id, desc }) => `${id}:${desc ? 'desc' : 'asc'}`).join(',');
}
</script>

<script setup lang="ts" generic="TData extends RowData">
import { computed, inject, onMounted, ref, watch, type HTMLAttributes } from 'vue';
import {
  FlexRender,
  useTable,
  type Cell,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type Header,
  type Updater,
  type ColumnVisibilityState as VisibilityState
} from '@tanstack/vue-table';
import { useControlled } from '../../shared/use-controlled';
import { routeQueryKey } from '../../shared/route-query';
import { useVirtualList } from '../../composables/use-virtual-list';
import TableRoot, { type TableSticky } from '../table/TableRoot.vue';
import TableHeader from '../table/TableHeader.vue';
import TableBody from '../table/TableBody.vue';
import TableFooter from '../table/TableFooter.vue';
import TableRow from '../table/TableRow.vue';
import TableHeadCell from '../table/TableHeadCell.vue';
import TableCell from '../table/TableCell.vue';

defineOptions({ name: 'DataTable', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The rows. */
    data: TData[];
    /** The columns, as TanStack Table column definitions, or a function building them from a column helper. */
    columns: DataTableColumn<TData>[] | ((helper: DataTableColumnHelper<TData>) => DataTableColumn<TData>[]);
    /** Stable row keys. Without it a row is keyed by its data object, which a refetch replaces. */
    getRowId?: (row: TData, index: number, parent?: Row<DataTableFeatures, TData>) => string;
    /** The key holding a row's children, which makes rows expandable. */
    nestedKey?: keyof TData;
    /** A press anywhere on an expandable row toggles it. */
    expandOnRowClick?: boolean;
    /** Extra attributes for each `<tr>`, from its row. */
    rowAttrs?: (row: TData) => Record<string, unknown> | undefined;
    /** Whether a column can be sorted from its header, unless its definition says otherwise. @default true */
    enableSorting?: boolean;
    /** The data arrives sorted, by a server, so only the sort state changes. */
    manualSorting?: boolean;
    /** Marks the container `data-striped`, for a stylesheet to tint every other row. */
    striped?: boolean;
    /** A class for the `<table>`; `class` lands on the scrolling container around it. */
    tableClass?: HTMLAttributes['class'];
    /** A class for the `<thead>`. */
    headerClass?: HTMLAttributes['class'];
    /** A class for the `<tbody>`. */
    bodyClass?: HTMLAttributes['class'];
    /** A class for the `<tfoot>`. */
    footerClass?: HTMLAttributes['class'];
    /** A class for every body row. `row-attrs` gives one per row. */
    rowClass?: HTMLAttributes['class'];
    /** A class for every head cell, beside its column's `meta.thClass`. */
    thClass?: HTMLAttributes['class'];
    /** A class for every body cell, beside its column's `meta.tdClass`. */
    tdClass?: HTMLAttributes['class'];
    /** A class for every foot cell, beside its column's `meta.tfClass`. */
    tfClass?: HTMLAttributes['class'];
    /**
     * Keeps the sort in the URL under this query key, as `name:asc`, where the app
     * provides its route (the Nuxt module does). `sortBy` with `manual-sorting`;
     * `false` turns it off. A bound `v-model:sorting` leaves the URL alone.
     */
    sortQuery?: string | false;
    /** Sticks the header to the top; a number keeps it that many pixels below. */
    stickyHeader?: TableSticky;
    /** Sticks the footer to the bottom; a number keeps it that many pixels above. */
    stickyFooter?: TableSticky;
    /**
     * Draw only the rows near the viewport. Every row must be one height: `true`
     * measures the first row; a number is that height (bound: `:virtual="40"`); an
     * object sets the rest too. It follows whatever scrolls: the table, given a
     * height, or else the page or a scrolling ancestor.
     */
    virtual?: boolean | number | DataTableVirtual;

    /** The sort, as `[{ id, desc }]`, bound with `v-model:sorting`. */
    sorting?: SortingState;
    /** The sort at first, when no `v-model:sorting` owns it: `'name:asc'`, `'name:desc'`, several joined by `,`. */
    defaultSort?: DataTableSort;
    /** The expanded rows, by id (or `true` for all), bound with `v-model:expanded`. */
    expanded?: ExpandedState;
    /** The columns shown, as `{ [id]: boolean }`, bound with `v-model:column-visibility`. */
    columnVisibility?: VisibilityState;
    /** The pinned columns, as `{ start: ids, end: ids }`, bound with `v-model:column-pinning`. */
    columnPinning?: ColumnPinningState;
    /** Column widths set by resizing, as `{ [id]: px }`, bound with `v-model:column-sizing`. */
    columnSizing?: ColumnSizingState;
  }>(),
  { enableSorting: undefined, sortQuery: undefined, virtual: undefined }
);

const emit = defineEmits<{
  /** The sort changed, from a header press. */
  'update:sorting': [value: SortingState];
  /** A row was expanded or collapsed. */
  'update:expanded': [value: ExpandedState];
  /** A column was shown or hidden. */
  'update:columnVisibility': [value: VisibilityState];
  /** A column was pinned or unpinned. */
  'update:columnPinning': [value: ColumnPinningState];
  /** A column was resized. */
  'update:columnSizing': [value: ColumnSizingState];
}>();

const slots = defineSlots<DataTableSlots<TData>>();

const columns = computed<DataTableColumn<TData>[]>(() => {
  const own =
    typeof props.columns === 'function' ? props.columns(createColumnHelper<DataTableFeatures, TData>()) : props.columns;

  if (!props.nestedKey) return own;

  const expander: DataTableColumn<TData> = {
    id: EXPANDER_COLUMN,
    size: 40,
    enableSorting: false,
    enableResizing: false,
    enableHiding: false,
    // Not `''`: an empty text node renders as nothing on the server, so the
    // client would hydrate one that isn't there.
    header: () => null
  };
  return [expander, ...own];
});

/** Every leaf column, flattened out of any groups. */
const leaves = computed(() => {
  const out: DataTableColumn<TData>[] = [];
  const walk = (list: DataTableColumn<TData>[]) => {
    for (const column of list) {
      const children = (column as { columns?: DataTableColumn<TData>[] }).columns;
      if (children) walk(children);
      else out.push(column);
    }
  };
  walk(columns.value);
  return out;
});

const idOf = (column: DataTableColumn<TData>) =>
  column.id ?? ((column as { accessorKey?: string }).accessorKey as string);

/** Each slice of state is a `v-model`, owned by the caller or kept here. */
function slice<T>(name: string, value: () => T | undefined, fallback: () => T, change: (next: T) => void) {
  const state = useControlled<T>({ value, defaultValue: fallback, onChange: change, name: 'DataTable', label: name });
  return {
    state,
    update: (updater: Updater<T>) => {
      state.value = typeof updater === 'function' ? (updater as (old: T) => T)(state.value) : updater;
    }
  };
}

// The sort in the URL, unless the caller binds it: read from the query, written back on a change.
const routeQuery = inject(routeQueryKey, null);
const queryKey = () =>
  props.sortQuery === false ? null : (props.sortQuery ?? (props.manualSorting ? 'sortBy' : null));
const inRoute = () => routeQuery !== null && queryKey() !== null && props.sorting === undefined;

const sorting = slice<SortingState>(
  'sorting',
  () => props.sorting ?? (inRoute() ? parseSort(routeQuery!.get(queryKey()!) ?? props.defaultSort) : undefined),
  () => parseSort(props.defaultSort),
  (next) => {
    emit('update:sorting', next);
    if (inRoute()) routeQuery!.set(queryKey()!, next.length > 0 ? formatSort(next) : undefined);
  }
);
const expanded = slice<ExpandedState>(
  'expanded',
  () => props.expanded,
  () => ({}),
  (next) => emit('update:expanded', next)
);
const sizing = slice<ColumnSizingState>(
  'columnSizing',
  () => props.columnSizing,
  () => ({}),
  (next) => emit('update:columnSizing', next)
);

const floors = new Map<string, number>();

const byColumn = (columnId: string) => `[data-column="${columnId.replace(/["\\]/g, '\\$&')}"]`;

// The narrowest the column's header can be drawn. With its width at 0 every cell of it collapses,
// the body and foot ones clipping, so a long value doesn't hold the column wide; the header is
// let out to its content.
function floorOf(container: HTMLElement, columnId: string): number | undefined {
  const heads = Array.from(container.querySelectorAll<HTMLElement>(`thead th${byColumn(columnId)}`));
  const head = heads.at(-1);
  if (!head) return undefined;

  const name = widthVar(columnId);
  const width = container.style.getPropertyValue(name);
  const saved = heads.map((cell) => cell.style.cssText);
  container.style.setProperty(name, '0px');
  for (const cell of heads) {
    cell.style.minWidth = '0px';
    cell.style.maxWidth = 'none';
  }
  const floor = Math.ceil(head.getBoundingClientRect().width);
  heads.forEach((cell, index) => (cell.style.cssText = saved[index]!));
  container.style.setProperty(name, width);
  return floor;
}

function measureFloor(event: Event, columnId: string): void {
  const container = (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-part="table-container"]');
  const floor = container ? floorOf(container, columnId) : undefined;
  if (floor !== undefined) floors.set(columnId, floor);
}

function onResizeStart(event: MouseEvent | TouchEvent, header: Header<DataTableFeatures, TData, unknown>): void {
  measureFloor(event, header.column.id);
  header.getResizeHandler()(event);
}

function updateSizing(updater: Updater<ColumnSizingState>): void {
  sizing.update((old) => {
    const next = typeof updater === 'function' ? updater(old) : updater;
    const clamped = { ...next };
    for (const [id, floor] of floors) {
      if (clamped[id] !== undefined && clamped[id]! < floor) clamped[id] = floor;
    }
    return clamped;
  });
}

const visibility = slice<VisibilityState>(
  'columnVisibility',
  () => props.columnVisibility,
  () => ({}),
  (next) => emit('update:columnVisibility', next)
);

const visibilityState = computed<VisibilityState>(() => {
  const defaults: VisibilityState = {};
  for (const column of leaves.value) {
    if (column.meta?.show !== undefined) defaults[idOf(column)] = column.meta.show;
  }
  return { ...defaults, ...visibility.state.value };
});

const pinning = slice<ColumnPinningState>(
  'columnPinning',
  () => props.columnPinning,
  () => ({
    start: [
      ...(props.nestedKey ? [EXPANDER_COLUMN] : []),
      ...leaves.value.filter((c) => c.meta?.pin === 'start').map(idOf)
    ],
    end: leaves.value.filter((c) => c.meta?.pin === 'end').map(idOf)
  }),
  (next) => emit('update:columnPinning', next)
);

// Without getRowId a row is keyed by its data object, not its position, so a
// filter or a sort moves each row's DOM (and the state inside it) with the row.
const objectIds = new WeakMap<object, string>();
let nextObjectId = 0;
function objectId(row: TData, index: number, parent?: Row<DataTableFeatures, TData>): string {
  if (typeof row !== 'object' || row === null) return parent ? `${parent.id}.${index}` : String(index);
  let id = objectIds.get(row);
  if (id === undefined) objectIds.set(row, (id = `row-${nextObjectId++}`));
  return id;
}

const table = useTable({
  features: dataTableFeatures,
  get data() {
    return props.data;
  },
  get columns() {
    return columns.value;
  },
  get getRowId() {
    return props.getRowId ?? objectId;
  },
  getSubRows: (row: TData) => (props.nestedKey ? (row[props.nestedKey] as TData[] | undefined) : undefined),
  get defaultColumn() {
    return { enableResizing: false, enableSorting: props.enableSorting, size: undefined };
  },
  get manualSorting() {
    return props.manualSorting;
  },
  columnResizeMode: 'onChange',
  state: {
    get sorting() {
      return sorting.state.value;
    },
    get expanded() {
      return expanded.state.value;
    },
    get columnVisibility() {
      return visibilityState.value;
    },
    get columnPinning() {
      return pinning.state.value;
    },
    get columnSizing() {
      return sizing.state.value;
    }
  },
  onSortingChange: sorting.update,
  onExpandedChange: expanded.update,
  onColumnVisibilityChange: visibility.update,
  onColumnPinningChange: pinning.update,
  onColumnSizingChange: updateSizing
});

type AnyColumn = Column<DataTableFeatures, TData, unknown>;

const rows = computed(() => table.getRowModel().rows);

const startEdge = computed(() => table.getStartVisibleLeafColumns().at(-1)?.id);
const endEdge = computed(() => table.getEndVisibleLeafColumns()[0]?.id);

const isSized = (column: AnyColumn) =>
  column.columnDef.size !== undefined || column.getCanResize() || column.getIsPinned() !== false;

// Each sized column's width, once, on the container as `--dt-col-<n>`: n is its place among the
// leaf columns, as an id may hold what a custom property name can't. Its cells all read it, so a
// resize rewrites one value rather than every cell's style.
const columnIndex = computed(() => new Map(table.getAllLeafColumns().map((column, index) => [column.id, index])));
const widthVar = (columnId: string) => `--dt-col-${columnIndex.value.get(columnId)}`;
const widthVars = computed(() => {
  const vars: Record<string, string> = {};
  for (const column of table.getAllLeafColumns()) {
    if (isSized(column)) vars[widthVar(column.id)] = `${column.getSize()}px`;
  }
  return vars;
});

function pinOf(column: AnyColumn) {
  const pinned = column.getIsPinned();
  if (!pinned) return {};
  return {
    pinned,
    offset: pinned === 'start' ? column.getStart('start') : column.getAfter('end'),
    'data-pinned-edge': (pinned === 'start' ? startEdge.value : endEdge.value) === column.id ? '' : undefined
  };
}

function columnProps(column: AnyColumn) {
  return { 'data-column': column.id, ...pinOf(column) };
}

// Every cell of a column with a width holds it, so content wider than the column is clipped rather than widening it.
function sizedProps(column: AnyColumn) {
  return { ...columnProps(column), width: isSized(column) ? `var(${widthVar(column.id)})` : undefined };
}

const sortOf = (header: Header<DataTableFeatures, TData, unknown>) =>
  header.isPlaceholder || !header.column.getCanSort() ? undefined : header.column.getIsSorted() || false;

const metaTdClass = (cell: Cell<DataTableFeatures, TData, unknown>) => {
  const value = cell.column.columnDef.meta?.tdClass;
  return typeof value === 'function' ? value(cell.getContext() as CellContext<any, any, any>) : value;
};

const getValues = (columnId: string) => () => table.getPreExpandedRowModel().rows.map((row) => row.getValue(columnId));

// `#<id>` is the old name for `#cell-<id>`, kept for apps moving over. Typed as the
// new name so the bare one doesn't widen every other slot's props to a cell's.
const cellSlot = (columnId: string) => (slots[columnId] ? columnId : `cell-${columnId}`) as `cell-${string}`;

const hasFooter = computed(() =>
  leaves.value.some((column) => column.footer !== undefined || slots[`foot-${idOf(column)}`])
);

const leafCount = computed(() => table.getVisibleLeafColumns().length);

const root = ref<{ $el: HTMLElement } | null>(null);

// A column given less than its header needs grows to the header, so it is drawn at the width
// the table holds for it (a pinned column's neighbors are offset by that width). Wider body
// content doesn't grow it: it is clipped. Again as rows change, for a header that shows them.
function fitToHeaders(): void {
  const container = root.value?.$el;
  if (!container) return;

  const grown: ColumnSizingState = {};
  for (const column of table.getVisibleLeafColumns()) {
    if (!isSized(column)) continue;
    const floor = floorOf(container, column.id);
    if (floor !== undefined && floor > column.getSize()) grown[column.id] = floor;
  }
  if (Object.keys(grown).length) sizing.state.value = { ...sizing.state.value, ...grown };
}

onMounted(fitToHeaders);
watch(rows, fitToHeaders, { flush: 'post' });

const body = ref<{ $el: HTMLElement } | null>(null);
const measured = ref<number>();

// Read apart, so an inline `:virtual="{ … }"`, new on each render, changes nothing that didn't.
const virtualOption = <K extends keyof DataTableVirtual>(key: K): DataTableVirtual[K] =>
  typeof props.virtual === 'object' ? props.virtual[key] : undefined;
const isVirtual = computed(() => Boolean(props.virtual));
const fixedRowHeight = computed(() => (typeof props.virtual === 'number' ? props.virtual : virtualOption('rowHeight')));
const overscan = computed(() => virtualOption('overscan') ?? 8);

function measureRow(): void {
  if (!isVirtual.value || fixedRowHeight.value !== undefined || measured.value) return;
  const row = body.value?.$el.querySelector<HTMLElement>('tr[data-index]');
  if (row?.offsetHeight) measured.value = row.offsetHeight;
}

const rowHeight = computed(() => fixedRowHeight.value ?? measured.value ?? 34);

const virtual = useVirtualList({
  items: rows,
  itemHeight: rowHeight,
  enabled: isVirtual,
  overscan,
  scroller: computed(() => root.value?.$el),
  list: computed(() => body.value?.$el)
});

// Virtual rows are keyed by a slot, not their id. A row still in view keeps its slot; one
// scrolled in takes the slot of one scrolled out, so its cells update in place rather than a
// new row of components being built and the old one dropped. Parts reset what they held for
// the old row (`onRecycle`).
let slotOf = new Map<string, number>();
let slotCount = 0;
const rowSlots = computed(() => {
  const ids = isVirtual.value ? virtual.visible.value.map((row) => row.id) : [];
  const shown = new Set(ids);
  const free = [...slotOf].filter(([id]) => !shown.has(id)).map(([, slot]) => slot);
  const next = new Map<string, number>();
  for (const id of ids) next.set(id, slotOf.get(id) ?? free.pop() ?? slotCount++);
  slotOf = next;
  return next;
});
const rowKey = (row: Row<DataTableFeatures, TData>) => rowSlots.value.get(row.id) ?? row.id;

onMounted(measureRow);
watch(() => virtual.visible.value.length, measureRow, { flush: 'post' });

const headerRows = computed(() => table.getHeaderGroups().length);

function onRowClick(row: Row<DataTableFeatures, TData>) {
  if (props.expandOnRowClick && row.getCanExpand()) row.toggleExpanded();
}

defineExpose({ table });
</script>

<template>
  <TableRoot
    ref="root"
    data-table="data"
    :sticky-header="props.stickyHeader"
    :sticky-footer="props.stickyFooter"
    :row-count="isVirtual ? headerRows + rows.length : undefined"
    :style="widthVars"
    :data-striped="props.striped ? '' : undefined"
    :table-class="props.tableClass"
    v-bind="$attrs"
  >
    <TableHeader :class="props.headerClass">
      <TableRow
        v-for="(group, level) in table.getHeaderGroups()"
        :key="group.id"
        :aria-rowindex="isVirtual ? level + 1 : undefined"
      >
        <TableHeadCell
          v-for="header in group.headers"
          :key="header.id"
          :colspan="header.colSpan > 1 ? header.colSpan : undefined"
          :sort="sortOf(header)"
          v-bind="sizedProps(header.column)"
          :data-resizing="header.column.getIsResizing() || undefined"
          :class="[props.thClass, header.column.columnDef.meta?.class, header.column.columnDef.meta?.thClass]"
        >
          <template v-if="!header.isPlaceholder">
            <button
              v-if="header.column.getCanSort()"
              type="button"
              data-part="table-sort"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <slot
                :name="`head-${header.column.id}`"
                :column="header.column"
                :get-values="getValues(header.column.id)"
              >
                <slot :name="`head-${header.column.id}-start`" :get-values="getValues(header.column.id)" />

                <!-- An empty string renders no text node on the server, which breaks hydration. -->
                <FlexRender
                  v-if="header.column.columnDef.header !== ''"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />

                <slot :name="`head-${header.column.id}-end`" :get-values="getValues(header.column.id)" />
              </slot>

              <slot :name="`sort-${header.column.id}`" :direction="header.column.getIsSorted()">
                <slot name="sort" :direction="header.column.getIsSorted()">
                  <svg
                    data-part="table-sort-icon"
                    :data-direction="header.column.getIsSorted() || undefined"
                    viewBox="0 0 16 30"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3.5"
                    aria-hidden="true"
                  >
                    <path d="M2 21L8 27L14 21" :data-active="header.column.getIsSorted() === 'desc' || undefined" />
                    <path d="M2 9L8 3L14 9" :data-active="header.column.getIsSorted() === 'asc' || undefined" />
                  </svg>
                </slot>
              </slot>
            </button>

            <slot
              v-else
              :name="`head-${header.column.id}`"
              :column="header.column"
              :get-values="getValues(header.column.id)"
            >
              <slot :name="`head-${header.column.id}-start`" :get-values="getValues(header.column.id)" />

              <FlexRender
                v-if="header.column.columnDef.header !== ''"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />

              <slot :name="`head-${header.column.id}-end`" :get-values="getValues(header.column.id)" />
            </slot>

            <div
              v-if="header.column.getCanResize()"
              data-part="table-resizer"
              :data-resizing="header.column.getIsResizing() || undefined"
              aria-hidden="true"
              @mousedown="onResizeStart($event, header)"
              @touchstart="onResizeStart($event, header)"
              @dblclick="header.column.resetSize()"
            />
          </template>
        </TableHeadCell>
      </TableRow>
    </TableHeader>

    <TableBody ref="body" :class="props.bodyClass">
      <tr v-if="virtual.before.value" data-part="table-spacer" aria-hidden="true">
        <td :colspan="leafCount" :style="{ height: `${virtual.before.value}px`, padding: 0, border: 0 }" />
      </tr>

      <RowScope v-for="(row, offset) in virtual.visible.value" :key="rowKey(row)" :item="row.id">
        <TableRow
          :index="virtual.start.value + offset"
          :aria-rowindex="isVirtual ? headerRows + virtual.start.value + offset + 1 : undefined"
          :expanded="row.getIsExpanded()"
          :data-depth="row.depth || undefined"
          :style="row.depth ? { '--depth': row.depth } : undefined"
          :class="props.rowClass"
          v-bind="props.rowAttrs?.(row.original)"
          @click="onRowClick(row)"
        >
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.column.id"
            v-bind="sizedProps(cell.column)"
            :class="[props.tdClass, cell.column.columnDef.meta?.class, metaTdClass(cell)]"
          >
            <template v-if="cell.column.id === EXPANDER_COLUMN">
              <slot name="expander" :row="row" :expanded="row.getIsExpanded()" :toggle="() => row.toggleExpanded()">
                <button
                  v-if="row.getCanExpand()"
                  type="button"
                  data-part="table-expander"
                  :data-expanded="row.getIsExpanded() || undefined"
                  :aria-expanded="row.getIsExpanded()"
                  :aria-label="row.getIsExpanded() ? 'Collapse row' : 'Expand row'"
                  @click.stop="row.toggleExpanded()"
                >
                  <slot name="expander-icon" :expanded="row.getIsExpanded()">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" />
                    </svg>
                  </slot>
                </button>
              </slot>
            </template>

            <slot
              v-else
              :name="cellSlot(cell.column.id)"
              :cell="cell.getValue()"
              :row="row.original"
              :depth="row.depth"
              :is-nested="row.depth > 0"
              :expanded="row.getIsExpanded()"
            >
              <FlexRender
                v-if="cell.column.columnDef.cell !== ''"
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </slot>
          </TableCell>
        </TableRow>
      </RowScope>

      <tr v-if="virtual.after.value" data-part="table-spacer" aria-hidden="true">
        <td :colspan="leafCount" :style="{ height: `${virtual.after.value}px`, padding: 0, border: 0 }" />
      </tr>

      <TableRow v-if="!rows.length && $slots.empty" data-empty>
        <TableCell :colspan="leafCount"><slot name="empty" /></TableCell>
      </TableRow>
    </TableBody>

    <TableFooter v-if="hasFooter" :class="props.footerClass">
      <template v-for="group in table.getFooterGroups()" :key="group.id">
        <TableRow
          v-if="
            group.headers.some(
              (h) => !h.isPlaceholder && (h.column.columnDef.footer !== undefined || $slots[`foot-${h.column.id}`])
            )
          "
        >
          <TableCell
            v-for="header in group.headers"
            :key="header.id"
            :colspan="header.colSpan > 1 ? header.colSpan : undefined"
            v-bind="sizedProps(header.column)"
            :class="[props.tfClass, header.column.columnDef.meta?.class, header.column.columnDef.meta?.tfClass]"
          >
            <slot
              v-if="!header.isPlaceholder"
              :name="`foot-${header.column.id}`"
              :column="header.column"
              :get-values="getValues(header.column.id)"
            >
              <FlexRender
                v-if="header.column.columnDef.footer !== ''"
                :render="header.column.columnDef.footer"
                :props="header.getContext()"
              />
            </slot>
          </TableCell>
        </TableRow>
      </template>
    </TableFooter>
  </TableRoot>
</template>

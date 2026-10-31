<script setup lang="ts" generic="TData extends RowData">
import { computed, ref, type HTMLAttributes } from 'vue';
import type {
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  Row,
  RowData,
  SortingState,
  Table,
  ColumnVisibilityState as VisibilityState
} from '@tanstack/vue-table';
import type { TableSticky } from '@vunset/vue';
import {
  DataTable,
  type DataTableColumn,
  type DataTableColumnHelper,
  type DataTableFeatures,
  type DataTableSlots,
  type DataTableSort,
  type DataTableVirtual
} from '@vunset/vue/data-table';

defineOptions({ name: 'AppDataTable', inheritAttrs: false });

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
    /** Keeps the sort in the URL under this query key (the Nuxt module provides the route). `sortBy` with `manual-sorting`; `false` turns it off. */
    sortQuery?: string | false;
    /** Sticks the header to the top; a number keeps it that many pixels below. */
    stickyHeader?: TableSticky;
    /** Sticks the footer to the bottom; a number keeps it that many pixels above. */
    stickyFooter?: TableSticky;
    /**
     * Draw only the rows near the viewport, all one height: `true` measures the first row; a
     * number is that height (bound: `:virtual="40"`); `{ rowHeight, overscan }` sets both.
     * Follows the table's own scroll, or the page's.
     */
    virtual?: boolean | number | DataTableVirtual;
    /** Shown across the table when there are no rows; the `#empty` slot replaces it. */
    emptyText?: string;
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
  {
    enableSorting: undefined,
    sortQuery: undefined,
    stickyHeader: undefined,
    stickyFooter: undefined,
    virtual: undefined,
    emptyText: 'Nothing to show'
  }
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

// The caller's per-column slots go straight through; these three draw ui's own by default.
const OWN = new Set(['sort', 'expander-icon', 'empty']);
const forwarded = computed(
  () => Object.keys(slots).filter((name) => !OWN.has(name)) as (keyof DataTableSlots<TData> & string)[]
);

const passed = computed(() => {
  const { emptyText: _, ...rest } = props;
  return rest;
});

const inner = ref<{ table: Table<DataTableFeatures, TData> } | null>(null);

defineExpose({ table: computed(() => inner.value?.table) });
</script>

<template>
  <DataTable
    ref="inner"
    v-bind="{ ...passed, ...$attrs }"
    :class="['app-table', 'app-data-table']"
    @update:sorting="emit('update:sorting', $event)"
    @update:expanded="emit('update:expanded', $event)"
    @update:column-visibility="emit('update:columnVisibility', $event)"
    @update:column-pinning="emit('update:columnPinning', $event)"
    @update:column-sizing="emit('update:columnSizing', $event)"
  >
    <template v-for="name in forwarded" #[name]="scope">
      <slot :name="name" v-bind="scope ?? {}" />
    </template>

    <template v-if="slots['sort']" #sort="{ direction }">
      <slot name="sort" :direction />
    </template>

    <template v-if="slots['expander-icon']" #expander-icon="{ expanded }">
      <slot name="expander-icon" :expanded />
    </template>

    <template #empty>
      <slot name="empty">
        <p class="app-data-table-empty">{{ emptyText }}</p>
      </slot>
    </template>
  </DataTable>
</template>

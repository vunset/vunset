// A subpath of its own, so an app without the optional `@tanstack/vue-table` peer never resolves it.
export {
  default as DataTable,
  dataTableFeatures,
  EXPANDER_COLUMN,
  parseSort,
  formatSort,
  type DataTableColumn,
  type DataTableSort,
  type DataTableVirtual,
  type DataTableColumnHelper,
  type DataTableColumnMeta,
  type DataTableSlots,
  type DataTableCellSlotProps,
  type DataTableHeadSlotProps,
  type DataTableFeatures
} from './components/data-table/DataTable.vue';

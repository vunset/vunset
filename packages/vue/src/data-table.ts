// A table over a data model, drawn with the `Table*` parts. A subpath of its own
// so that `@tanstack/vue-table`, an optional peer, is never resolved by an app
// that renders none.
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

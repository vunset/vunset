// AppDataTable, apart from the main entry so that `@tanstack/vue-table`, an
// optional peer, is never resolved by an app that renders none. The column
// types and helpers come along, so an app imports the table from one place.
export { default as AppDataTable } from './app/AppDataTable.vue';
export {
  dataTableFeatures,
  EXPANDER_COLUMN,
  parseSort,
  formatSort,
  type DataTableColumn,
  type DataTableSort,
  type DataTableVirtual,
  type DataTableColumnHelper,
  type DataTableColumnMeta,
  type DataTableFeatures
} from '@vunset/vue/data-table';

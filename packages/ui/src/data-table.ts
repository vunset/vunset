// Its own entry, so an app rendering no table never resolves the optional `@tanstack/vue-table`.
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

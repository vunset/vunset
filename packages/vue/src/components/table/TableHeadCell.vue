<script setup lang="ts">
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { pinStyle, widthStyle } from './TableRoot.vue';

defineOptions({ name: 'TableHeadCell', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** How the column is sorted; `false` for sortable but unsorted. Leave it out for a column that can't be sorted. */
    sort?: 'asc' | 'desc' | false;
    /** Sticks the column to an edge while the table scrolls sideways. */
    pinned?: 'start' | 'end';
    /** Pixels from that edge, past the columns pinned before it. @default 0 */
    offset?: number;
    /** A fixed width, held whatever the content; a number means pixels. */
    width?: number | string;
  }>(),
  { sort: undefined }
);

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

const ariaSort = computed(() => {
  if (props.sort === undefined) return undefined;
  return props.sort ? ARIA_SORT[props.sort] : 'none';
});

const merged = usePartProps(() => ({
  'data-part': 'table-head-cell',
  ...(props.sort ? { 'data-sort': props.sort } : null),
  ...(props.pinned ? { 'data-pinned': props.pinned } : null),
  ...(props.width !== undefined ? { 'data-sized': '' } : null),
  scope: 'col',
  'aria-sort': ariaSort.value,
  style: { ...pinStyle(props.pinned, props.offset), ...widthStyle(props.width) }
}));
</script>

<template>
  <th v-bind="merged">
    <slot />
  </th>
</template>

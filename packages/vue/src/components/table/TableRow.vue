<script setup lang="ts">
import { usePartProps } from '../../shared/use-part-props';

defineOptions({ name: 'TableRow', inheritAttrs: false });

const props = defineProps<{
  /** Its position in the data, for `data-index` and striping that survives sorting and virtual scrolling. */
  index?: number;
  /** Sets `data-selected`. */
  selected?: boolean;
  /** Sets `data-expanded`. */
  expanded?: boolean;
}>();

const merged = usePartProps(() => ({
  'data-part': 'table-row',
  ...(props.index === undefined
    ? null
    : { 'data-index': props.index, [props.index % 2 ? 'data-odd' : 'data-even']: '' }),
  ...(props.selected ? { 'data-selected': '' } : null),
  ...(props.expanded ? { 'data-expanded': '' } : null)
}));
</script>

<template>
  <tr v-bind="merged">
    <slot />
  </tr>
</template>

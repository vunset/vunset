<script setup lang="ts">
import { usePartProps } from '../../shared/use-part-props';
import { pinStyle, widthStyle } from './TableRoot.vue';

defineOptions({ name: 'TableCell', inheritAttrs: false });

const props = defineProps<{
  /** Sticks the cell to an edge while the table scrolls sideways; give its column's head cell the same. */
  pinned?: 'start' | 'end';
  /** Pixels from that edge, past the columns pinned before it. @default 0 */
  offset?: number;
  /** A fixed width, held whatever the content; a number means pixels. */
  width?: number | string;
}>();

const merged = usePartProps(() => ({
  'data-part': 'table-cell',
  ...(props.pinned ? { 'data-pinned': props.pinned } : null),
  ...(props.width !== undefined ? { 'data-sized': '' } : null),
  style: { ...pinStyle(props.pinned, props.offset), ...widthStyle(props.width) }
}));
</script>

<template>
  <td v-bind="merged">
    <slot />
  </td>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useOptionalTableContext } from './TableRoot.vue';

defineOptions({ name: 'TableFooter', inheritAttrs: false });

const table = useOptionalTableContext();
const offset = computed(() => table?.stickyFooter.value);

const merged = usePartProps(() => ({
  'data-part': 'table-footer',
  ...(offset.value !== undefined
    ? { 'data-sticky': '', style: { position: 'sticky', bottom: `${offset.value}px`, zIndex: 2 } }
    : null)
}));
</script>

<template>
  <tfoot v-bind="merged">
    <slot />
  </tfoot>
</template>

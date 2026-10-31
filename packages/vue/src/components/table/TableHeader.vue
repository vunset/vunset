<script setup lang="ts">
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useOptionalTableContext } from './TableRoot.vue';

defineOptions({ name: 'TableHeader', inheritAttrs: false });

const table = useOptionalTableContext();
const offset = computed(() => table?.stickyHeader.value);

const merged = usePartProps(() => ({
  'data-part': 'table-header',
  ...(offset.value !== undefined
    ? { 'data-sticky': '', style: { position: 'sticky', top: `${offset.value}px`, zIndex: 2 } }
    : null)
}));
</script>

<template>
  <thead v-bind="merged">
    <slot />
  </thead>
</template>

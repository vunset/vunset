<script setup lang="ts">
import { useChartPart } from './ChartRoot.vue';

defineOptions({ name: 'ChartGrid' });

const props = withDefaults(
  defineProps<{
    /** `y` draws a line per value tick, `x` one per row. @default 'y' */
    type?: 'x' | 'y';
    /** The value scale whose ticks it follows. Defaults to the first one with a series showing. */
    scale?: string;
  }>(),
  { type: 'y' }
);

useChartPart('grid', () => ({ ...props }));
</script>

<template></template>

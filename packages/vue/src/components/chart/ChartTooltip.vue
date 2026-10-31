<script setup lang="ts">
import { useAttrs } from 'vue';
import { useChartPart, type ChartTooltipSlotProps } from './ChartRoot.vue';

defineOptions({ name: 'ChartTooltip', inheritAttrs: false });

const slots = defineSlots<{
  /** Replaces the content: a heading, then a row per series. */
  default?(props: ChartTooltipSlotProps): unknown;
}>();

// The attributes land on the box, `data-part="chart-tooltip"`.
const attrs = useAttrs();

useChartPart('tooltip', () => ({ attrs, slot: slots.default }));
</script>

<template></template>

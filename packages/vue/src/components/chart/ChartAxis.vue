<script setup lang="ts">
import { useChartPart, type ChartSide } from './ChartRoot.vue';

defineOptions({ name: 'ChartAxis' });

const props = defineProps<{
  /** `x` labels the rows from `x-key`, `y` the values, whichever way the chart lies. */
  type: 'x' | 'y';
  /** The value scale a `y` axis shows, as its series name it. @default 'y' */
  scale?: string;
  /** Which edge it sits on. A second value axis defaults to the far one. */
  side?: ChartSide;
  /** Formats its labels, and the tooltip's values or heading. */
  format?: (value: any) => string;
  /** How many ticks it aims for. An `x` axis labels every row it has room for. */
  numTicks?: number;
  /** Cut long row labels rather than dropping the ones that would collide. */
  trimLabels?: boolean;
}>();

useChartPart('axis', () => ({ ...props }));
</script>

<template></template>

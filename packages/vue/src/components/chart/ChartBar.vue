<script setup lang="ts">
import { useChartPart } from './ChartRoot.vue';

defineOptions({ name: 'ChartBar' });

const props = withDefaults(
  defineProps<{
    /** The key plotted, read off each row. */
    yKey: string;
    /** Its name in the legend, the tooltip and the chart's accessible name. Defaults to `y-key`. */
    label?: string;
    /** Defaults to `var(--chart-color-N)`, `N` its place among the chart's series. */
    color?: string;
    /** The value scale it reads against. Every bar uses the first bar's. @default 'y' */
    scale?: string;
    /** Formats its value in the tooltip. Defaults to its scale's axis. */
    format?: (value: any) => string;
    /** Fade the bar towards its foot. */
    gradient?: boolean;
    /** The radius of the bar's end, in pixels. Every bar uses the first bar's. @default 2 */
    roundedCorners?: number;
    /** Gap between rows, as a fraction of the row. Every bar uses the first bar's. @default 0.1 */
    padding?: number;
  }>(),
  { scale: 'y', roundedCorners: 2, padding: 0.1 }
);

useChartPart('series', () => ({ kind: 'bar', ...props }));
</script>

<template></template>

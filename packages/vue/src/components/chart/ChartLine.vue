<script setup lang="ts">
import { useChartPart, type ChartCurve } from './ChartRoot.vue';

defineOptions({ name: 'ChartLine' });

const props = withDefaults(
  defineProps<{
    /** The key plotted, read off each row. */
    yKey: string;
    /** Its name in the legend, the tooltip and the chart's accessible name. Defaults to `y-key`. */
    label?: string;
    /** Defaults to `var(--chart-color-N)`, `N` its place among the chart's series. */
    color?: string;
    /** The value scale it reads against. A name of your own puts it on an axis of its own. @default 'y' */
    scale?: string;
    /** Formats its value in the tooltip. Defaults to its scale's axis. */
    format?: (value: any) => string;
    /** Bend the line through the points, or run it straight. @default 'smooth' */
    curve?: ChartCurve;
    /** Mark each row with a dot. */
    points?: boolean;
  }>(),
  { scale: 'y', curve: 'smooth' }
);

useChartPart('series', () => ({ kind: 'line', ...props }));
</script>

<template></template>

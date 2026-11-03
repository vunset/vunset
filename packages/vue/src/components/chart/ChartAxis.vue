<script setup lang="ts">
import { useChartPart, type ChartSide } from './ChartRoot.vue';

defineOptions({ name: 'ChartAxis' });

const props = withDefaults(
  defineProps<{
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
    /** A title along the axis, such as its unit. */
    label?: string;
    /** Draw the axis' own line along the plot's edge. */
    line?: boolean;
    /** The short mark at each label. @default true */
    tickMarks?: boolean;
  }>(),
  { tickMarks: true }
);

useChartPart('axis', () => ({ ...props }));
</script>

<template></template>

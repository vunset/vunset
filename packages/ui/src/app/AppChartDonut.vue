<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { isPropBound } from '@vunset/vue';
import { ChartDonut, ChartLegend } from '@vunset/vue/chart';

defineOptions({ name: 'AppChartDonut' });

// Forwarded only when bound, so a chart without `v-model:hidden` keeps its own.
const hiddenBound = isPropBound('hidden');

const props = withDefaults(
  defineProps<{
    /** The rows, one slice each. */
    data: Record<string, any>[];
    /** The key naming each slice. */
    categoryKey: string;
    /** The key holding each slice's size. */
    valueKey: string;
    /** Formats a slice's size, in the middle and in the tooltip. */
    valueFormat?: (value: number) => string;
    /** Renames a slice for the reader. */
    labelFormat?: (category: string) => string;
    /** One per slice. Defaults to `var(--chart-color-N)`. */
    colors?: string[];
    /** Slices not drawn, for `v-model:hidden`. */
    hidden?: string[];
    /** A number means pixels. @default '20rem' */
    height?: number | string;
    /** Gap between slices, in radians. @default 0.04 */
    padAngle?: number;
    /** The radius of each slice's corners, in pixels. @default 6 */
    cornerRadius?: number;
    /** How thick the ring is. `0` fills it in, making a pie. @default 12 */
    arcWidth?: number;
    /** Defaults to the total of what is showing. Empty string for nothing. */
    centralLabel?: string;
    /** The line under the central label. @default 'Total' */
    centralSubLabel?: string;
    /** Switches above the chart, one per slice. */
    legend?: boolean;
    /** Shows the slice under the pointer. @default true */
    tooltip?: boolean;
    /** A class for the tooltip's box. */
    tooltipClass?: HTMLAttributes['class'];
    /** The chart's accessible name. Defaults to its slices. */
    label?: string;
  }>(),
  { hidden: undefined, height: '20rem', tooltip: true, centralLabel: undefined, centralSubLabel: undefined }
);

const emit = defineEmits<{
  /** A slice was shown or hidden, for `v-model:hidden`. */
  'update:hidden': [hidden: string[]];
}>();

defineSlots<{
  /** Replaces the tooltip's content. */
  tooltip?(props: {
    /** The slice under the pointer: its `category`, `value` and `color`. */
    slice: { category: string; value: number; color: string };
  }): unknown;
}>();

const donut = computed(() => {
  const { hidden, legend, ...rest } = props;
  return { ...rest, ...(hiddenBound && { hidden }) };
});
</script>

<template>
  <ChartDonut v-bind="donut" @update:hidden="emit('update:hidden', $event)">
    <ChartLegend v-if="props.legend" :label-format="props.labelFormat" />
    <template v-if="$slots.tooltip" #tooltip="scope"><slot name="tooltip" v-bind="scope" /></template>
  </ChartDonut>
</template>

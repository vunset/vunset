<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { isPropBound } from '@vunset/vue';
import { ChartDonut, ChartLegend, type ChartLegendItem } from '@vunset/vue/chart';

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
    /** How many `--chart-color-N` the theme defines: slices past it start over at the first. @default 8 */
    paletteSize?: number;
    /** Slices not drawn, for `v-model:hidden`. */
    hidden?: string[];
    /** A number means pixels. @default '20rem' */
    height?: number | string;
    /** Gap between slices, in radians. @default 0.04 */
    padAngle?: number;
    /** Gap between slices, in pixels, the same width from the center to the edge; `0` for none. Replaces `pad-angle`. */
    gap?: number;
    /** The radius of each slice's corners, in pixels. @default 6 */
    cornerRadius?: number;
    /** How thick the ring is. `0` fills it in, making a pie. @default 12 */
    arcWidth?: number;
    /** Defaults to the total of what is showing; a pie shows none. `false` for nothing. */
    centralLabel?: string | false;
    /** The line under the central label. Defaults to 'Total', or none on a pie. `false` for nothing. */
    centralSubLabel?: string | false;
    /** Switches above the chart, one per slice. */
    legend?: boolean;
    /** Shows the slice under the pointer. @default true */
    tooltip?: boolean;
    /** A class for the tooltip's box. */
    tooltipClass?: HTMLAttributes['class'];
    /** Where the legend sits: above the ring, or below it. @default 'top' */
    legendPlacement?: 'top' | 'bottom';
    /** A click on a legend button shows only that slice, and a second click shows them all again. */
    legendIsolate?: boolean;
    /** A class for the legend. */
    legendClass?: HTMLAttributes['class'];
    /** A class for each legend button. */
    legendItemClass?: HTMLAttributes['class'];
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
  /** Replaces the legend's buttons: `items`, each with a `toggle()`, and the `hidden` list. */
  legend?(props: { items: ChartLegendItem[]; hidden: string[] }): unknown;
  /** Replaces what each legend button shows; the button and its toggling stay. */
  'legend-item'?(props: ChartLegendItem & { index: number }): unknown;
}>();

const donut = computed(() => {
  const { hidden, legend, legendPlacement, legendIsolate, legendClass, legendItemClass, ...rest } = props;
  return { ...rest, ...(hiddenBound && { hidden }) };
});
</script>

<template>
  <ChartDonut v-bind="donut" @update:hidden="emit('update:hidden', $event)">
    <ChartLegend
      v-if="props.legend"
      :label-format="props.labelFormat"
      :placement="props.legendPlacement"
      :isolate="props.legendIsolate"
      :class="props.legendClass"
      :item-class="props.legendItemClass"
    >
      <template v-if="$slots.legend" #default="scope"><slot name="legend" v-bind="scope" /></template>
      <template v-if="$slots['legend-item']" #item="scope"><slot name="legend-item" v-bind="scope" /></template>
    </ChartLegend>
    <template v-if="$slots.tooltip" #tooltip="scope"><slot name="tooltip" v-bind="scope" /></template>
  </ChartDonut>
</template>

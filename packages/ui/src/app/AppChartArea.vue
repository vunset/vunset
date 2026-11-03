<script setup lang="ts">
import { ChartArea, type ChartCurve, type ChartLegendItem, type ChartTooltipSlotProps } from '@vunset/vue/chart';
import { computed } from 'vue';
import { isPropBound } from '@vunset/vue';
import AppChartFrame from './AppChartFrame.vue';
import { APP_CHART_DEFAULTS, type AppChartProps, type AppChartXScaleProps } from './app-chart';

defineOptions({ name: 'AppChartArea' });

// Forwarded only when bound, so a chart without `v-model:hidden` keeps its own.
const hiddenBound = isPropBound('hidden');

const props = withDefaults(
  defineProps<
    AppChartProps &
      AppChartXScaleProps & {
        /** Mark each row with a dot. */
        points?: boolean;
        /** Bend the lines through the points, or run them straight. @default 'smooth' */
        curve?: ChartCurve;
        /** Draw a line along each band's top. @default true */
        line?: boolean;
        /** Fade each band towards the axis, or fill it evenly. @default true */
        gradient?: boolean;
      }
  >(),
  { ...APP_CHART_DEFAULTS, curve: 'smooth', xScale: 'category', line: true, gradient: true }
);

// What the frame takes: the series' own props stay here.
const frame = computed(() => {
  const { categories, colors, labelFormat, hidden, points, curve, line, gradient, ...rest } = props;
  return { ...rest, ...(hiddenBound && { hidden }), series: categories.length };
});

const emit = defineEmits<{
  /** A series was shown or hidden, for `v-model:hidden`. */
  'update:hidden': [hidden: string[]];
}>();

defineSlots<{
  /** More parts inside the chart, such as a `ChartLine` over the bands. */
  default?(): unknown;
  /** Replaces the tooltip's content. */
  tooltip?(props: ChartTooltipSlotProps): unknown;
  /** Replaces the legend's buttons: `items`, each with a `toggle()`, and the `hidden` list. */
  legend?(props: { items: ChartLegendItem[]; hidden: string[] }): unknown;
  /** Replaces what each legend button shows; the button and its toggling stay. */
  'legend-item'?(props: ChartLegendItem & { index: number }): unknown;
}>();
</script>

<template>
  <AppChartFrame v-bind="frame" crosshair @update:hidden="emit('update:hidden', $event)">
    <ChartArea
      v-for="(key, index) in props.categories"
      :key="key"
      :y-key="key"
      :label="props.labelFormat?.(key)"
      :color="props.colors?.[index]"
      :points="props.points"
      :curve="props.curve"
      :line="props.line"
      :gradient="props.gradient"
    />
    <slot />
    <template v-if="$slots.tooltip" #tooltip="scope"><slot name="tooltip" v-bind="scope" /></template>
    <template v-if="$slots.legend" #legend="scope"><slot name="legend" v-bind="scope" /></template>
    <template v-if="$slots['legend-item']" #legend-item="scope"><slot name="legend-item" v-bind="scope" /></template>
  </AppChartFrame>
</template>

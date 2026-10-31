<script setup lang="ts">
import { ChartArea, type ChartCurve, type ChartTooltipSlotProps } from '@vunset/vue/chart';
import { computed } from 'vue';
import { isPropBound } from '@vunset/vue';
import AppChartFrame from './AppChartFrame.vue';
import { APP_CHART_DEFAULTS, type AppChartProps } from './app-chart';

defineOptions({ name: 'AppChartArea' });

// Forwarded only when bound, so a chart without `v-model:hidden` keeps its own.
const hiddenBound = isPropBound('hidden');

const props = withDefaults(
  defineProps<
    AppChartProps & {
      /** Mark each row with a dot. */
      points?: boolean;
      /** Bend the lines through the points, or run them straight. @default 'smooth' */
      curve?: ChartCurve;
    }
  >(),
  { ...APP_CHART_DEFAULTS, curve: 'smooth' }
);

// What the frame takes: the series' own props stay here.
const frame = computed(() => {
  const { categories, colors, labelFormat, hidden, points, curve, ...rest } = props;
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
    />
    <slot />
    <template v-if="$slots.tooltip" #tooltip="scope"><slot name="tooltip" v-bind="scope" /></template>
  </AppChartFrame>
</template>

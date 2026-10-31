<script setup lang="ts">
import { ChartBar, type ChartTooltipSlotProps } from '@vunset/vue/chart';
import { computed } from 'vue';
import { isPropBound } from '@vunset/vue';
import AppChartFrame from './AppChartFrame.vue';
import { APP_CHART_DEFAULTS, type AppChartProps } from './app-chart';

defineOptions({ name: 'AppChartBar' });

// Forwarded only when bound, so a chart without `v-model:hidden` keeps its own.
const hiddenBound = isPropBound('hidden');

const props = withDefaults(
  defineProps<
    AppChartProps & {
      /** Pile the categories on top of each other rather than side by side. */
      stacked?: boolean;
      /** Which way the bars grow. @default 'vertical' */
      orientation?: 'vertical' | 'horizontal';
      /** Fade each bar towards its foot. */
      gradient?: boolean;
      /** The radius of each bar's end, in pixels. @default 2 */
      roundedCorners?: number;
      /** Gap between rows, as a fraction of the row. @default 0.1 */
      barPadding?: number;
      /** Cut long row labels rather than dropping the ones that would collide. */
      trimLabels?: boolean;
    }
  >(),
  { ...APP_CHART_DEFAULTS, orientation: 'vertical', roundedCorners: 2, barPadding: 0.1 }
);

// What the frame takes: the series' own props stay here.
const frame = computed(() => {
  const { categories, colors, labelFormat, hidden, gradient, roundedCorners, barPadding, ...rest } = props;
  return { ...rest, ...(hiddenBound && { hidden }), series: categories.length };
});

const emit = defineEmits<{
  /** A series was shown or hidden, for `v-model:hidden`. */
  'update:hidden': [hidden: string[]];
}>();

defineSlots<{
  /** More parts inside the chart, such as a `ChartLine` over the bars. */
  default?(): unknown;
  /** Replaces the tooltip's content. */
  tooltip?(props: ChartTooltipSlotProps): unknown;
}>();
</script>

<template>
  <AppChartFrame v-bind="frame" @update:hidden="emit('update:hidden', $event)">
    <ChartBar
      v-for="(key, index) in props.categories"
      :key="key"
      :y-key="key"
      :label="props.labelFormat?.(key)"
      :color="props.colors?.[index]"
      :gradient="props.gradient"
      :rounded-corners="props.roundedCorners"
      :padding="props.barPadding"
    />
    <slot />
    <template v-if="$slots.tooltip" #tooltip="scope"><slot name="tooltip" v-bind="scope" /></template>
  </AppChartFrame>
</template>

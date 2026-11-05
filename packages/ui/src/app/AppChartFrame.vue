<script setup lang="ts">
import { computed } from 'vue';
import { isPropBound } from '@vunset/vue';
import {
  ChartAxis,
  ChartCrosshair,
  ChartGrid,
  ChartLegend,
  type ChartLegendItem,
  ChartRoot,
  ChartTooltip,
  type ChartTooltipSlotProps
} from '@vunset/vue/chart';
import { APP_CHART_DEFAULTS, type AppChartProps } from './app-chart';

defineOptions({ name: 'AppChartFrame' });

const hiddenBound = isPropBound('hidden');

const props = withDefaults(
  defineProps<
    Omit<AppChartProps, 'categories' | 'colors' | 'labelFormat'> & {
      series: number;
      orientation?: 'vertical' | 'horizontal';
      stacked?: boolean;
      trimLabels?: boolean;
      crosshair?: boolean;
      xScale?: 'category' | 'linear' | (() => unknown);
    }
  >(),
  { ...APP_CHART_DEFAULTS, xScale: 'category' }
);

const emit = defineEmits<{ 'update:hidden': [hidden: string[]] }>();

defineSlots<{
  default(): unknown;
  tooltip?(props: ChartTooltipSlotProps): unknown;
  /** Replaces the legend's buttons: `items`, each with a `toggle()`, and the `hidden` list. */
  legend?(props: { items: ChartLegendItem[]; hidden: string[] }): unknown;
  /** Replaces what each legend button shows; the button and its toggling stay. */
  'legend-item'?(props: ChartLegendItem & { index: number }): unknown;
}>();

const showLegend = computed(() => props.legend ?? props.series > 1);
</script>

<template>
  <ChartRoot
    :data="props.data"
    :x-key="props.xKey"
    :x-scale="props.xScale"
    :palette-size="props.paletteSize"
    :height="props.height"
    :orientation="props.orientation"
    :stacked="props.stacked"
    :label="props.label"
    v-bind="hiddenBound ? { hidden: props.hidden } : {}"
    @update:hidden="emit('update:hidden', $event)"
  >
    <ChartLegend
      v-if="showLegend"
      :placement="props.legendPlacement"
      :isolate="props.legendIsolate"
      :class="props.legendClass"
      :item-class="props.legendItemClass"
    >
      <template v-if="$slots.legend" #default="scope"><slot name="legend" v-bind="scope" /></template>
      <template v-if="$slots['legend-item']" #item="scope"><slot name="legend-item" v-bind="scope" /></template>
    </ChartLegend>
    <ChartAxis
      v-if="props.xAxis"
      type="x"
      :format="props.xFormat"
      :num-ticks="props.numTicks"
      :trim-labels="props.trimLabels"
      :label="props.xLabel"
      :line="props.xAxisLine"
    />
    <ChartAxis v-if="props.yAxis" type="y" :format="props.yFormat" :label="props.yLabel" :line="props.yAxisLine" />
    <ChartGrid v-if="props.grid" />
    <slot />
    <ChartCrosshair v-if="props.crosshair" />
    <ChartTooltip
      v-if="props.tooltip"
      :class="props.tooltipClass"
      :mode="props.tooltipMode"
      :sticky="props.tooltipSticky"
      :heading-format="props.tooltipHeadingFormat"
    >
      <template v-if="$slots.tooltip" #default="scope">
        <slot name="tooltip" v-bind="scope" />
      </template>
    </ChartTooltip>
  </ChartRoot>
</template>

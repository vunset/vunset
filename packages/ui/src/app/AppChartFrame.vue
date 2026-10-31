<script setup lang="ts">
import { computed } from 'vue';
import { isPropBound } from '@vunset/vue';
import { ChartAxis, ChartCrosshair, ChartGrid, ChartLegend, ChartRoot, ChartTooltip, type ChartTooltipSlotProps } from '@vunset/vue/chart';
import { APP_CHART_DEFAULTS, type AppChartProps } from './app-chart';

// What the three cartesian charts share: the root, the legend, axes, grid and
// tooltip around the series each one draws in its slot.
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
    }
  >(),
  APP_CHART_DEFAULTS
);

const emit = defineEmits<{ 'update:hidden': [hidden: string[]] }>();

defineSlots<{
  default(): unknown;
  tooltip?(props: ChartTooltipSlotProps): unknown;
}>();

const showLegend = computed(() => props.legend ?? props.series > 1);
</script>

<template>
  <ChartRoot
    :data="props.data"
    :x-key="props.xKey"
    :height="props.height"
    :orientation="props.orientation"
    :stacked="props.stacked"
    :label="props.label"
    v-bind="hiddenBound ? { hidden: props.hidden } : {}"
    @update:hidden="emit('update:hidden', $event)"
  >
    <ChartLegend v-if="showLegend" />
    <ChartAxis v-if="props.xAxis" type="x" :format="props.xFormat" :num-ticks="props.numTicks" :trim-labels="props.trimLabels" />
    <ChartAxis v-if="props.yAxis" type="y" :format="props.yFormat" />
    <ChartGrid v-if="props.grid" />
    <slot />
    <ChartCrosshair v-if="props.crosshair" />
    <ChartTooltip v-if="props.tooltip" :class="props.tooltipClass">
      <template v-if="$slots.tooltip" #default="scope">
        <slot name="tooltip" v-bind="scope" />
      </template>
    </ChartTooltip>
  </ChartRoot>
</template>

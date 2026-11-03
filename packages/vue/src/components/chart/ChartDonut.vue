<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, type HTMLAttributes } from 'vue';
import type { ChartDefinition, ChartPoint } from '@tanstack/charts/vue';
import { defineChart } from '@tanstack/charts';
import { pie, polar, radialArc } from '@tanstack/charts/polar';
import { tooltip as tooltipExtension } from '@tanstack/charts/tooltip';
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal';
import { useChartSeries } from './use-chart-series';
import { chartName } from './chart-scales';
import ChartFrame from './ChartFrame.vue';
import { formatNumber } from '@vunset/utils';

defineOptions({ name: 'ChartDonut', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The rows, one slice each. */
    data: T[];
    /** The key naming each slice. */
    categoryKey: keyof T & string;
    /** The key holding each slice's size. */
    valueKey: keyof T & string;
    /** Formats a slice's size, in the middle and in the tooltip. */
    valueFormat?: (value: number) => string;
    /** Renames a slice for the reader. */
    labelFormat?: (category: string) => string;
    /** One per slice. Defaults to `var(--chart-color-N)`. */
    colors?: string[];
    /** How many `--chart-color-N` the theme defines: series past it start over at the first. @default 8 */
    paletteSize?: number;
    /** Slices not drawn. `v-model:hidden` pairs it with a `ChartLegend`. */
    hidden?: string[];
    /** A number means pixels. @default '20rem' */
    height?: number | string;
    /** Gap between slices, in radians: a wedge, widening towards the edge. @default 0.04 */
    padAngle?: number;
    /**
     * Gap between slices, in pixels, the same width from the center to the edge; `0` for none. Replaces
     * `pad-angle`. It's drawn as a line in `--chart-gap-color`, the page's background by default.
     */
    gap?: number;
    /** The radius of each slice's corners, in pixels. @default 6 */
    cornerRadius?: number;
    /** How thick the ring is. `0` fills it in, making a pie. @default 12 */
    arcWidth?: number;
    /** Defaults to the total of what is showing; a pie, with no middle, shows none. `false` for nothing. */
    centralLabel?: string | false;
    /** The line under the central label. Defaults to 'Total', or none on a pie. `false` for nothing. */
    centralSubLabel?: string | false;
    /** Shows the slice under the pointer. @default true */
    tooltip?: boolean;
    /** A class for the tooltip's box. */
    tooltipClass?: HTMLAttributes['class'];
    /** The chart's accessible name. Defaults to its slices. */
    label?: string;
  }>(),
  {
    height: '20rem',
    padAngle: 0.04,
    cornerRadius: 6,
    arcWidth: 12,
    // Spelled out: a prop that can be `false` is otherwise cast to `false` when left off.
    centralLabel: undefined,
    centralSubLabel: undefined,
    tooltip: undefined
  }
);

const emit = defineEmits<{
  /** A slice was shown or hidden, for `v-model:hidden`. */
  'update:hidden': [hidden: string[]];
}>();

defineSlots<{
  /** Content inside the chart, such as a `ChartLegend`. */
  default(): unknown;
  /** Replaces the tooltip's content. */
  tooltip(props: {
    /** The slice under the pointer: its `category`, `value` and `color`. */
    slice: { category: string; value: number; color: string };
  }): unknown;
}>();

const slices = computed(() =>
  props.data.map((row) => ({
    category: String(row[props.categoryKey]),
    value: Number(row[props.valueKey]) || 0
  }))
);

const { visible } = useChartSeries({
  categories: () => slices.value.map((slice) => slice.category),
  colors: () => props.colors,
  paletteSize: () => props.paletteSize,
  hidden: () => props.hidden,
  onHiddenChange: (next) => emit('update:hidden', next)
});

interface Slice {
  category: string;
  color: string;
  /** The slice's value; `pie` derives a `value` of its own from it. */
  size: number;
}

const shown = computed<Slice[]>(() =>
  visible.value.map((series) => ({
    category: series.category,
    color: series.color,
    size: slices.value.find((slice) => slice.category === series.category)?.value ?? 0
  }))
);

const showTooltip = computed(() => props.tooltip ?? true);
const total = computed(() => shown.value.reduce((sum, slice) => sum + slice.size, 0));
const format = (value: number) => (props.valueFormat ? props.valueFormat(value) : formatNumber(value));
const label = (category: string) => (props.labelFormat ? props.labelFormat(category) : category);

const sliceOf = (point: ChartPoint<any>) => ({
  category: point.datum.category as string,
  value: point.datum.size as number,
  color: point.datum.color as string
});

const definition = computed(() => {
  // Read here: the chart only redraws for a new definition, not when a value
  // its callbacks read later changes.
  const width = props.arcWidth;
  const cornerRadius = props.cornerRadius;
  const gap = props.gap;

  return defineChart({
    // No redraw tween: it blends each arc's path text, and an arc's large-arc flag can't be blended,
    // so a slice would swing the long way round. The donut redraws at once.
    svgAnimation: false,
    marks: [
      polar({
        marks: [
          radialArc(pie(shown.value, { value: 'size', gapAngle: gap === undefined ? props.padAngle : 0 }), {
            color: 'category',
            key: 'category',
            // A ring of no thickness is a pie.
            innerRadius: ({ radius }: { radius: number }) => (width > 0 ? Math.max(radius - width, 0) : 0),
            cornerRadius,
            // An even gap: the slices touch, and a line the gap's width in the background's color parts them.
            // An angle's gap would narrow to nothing at a pie's center.
            ...(gap !== undefined && gap > 0 && { stroke: 'var(--chart-gap-color, Canvas)', strokeWidth: gap })
          })
        ],
        scales: { angle: null, radius: null }
      })
    ],
    scales: { x: null, y: null },
    color: {
      scale: scaleOrdinal<string, string>()
        .domain(shown.value.map((slice) => slice.category))
        .range(shown.value.map((slice) => slice.color))
    },
    tooltip: showTooltip.value && {
      use: tooltipExtension,
      content: (points: readonly ChartPoint<any>[]) => {
        const slice = points[0] && sliceOf(points[0]);
        return {
          rows: slice ? [{ label: label(slice.category), value: format(slice.value), color: slice.color }] : []
        };
      }
    }
  } as any) as ChartDefinition<any, any, any>;
});

// A pie has no hole to write in, so its middle stays empty unless given text.
const filled = computed(() => props.arcWidth <= 0);
const centralLabel = computed(() => props.centralLabel ?? (filled.value ? false : format(total.value)));
const centralSubLabel = computed(() => props.centralSubLabel ?? (filled.value ? false : 'Total'));

const ariaLabel = computed(
  () =>
    props.label ??
    chartName(
      shown.value.map((slice) => slice.category),
      props.labelFormat,
      'Donut chart'
    )
);
</script>

<template>
  <ChartFrame
    kind="donut"
    :definition="() => definition"
    :label="() => ariaLabel"
    :height="props.height"
    :tooltip="() => showTooltip"
    :tooltip-attrs="() => ({ class: props.tooltipClass })"
    v-bind="$attrs"
  >
    <slot />

    <template #tooltip="{ point }">
      <slot name="tooltip" v-bind="{ slice: sliceOf(point) }">
        <div data-part="tooltip-rows">
          <div data-part="tooltip-row">
            <span data-part="tooltip-swatch" :style="{ background: sliceOf(point).color }" />
            <span data-part="tooltip-label">{{ label(sliceOf(point).category) }}</span>
            <span data-part="tooltip-value">{{ format(sliceOf(point).value) }}</span>
          </div>
        </div>
      </slot>
    </template>

    <template v-if="centralLabel || centralSubLabel" #center>
      <span v-if="centralLabel" data-part="chart-center-label">{{ centralLabel }}</span>
      <span v-if="centralSubLabel" data-part="chart-center-sub-label">{{ centralSubLabel }}</span>
    </template>
  </ChartFrame>
</template>

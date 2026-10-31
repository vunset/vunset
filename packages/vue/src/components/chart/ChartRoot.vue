<script lang="ts">
import {
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  type ComponentInternalInstance
} from 'vue';
import { createContext } from '../../shared/context';

export type ChartCurve = 'smooth' | 'linear';
export type ChartSide = 'top' | 'right' | 'bottom' | 'left';

/** What `ChartArea`, `ChartLine` and `ChartBar` hand their chart. */
export interface ChartSeriesPart {
  kind: 'area' | 'line' | 'bar';
  yKey: string;
  label?: string;
  color?: string;
  scale: string;
  format?: (value: any) => string;
  curve?: ChartCurve;
  points?: boolean;
  gradient?: boolean;
  roundedCorners?: number;
  padding?: number;
}

export interface ChartAxisPart {
  type: 'x' | 'y';
  scale?: string;
  side?: ChartSide;
  format?: (value: any) => string;
  numTicks?: number;
  trimLabels?: boolean;
}

export interface ChartGridPart {
  type: 'x' | 'y';
  scale?: string;
}

/** One series in the tooltip, for the row under the pointer. */
export interface ChartTooltipSeries {
  key: string;
  label: string;
  color: string;
  /** The raw value, as the row holds it. */
  value: unknown;
  /** The value through its series' or axis' formatter. */
  text: string;
}

export interface ChartTooltipSlotProps<T = Record<string, any>> {
  /** The row under the pointer. */
  row: T;
  /** Its `x-key` value, through the x axis' formatter. */
  heading: string;
  /** The series showing, in order. */
  series: ChartTooltipSeries[];
}

export interface ChartTooltipPart {
  attrs: Record<string, unknown>;
  slot?: (props: ChartTooltipSlotProps) => unknown;
}

interface Parts {
  series: ChartSeriesPart;
  axis: ChartAxisPart;
  grid: ChartGridPart;
  crosshair: Record<string, never>;
  tooltip: ChartTooltipPart;
}

export type ChartPartKind = keyof Parts;

export interface ChartPart<K extends ChartPartKind = ChartPartKind> {
  kind: K;
  options: () => Parts[K];
  instance: ComponentInternalInstance | null;
  /** Registration order, the fallback for template order before anything is mounted. */
  seq: number;
}

export interface ChartRootContext {
  add(part: ChartPart): void;
  remove(part: ChartPart): void;
  /** A part has mounted: template order can be read off the page. */
  mounted(): void;
}

export const { provideContext: provideChartRootContext, useContext: useChartRootContext } =
  createContext<ChartRootContext>('ChartRoot');

let seq = 0;

/** Hands a part's options to the chart it sits in, for as long as it is mounted. */
export function useChartPart<K extends ChartPartKind>(kind: K, options: () => Parts[K]): void {
  const chart = useChartRootContext();
  const part: ChartPart<K> = { kind, options, instance: getCurrentInstance(), seq: seq++ };
  chart.add(part as unknown as ChartPart);
  onMounted(() => chart.mounted());
  onBeforeUnmount(() => chart.remove(part as unknown as ChartPart));
}

// A part renders nothing but a comment, which still marks its place in the template.
function anchor(part: ChartPart): Node | null {
  const el = part.instance?.vnode.el;
  return typeof Node !== 'undefined' && el instanceof Node && el.isConnected ? el : null;
}

/** Template order: what comes later paints on top. A part shown later by `v-if` registers last. */
export function byTemplate(a: ChartPart, b: ChartPart): number {
  const first = anchor(a);
  const second = anchor(b);
  if (first && second) return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  return a.seq - b.seq;
}
</script>

<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, shallowRef, type VNodeChild } from 'vue';
import type { ChartDefinition, ChartPoint } from '@tanstack/charts/vue';
import { areaX, areaY, barX, barY, defineChart, group, lineX, lineY, stack } from '@tanstack/charts';
import { crosshair as crosshairMark } from '@tanstack/charts/crosshair';
import { decorative } from '@tanstack/charts/mark/decorative';
import { tooltip as tooltipExtension } from '@tanstack/charts/tooltip';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal';
import { scalePoint } from '@tanstack/charts/scales/point';
import { chartColors, formatNumber } from '@vunset/utils';
import { useChartSeries } from './use-chart-series';
import { curveOf, plotted, rowFocus, rowLabel, rowTicks, tickLabels, TICK_FONT_SIZE, valueLabel } from './chart-scales';
import ChartFrame, { type ChartRender } from './ChartFrame.vue';

defineOptions({ name: 'ChartRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The rows, one per point along the x axis. */
    data: T[];
    /** The key naming each row, along the x axis. */
    xKey: keyof T & string;
    /** A number means pixels. @default '20rem' */
    height?: number | string;
    /** Which way the bars grow, and so which way the rows run. @default 'vertical' */
    orientation?: 'vertical' | 'horizontal';
    /** Pile the bars on top of each other rather than side by side. */
    stacked?: boolean;
    /** Series not drawn, by `y-key`. `v-model:hidden` pairs it with a `ChartLegend`. */
    hidden?: string[];
    /** The chart's accessible name. Defaults to its series. */
    label?: string;
  }>(),
  { height: '20rem', orientation: 'vertical', hidden: undefined }
);

const emit = defineEmits<{
  /** A series was shown or hidden, for `v-model:hidden`. */
  'update:hidden': [hidden: string[]];
}>();

defineSlots<{
  /** The parts: series, axes, grid, crosshair, tooltip and legend. */
  default(): unknown;
}>();

const parts = shallowRef<ChartPart[]>([]);

function sort() {
  const next = [...parts.value].sort(byTemplate);
  if (next.some((part, index) => part !== parts.value[index])) parts.value = next;
}

provideChartRootContext({
  add(part) {
    parts.value = [...parts.value, part].sort(byTemplate);
  },
  remove(part) {
    parts.value = parts.value.filter((entry) => entry !== part);
  },
  mounted: sort
});

const of = <K extends ChartPartKind>(kind: K) =>
  computed(() => parts.value.filter((part) => part.kind === kind).map((part) => part.options() as Parts[K]));

const series = of('series');
const axes = of('axis');
const grids = of('grid');
const crosshairs = of('crosshair');
const tooltips = of('tooltip');

const keys = computed(() => [...new Set(series.value.map((entry) => entry.yKey))]);
const labelOf = (key: string) => series.value.find((entry) => entry.yKey === key && entry.label)?.label ?? key;

const { colors, visible } = useChartSeries({
  categories: () => keys.value,
  colors: () => {
    const palette = chartColors(keys.value.length);
    return keys.value.map((key, index) => series.value.find((entry) => entry.yKey === key && entry.color)?.color ?? palette[index]!);
  },
  labels: () => keys.value.map(labelOf),
  hidden: () => props.hidden,
  prop: 'hidden',
  onHiddenChange: (next) => emit('update:hidden', next)
});

const horizontal = computed(() => props.orientation === 'horizontal');
const shownKeys = computed(() => visible.value.map((entry) => entry.category));
const shownColors = computed(() => visible.value.map((entry) => entry.color));
const shown = computed(() => series.value.filter((entry) => shownKeys.value.includes(entry.yKey)));
const colorIndex = (key: string) => keys.value.indexOf(key);

// TanStack's names: the row scale is `x` upright and `y` lying down, the value scale the other.
const rowId = computed(() => (horizontal.value ? 'y' : 'x'));
const valueChannel = computed(() => (horizontal.value ? 'x' : 'y'));
const valueId = (scale: string) => (scale === 'y' ? valueChannel.value : scale);

const xAxis = computed(() => axes.value.find((axis) => axis.type === 'x'));
const axisOf = (scale: string) => axes.value.find((axis) => axis.type === 'y' && (axis.scale ?? 'y') === scale);

/** Every value scale a series or an axis names, `y` first. */
const scales = computed(() => {
  const named = [...series.value.map((entry) => entry.scale), ...axes.value.filter((axis) => axis.type === 'y').map((axis) => axis.scale ?? 'y')];
  return [...new Set(['y', ...named])].filter((scale) => scale === 'y' || named.includes(scale));
});

const drawsOn = (scale: string) => shown.value.some((entry) => entry.scale === scale);
// An axis whose every series is hidden goes with them, rather than reading 0 to 1 over nothing.
const axisShown = (scale: string) => drawsOn(scale) || !series.value.some((entry) => entry.scale === scale);

// The value grid sits on its own scale, or follows the first one still drawn.
const valueGrid = computed(() => {
  const grid = grids.value.find((entry) => entry.type === 'y');
  if (!grid) return undefined;
  return grid.scale ?? scales.value.find(drawsOn) ?? 'y';
});

const formatOf = (entry: ChartSeriesPart | undefined) => entry?.format ?? axisOf(entry?.scale ?? 'y')?.format;
const xText = (row: T | undefined) => rowLabel(row, props.xKey, xAxis.value?.format);

/** The row's series for the tooltip, one per key showing. */
function tooltipSeries(row: T): ChartTooltipSeries[] {
  return shownKeys.value.map((key, index) => {
    const value = row[key];
    const format = formatOf(series.value.find((entry) => entry.yKey === key));
    return {
      key,
      label: labelOf(key),
      color: shownColors.value[index] ?? '',
      value,
      // A missing value reads as zero rather than as nothing.
      text: format ? format(value) : formatNumber(Number(value) || 0)
    };
  });
}

const tooltipProps = (row: T): ChartTooltipSlotProps<T> => ({ row, heading: xText(row), series: tooltipSeries(row) });

// The width each row gets, measured on render, for cutting its label to fit.
const band = shallowRef<number>();
// The tick labels' size, from the stylesheet through ChartFrame.
const tickSize = shallowRef<number>();

// A character averages about 0.6em of the tick labels' size.
const fits = computed(() =>
  xAxis.value?.trimLabels && !horizontal.value && band.value !== undefined
    ? Math.max(1, Math.floor(band.value / ((tickSize.value ?? TICK_FONT_SIZE) * 0.6)))
    : undefined
);

const trim = (label: string, fits: number | undefined) =>
  fits !== undefined && label.length > fits ? `${label.slice(0, Math.max(1, fits - 1))}…` : label;

const areaGradient = (key: string) => `area-${colorIndex(key)}`;
const barGradient = (key: string) => `bar-${colorIndex(key)}`;

interface Point {
  row: T;
  index: number;
  category: string;
  value: number | undefined;
  /** Bars only: its series' gradient, or none. */
  fill?: string;
}

const pointsOf = (key: string, fill?: string) =>
  props.data.map<Point>((row, index) => ({ row, index, category: key, value: plotted(row[key]), fill }));

function barMark() {
  const bars = shown.value.filter((entry) => entry.kind === 'bar');
  const first = bars[0]!;
  const radius = first.roundedCorners ?? 2;
  const data = props.data.flatMap((row, index) =>
    bars.map<Point>((entry) => ({
      row,
      index,
      category: entry.yKey,
      value: plotted(row[entry.yKey]),
      fill: entry.gradient ? `url(#${barGradient(entry.yKey)})` : undefined
    }))
  );
  const options = {
    z: 'category',
    color: 'category',
    fill: bars.some((entry) => entry.gradient)
      ? (bar: Point) => bar.fill ?? colors.value[colorIndex(bar.category)]
      : undefined,
    radius: props.stacked ? { end: radius, stack: 'outer' } : { end: radius },
    layout: props.stacked ? stack() : group({ padding: 0.05 })
  };
  return horizontal.value
    ? barX(data, { ...options, x: 'value', y: 'index', xScale: valueId(first.scale) } as any)
    : barY(data, { ...options, x: 'index', y: 'value', yScale: valueId(first.scale) } as any);
}

function seriesMarks(entry: ChartSeriesPart) {
  const points = pointsOf(entry.yKey);
  const channels = {
    ...(horizontal.value
      ? { x: 'value', y: 'index', xScale: valueId(entry.scale) }
      : { x: 'index', y: 'value', yScale: valueId(entry.scale) }),
    z: 'category',
    color: 'category',
    curve: curveOf(entry.curve ?? 'smooth')
  };
  const line = (horizontal.value ? lineX : lineY)(points, { ...channels, strokeWidth: 2, points: entry.points } as any);
  if (entry.kind === 'line') return [line];

  // The band only paints; the line over it owns the focus.
  const area = (horizontal.value ? areaX : areaY)(points, {
    ...channels,
    fill: `url(#${areaGradient(entry.yKey)})`,
    fillOpacity: 1
  } as any);
  return [decorative(area), line];
}

const fade = computed(() => (horizontal.value ? { x1: 1, y1: 0, x2: 0, y2: 0 } : { x1: 0, y1: 0, x2: 0, y2: 1 }));

function gradients() {
  const found = new Map<string, object>();
  for (const entry of shown.value) {
    const color = colors.value[colorIndex(entry.yKey)];
    if (entry.kind === 'area') {
      found.set(areaGradient(entry.yKey), {
        id: areaGradient(entry.yKey),
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1,
        stops: [
          { offset: 0, color, opacity: 0.25 },
          { offset: 0.9, color, opacity: 0 }
        ]
      });
    } else if (entry.kind === 'bar' && entry.gradient) {
      found.set(barGradient(entry.yKey), {
        id: barGradient(entry.yKey),
        ...fade.value,
        stops: [
          { offset: 0, color },
          { offset: 1, color, opacity: 0.2 }
        ]
      });
    }
  }
  return found.size ? [...found.values()] : undefined;
}

const definition = computed(() => {
  const marks: unknown[] = [];
  let bars = false;
  for (const entry of shown.value) {
    if (entry.kind !== 'bar') marks.push(...seriesMarks(entry));
    else if (!bars) {
      marks.push(barMark());
      bars = true;
    }
  }
  if (crosshairs.value.length) marks.push(crosshairMark(horizontal.value ? { x: false, y: true } : { x: true, y: false }));

  // Read here rather than in the formatter: the chart only redraws for a new definition.
  const budget = fits.value;
  const x = xAxis.value;
  const firstBar = series.value.find((entry) => entry.kind === 'bar');

  const rowScale = {
    scale: firstBar
      ? () => scaleBand<number>().padding(firstBar.padding ?? 0.1)
      : () => scalePoint<number>().padding(0),
    grid: grids.value.some((entry) => entry.type === 'x'),
    axis: x
      ? {
          line: false,
          ...tickLabels(tickSize.value),
          ticks: {
            format: (index: number) => trim(xText(props.data[index]), budget),
            values: rowTicks(props.data.length, x.numTicks)
          }
        }
      : false
  };

  const valueScales = Object.fromEntries(
    scales.value.map((scale) => {
      const axis = axisOf(scale);
      return [
        valueId(scale),
        {
          ...(scale === 'y'
            ? axis?.side && { side: axis.side }
            : { channel: valueChannel.value, side: axis?.side ?? (horizontal.value ? 'top' : 'right') }),
          scale: scaleLinear,
          nice: true,
          grid: valueGrid.value === scale,
          axis:
            axis && axisShown(scale)
              ? {
                  line: false,
                  ...tickLabels(tickSize.value),
                  ticks: {
                    format: (raw: number) => valueLabel(raw, axis.format),
                    ...(axis.numTicks !== undefined && { count: axis.numTicks })
                  }
                }
              : false
        }
      ];
    })
  );

  return defineChart({
    marks,
    scales: { [rowId.value]: rowScale, ...valueScales },
    color: { scale: scaleOrdinal<string, string>().domain(shownKeys.value).range(shownColors.value) },
    gradients: gradients(),
    ...rowFocus(horizontal.value),
    tooltip: tooltips.value.length > 0 && {
      use: tooltipExtension,
      content: (points: readonly ChartPoint<Point>[]) => {
        const row = points[0]?.datum.row;
        if (!row) return { rows: [] };
        // The same row as text, which TanStack Charts reads out to assistive technology.
        return {
          title: row[props.xKey] !== undefined ? xText(row) : undefined,
          rows: tooltipSeries(row).map((entry) => ({ label: entry.label, value: entry.text, color: entry.color }))
        };
      }
    }
  } as any) as ChartDefinition<any, any, any>;
});

const ariaLabel = () => props.label ?? (shownKeys.value.map(labelOf).join(', ') || 'Chart');

// With more than one value axis, each reads in its series' color where it has only one.
// TanStack paints every tick label alike, so the color goes on after each draw.
function onRender({ scene, svg }: ChartRender) {
  band.value = props.data.length ? scene.chart.width / props.data.length : undefined;

  const drawn = scales.value.filter(drawsOn);
  if (drawn.length < 2) return;
  for (const scale of drawn) {
    const own = [...new Set(shown.value.filter((entry) => entry.scale === scale).map((entry) => entry.yKey))];
    const color = own.length === 1 ? colors.value[colorIndex(own[0]!)] : undefined;
    if (!color) continue;
    for (const label of svg.querySelectorAll(`text[data-ts-key^="${valueId(scale)}-tick-label"]`)) {
      label.setAttribute('fill', color);
    }
  }
}

const tooltip = computed(() => tooltips.value[0]);

// Renders what a function returns, for the caller's tooltip slot.
const Render = (own: { render: () => VNodeChild }) => own.render();
</script>

<template>
  <ChartFrame
    :definition="() => definition"
    :label="ariaLabel"
    :height="props.height"
    :tooltip="() => tooltips.length > 0"
    :tooltip-attrs="() => tooltip?.attrs ?? {}"
    :data-orientation="props.orientation"
    v-model:tick-size="tickSize"
    v-bind="$attrs"
    @render="onRender"
  >
    <slot />

    <template #tooltip="{ point }">
      <Render v-if="tooltip?.slot" :render="() => tooltip!.slot!(tooltipProps(point.datum.row)) as VNodeChild" />
      <template v-else>
        <div v-if="point.datum.row[props.xKey] !== undefined" data-part="tooltip-heading">
          {{ xText(point.datum.row) }}
        </div>
        <div data-part="tooltip-rows">
          <div v-for="entry in tooltipSeries(point.datum.row)" :key="entry.key" data-part="tooltip-row">
            <span data-part="tooltip-swatch" :style="{ background: entry.color }" />
            <span data-part="tooltip-label">{{ entry.label }}</span>
            <span data-part="tooltip-value">{{ entry.text }}</span>
          </div>
        </div>
      </template>
    </template>
  </ChartFrame>
</template>

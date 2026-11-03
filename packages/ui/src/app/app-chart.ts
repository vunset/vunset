import type { HTMLAttributes } from 'vue';

/** What AppChartArea, AppChartLine and AppChartBar each take. */
export interface AppChartProps {
  /** The rows, one per point along the x axis. */
  data: Record<string, any>[];
  /** The keys plotted, one series each. */
  categories: string[];
  /** The key naming each row, along the x axis. */
  xKey: string;
  /** Formats the `x-key` values on the axis and in the tooltip. */
  xFormat?: (value: any) => string;
  /** Formats the values on the axis and in the tooltip. */
  yFormat?: (value: any) => string;
  /** Names a series in the legend, the tooltip and the chart's accessible name. */
  labelFormat?: (category: string) => string;
  /** How many row labels the x axis aims for. */
  numTicks?: number;
  /** A title along the x axis. */
  xLabel?: string;
  /** A title along the value axis. */
  yLabel?: string;
  /** One per category. Defaults to `var(--chart-color-N)`. */
  colors?: string[];
  /** How many `--chart-color-N` the theme defines: series past it start over at the first. @default 8 */
  paletteSize?: number;
  /** A number means pixels. @default '20rem' */
  height?: number | string;
  /** Categories not drawn, for `v-model:hidden`. */
  hidden?: string[];
  /** The chart's accessible name. Defaults to its series. */
  label?: string;
  /** Switches above the chart, one per series. Defaults to on for more than one. */
  legend?: boolean;
  /** @default true */
  xAxis?: boolean;
  /** @default true */
  yAxis?: boolean;
  /** Draw the x axis' own line along the plot's edge. */
  xAxisLine?: boolean;
  /** Draw the value axis' own line along the plot's edge. */
  yAxisLine?: boolean;
  /** Lines across at the value ticks. @default true */
  grid?: boolean;
  /** Shows the values under the pointer. @default true */
  tooltip?: boolean;
  /** A class for the tooltip's box. */
  tooltipClass?: HTMLAttributes['class'];
  /** Where the legend sits: above the drawing, or below it. @default 'top' */
  legendPlacement?: 'top' | 'bottom';
  /** A class for the legend. */
  legendClass?: HTMLAttributes['class'];
  /** A class for each legend button. */
  legendItemClass?: HTMLAttributes['class'];
  /** `row`: every series at the row under the pointer. `point`: the one point nearest it. @default 'row' */
  tooltipMode?: 'row' | 'point';
  /** A click, Enter or Space pins the tooltip in place. @default true */
  tooltipSticky?: boolean;
  /** Formats the tooltip's heading apart from the x axis' ticks. Defaults to `x-format`. */
  tooltipHeadingFormat?: (value: any) => string;
}

/** AppChartArea's and AppChartLine's: bars need rows spaced evenly. */
export interface AppChartXScaleProps {
  /**
   * Where the rows sit along the x axis: evenly, in order; by their `x-key`
   * number with `linear`; or on a scale factory, such as d3-scale's `scaleUtc`.
   * @default 'category'
   */
  xScale?: 'category' | 'linear' | (() => unknown);
}

export const APP_CHART_DEFAULTS = {
  height: '20rem',
  hidden: undefined,
  legend: undefined,
  xAxis: true,
  yAxis: true,
  grid: true,
  tooltip: true,
  tooltipMode: 'row',
  tooltipSticky: true
} as const;

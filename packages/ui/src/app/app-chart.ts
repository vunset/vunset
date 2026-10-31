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
  /** One per category. Defaults to `var(--chart-color-N)`. */
  colors?: string[];
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
  /** Lines across at the value ticks. @default true */
  grid?: boolean;
  /** Shows the values under the pointer. @default true */
  tooltip?: boolean;
  /** A class for the tooltip's box. */
  tooltipClass?: HTMLAttributes['class'];
}

export const APP_CHART_DEFAULTS = {
  height: '20rem',
  hidden: undefined,
  legend: undefined,
  xAxis: true,
  yAxis: true,
  grid: true,
  tooltip: true
} as const;

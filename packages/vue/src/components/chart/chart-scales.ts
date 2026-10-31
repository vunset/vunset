import type { ChartCurve } from '@tanstack/charts';
import { formatNumber } from '@vunset/utils';
import { monotoneAreaPath, monotonePath } from './chart-curve';

/**
 * An evenly spaced few of a row axis' positions, for `numTicks`. The axis
 * labels every row otherwise, leaving out the ones that would collide.
 */
export function rowTicks(length: number, count: number | undefined): number[] | undefined {
  if (count === undefined) return undefined;

  const step = Math.max(1, Math.ceil(length / Math.max(1, count)));
  return Array.from({ length }, (_, index) => index).filter((index) => index % step === 0);
}

/** TanStack's own tick label size, in px, until `--chart-tick-font-size` sets one. */
export const TICK_FONT_SIZE = 11;

/** An axis' tick labels at `size` px; TanStack lays the axis out for it. */
export const tickLabels = (size: number | undefined) => (size === undefined ? {} : { tickLabels: { fontSize: size } });

/** A row's `xKey` value as its axis label. */
export function rowLabel(row: Record<string, any> | undefined, xKey: string, format?: (value: any) => string) {
  const raw = row?.[xKey];
  return raw === undefined ? '' : format ? format(raw) : String(raw);
}

/** A value axis label: the caller's formatter, or a grouped number. */
export const valueLabel = (raw: number, format?: (value: any) => string) =>
  format ? format(raw) : formatNumber(raw);

/** A plotted value, or a gap where the row has none. */
export const plotted = (raw: unknown) => (typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined);

/**
 * Every series at the row under the pointer. The default only focuses a point
 * within 48 pixels, which leaves dead zones between sparse rows.
 */
export const rowFocus = (horizontal = false) => ({
  focus: horizontal ? ('group-y' as const) : ('group-x' as const),
  maxFocusDistance: Number.POSITIVE_INFINITY
});

/** A chart's accessible name: what it plots, in the reader's words. */
export const chartName = (categories: string[], labelFormat: ((category: string) => string) | undefined, fallback: string) =>
  categories.map((category) => (labelFormat ? labelFormat(category) : category)).join(', ') || fallback;

// Monotone: it bends through the points but never past them, so a peak is drawn at its value.
const SMOOTH: ChartCurve = { line: monotonePath, area: monotoneAreaPath };

/** A line's run between its points: bending through them, or straight. TanStack draws straight by default. */
export const curveOf = (curve: 'smooth' | 'linear') => (curve === 'smooth' ? SMOOTH : undefined);

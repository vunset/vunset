import type { ChartCurve } from '@tanstack/charts';
import { formatNumber } from '@vunset/utils';
import { monotoneAreaPath, monotonePath } from './chart-curve';

// Without `numTicks` the axis labels every row, leaving out the ones that would collide.
export function rowTicks(length: number, count: number | undefined): number[] | undefined {
  if (count === undefined) return undefined;

  const step = Math.max(1, Math.ceil(length / Math.max(1, count)));
  return Array.from({ length }, (_, index) => index).filter((index) => index % step === 0);
}

// TanStack's own tick label size, until `--chart-tick-font-size` sets one.
export const TICK_FONT_SIZE = 11;

// Off under reduced motion, never on resize.
export const SVG_ANIMATION = { duration: 240, easing: 'ease-out' } as const;

export const tickLabels = (size: number | undefined) => (size === undefined ? {} : { tickLabels: { fontSize: size } });

export function rowLabel(row: Record<string, any> | undefined, xKey: string, format?: (value: any) => string) {
  const raw = row?.[xKey];
  if (raw === undefined) return '';
  if (format) return format(raw);
  return raw instanceof Date ? raw.toLocaleString() : String(raw);
}

export const valueLabel = (raw: number, format?: (value: any) => string) => (format ? format(raw) : formatNumber(raw));

export const plotted = (raw: unknown) => (typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined);

// TanStack's default only focuses a point within 48px, leaving dead zones between sparse rows.
export const rowFocus = (horizontal = false) => ({
  focus: horizontal ? ('group-y' as const) : ('group-x' as const),
  maxFocusDistance: Number.POSITIVE_INFINITY
});

export const pointFocus = { focus: 'nearest' as const, maxFocusDistance: Number.POSITIVE_INFINITY };

export const chartName = (
  categories: string[],
  labelFormat: ((category: string) => string) | undefined,
  fallback: string
) => categories.map((category) => (labelFormat ? labelFormat(category) : category)).join(', ') || fallback;

// Monotone: it bends through the points but never past them, so a peak is drawn at its value.
const SMOOTH: ChartCurve = { line: monotonePath, area: monotoneAreaPath };

export const curveOf = (curve: 'smooth' | 'linear') => (curve === 'smooth' ? SMOOTH : undefined);

export const CHART_COLOR_PREFIX = '--chart-color-';

/**
 * One `var()` per series. Past the palette a theme defines, a series falls back
 * to the text color rather than to nothing.
 */
export function chartColors(count: number, prefix = CHART_COLOR_PREFIX, fallback = 'currentColor'): string[] {
  return Array.from({ length: count }, (_, index) => `var(${prefix}${index}, ${fallback})`);
}

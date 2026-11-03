export const CHART_COLOR_PREFIX = '--chart-color-';

/**
 * One `var()` per series. Past the palette a theme defines, a series falls back
 * to the text color rather than to nothing.
 */
export function chartColors(count: number, prefix = CHART_COLOR_PREFIX, fallback = 'currentColor'): string[] {
  return Array.from({ length: count }, (_, index) => `var(${prefix}${index}, ${fallback})`);
}

export interface ChartRowsKeys {
  /** The key whose value names a row, such as a timestamp. */
  x: string;
  /** The key whose value names a series, such as a node. */
  series: string;
  /** The key holding the plotted value. */
  value: string;
}

export interface ChartRows {
  /** One per `x` value: it under `x`, and each series' value under the series' name. */
  rows: Record<string, any>[];
  /** The series, in the order first met. */
  series: string[];
}

const sortKey = (value: unknown) => (value instanceof Date ? value.getTime() : value);

/**
 * Records of one value each (a time, a node, a load) into the rows a chart
 * takes: one per `x`, a key per series. Dates and numbers come out in order;
 * a series missing at a row leaves a gap there.
 */
export function toChartRows(records: readonly Record<string, any>[], keys: ChartRowsKeys): ChartRows {
  const rows = new Map<unknown, Record<string, any>>();
  const series = new Set<string>();
  for (const record of records) {
    const x = record[keys.x];
    const name = String(record[keys.series]);
    series.add(name);
    const id = sortKey(x);
    let row = rows.get(id);
    if (!row) rows.set(id, (row = { [keys.x]: x }));
    row[name] = record[keys.value];
  }
  const list = [...rows.values()];
  if (list.every((row) => typeof sortKey(row[keys.x]) === 'number')) {
    list.sort((a, b) => (sortKey(a[keys.x]) as number) - (sortKey(b[keys.x]) as number));
  }
  return { rows: list, series: [...series] };
}

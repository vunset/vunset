import { describe, expect, it } from 'vitest';
import { chartColors, toChartRows } from '../src/chart';

const KEYS = { x: 'date', series: 'node', value: 'load' };

describe('toChartRows', () => {
  it('makes a row per x, with a key per series', () => {
    const { rows, series } = toChartRows(
      [
        { date: 1, node: 'a', load: 10 },
        { date: 2, node: 'a', load: 20 },
        { date: 1, node: 'b', load: 30 }
      ],
      KEYS
    );
    expect(series).toEqual(['a', 'b']);
    expect(rows).toEqual([
      { date: 1, a: 10, b: 30 },
      { date: 2, a: 20 }
    ]);
  });

  it('puts dates in order, matching equal times', () => {
    const { rows } = toChartRows(
      [
        { date: new Date(2000), node: 'a', load: 2 },
        { date: new Date(1000), node: 'b', load: 1 },
        { date: new Date(2000), node: 'b', load: 3 }
      ],
      KEYS
    );
    expect(rows.map((row) => row.date.getTime())).toEqual([1000, 2000]);
    expect(rows[1]).toMatchObject({ a: 2, b: 3 });
  });

  it('keeps labels in the order met', () => {
    const { rows } = toChartRows(
      [
        { date: 'Mar', node: 'a', load: 1 },
        { date: 'Jan', node: 'a', load: 2 }
      ],
      KEYS
    );
    expect(rows.map((row) => row.date)).toEqual(['Mar', 'Jan']);
  });
});

describe('chartColors', () => {
  it('names a palette color per series', () => {
    expect(chartColors(2)).toEqual(['var(--chart-color-0, currentColor)', 'var(--chart-color-1, currentColor)']);
  });

  it('starts over past the palette, eight by default', () => {
    const colors = chartColors(10);
    expect(colors[8]).toBe(colors[0]);
    expect(colors[9]).toBe(colors[1]);
  });

  it('cycles at the size given', () => {
    const colors = chartColors(13, undefined, undefined, 11);
    expect(colors[10]).toBe('var(--chart-color-10, currentColor)');
    expect(colors[11]).toBe(colors[0]);
  });
});

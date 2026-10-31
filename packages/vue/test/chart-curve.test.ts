import { describe, it, expect } from 'vitest';
import { monotoneAreaPath, monotonePath } from '../src/components/chart/chart-curve';

type Point = [number, number];

// Each cubic segment of a path as [start, control1, control2, end].
function segments(path: string): Point[][] {
  const numbers = (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const [start, ...rest] = [numbers.slice(0, 2) as Point, numbers.slice(2)];
  const result: Point[][] = [];
  let from = start;
  for (let index = 0; index + 6 <= rest[0].length; index += 6) {
    const [c1x, c1y, c2x, c2y, x, y] = rest[0].slice(index, index + 6);
    result.push([from, [c1x, c1y], [c2x, c2y], [x, y]]);
    from = [x, y];
  }
  return result;
}

// The y values a cubic segment passes through, sampled finely.
function sampled([p0, p1, p2, p3]: Point[]): number[] {
  return Array.from({ length: 101 }, (_, step) => {
    const t = step / 100;
    const u = 1 - t;
    return u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  });
}

describe('monotonePath', () => {
  it('draws nothing, a dot, or a straight line for too few points to bend', () => {
    expect(monotonePath([])).toBe('');
    expect(monotonePath([[4, 2]])).toBe('M4,2Z');
    expect(monotonePath([[0, 0], [10, 5]])).toBe('M0,0L10,5');
  });

  it('passes through every point, one cubic segment per gap', () => {
    const points: Point[] = [[0, 10], [10, 40], [20, 25], [30, 60]];
    const parts = segments(monotonePath(points));
    expect(parts).toHaveLength(3);
    expect(parts.map((part) => part[0])).toEqual(points.slice(0, 3));
    expect(parts.map((part) => part[3])).toEqual(points.slice(1));
  });

  it('never bends past a point: each segment stays between its two values', () => {
    const points: Point[] = [[0, 0], [10, 100], [12, 0], [40, 90], [41, 90], [60, 5], [61, 80]];
    for (const part of segments(monotonePath(points))) {
      const [low, high] = [Math.min(part[0][1], part[3][1]), Math.max(part[0][1], part[3][1])];
      for (const y of sampled(part)) {
        expect(y).toBeGreaterThanOrEqual(low - 1e-9);
        expect(y).toBeLessThanOrEqual(high + 1e-9);
      }
    }
  });

  it('keeps a flat run flat, and a peak level at its value', () => {
    const flat = segments(monotonePath([[0, 5], [10, 5], [20, 5], [30, 5]]));
    expect(flat.flat().every(([, y]) => y === 5)).toBe(true);

    const [rise, fall] = segments(monotonePath([[0, 0], [10, 10], [20, 0]]));
    expect(rise[2][1]).toBe(10);
    expect(fall[1][1]).toBe(10);
  });

  it('survives two points at one x', () => {
    const path = monotonePath([[0, 1], [0, 2], [10, 3]]);
    expect(path).not.toMatch(/NaN|Infinity/);
    expect(path.startsWith('M0,1')).toBe(true);
    expect(path.endsWith(',10,3')).toBe(true);
  });

  it('rounds to thousandths of a pixel', () => {
    expect(monotonePath([[0, 0], [1, 1], [2, 0]])).not.toMatch(/\.\d{4}/);
  });
});

describe('monotoneAreaPath', () => {
  it('runs along the top, back along the bottom, and closes', () => {
    const top: Point[] = [[0, 10], [10, 30], [20, 20]];
    const bottom: Point[] = [[0, 50], [10, 50], [20, 50]];
    const path = monotoneAreaPath(top, bottom);

    expect(path.startsWith(monotonePath(top))).toBe(true);
    expect(path).toContain('L20,50');
    expect(path.endsWith(',0,50Z')).toBe(true);
  });

  it('draws nothing without points', () => {
    expect(monotoneAreaPath([], [])).toBe('');
  });
});

type Point = readonly [x: number, y: number];

// Thousandths of a pixel: finer changes nothing on screen, only lengthens the path.
const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * Each tangent of a monotone cubic through `points` (Steffen's limiter): the
 * curve bends through every point but never past one, so a peak is drawn at
 * its value. The ends take the tangent that leaves the curve straight there.
 */
function monotoneTangents(points: readonly Point[]): number[] {
  const last = points.length - 1;
  const widths: number[] = [];
  const slopes: number[] = [];
  for (let index = 0; index < last; index++) {
    const width = points[index + 1][0] - points[index][0];
    widths.push(width);
    const rise = points[index + 1][1] - points[index][1];
    // A vertical step is as steep as it gets; the limiter then takes the other side's slope.
    slopes.push(width ? rise / width : rise ? Math.sign(rise) * Infinity : 0);
  }

  const tangents = new Array<number>(points.length).fill(0);
  for (let index = 1; index < last; index++) {
    const [before, after] = [slopes[index - 1], slopes[index]];
    const span = widths[index - 1] + widths[index];
    const weighted = span ? (before * widths[index] + after * widths[index - 1]) / span : 0;
    tangents[index] =
      (Math.sign(before) + Math.sign(after)) * Math.min(Math.abs(before), Math.abs(after), 0.5 * Math.abs(weighted));
  }
  tangents[0] = widths[0] ? (3 * slopes[0] - tangents[1]) / 2 : tangents[1];
  tangents[last] = widths[last - 1] ? (3 * slopes[last - 1] - tangents[last - 1]) / 2 : tangents[last - 1];
  return tangents.map((tangent) => (Number.isFinite(tangent) ? tangent : 0));
}

/** The path commands after the first point: cubic segments, or a straight one between two points. */
function monotoneSegments(points: readonly Point[]): string[] {
  if (points.length < 3) return points.slice(1).map(([x, y]) => `L${round(x)},${round(y)}`);

  const tangents = monotoneTangents(points);
  return points.slice(1).map(([x, y], offset) => {
    const [startX, startY] = points[offset];
    const third = (x - startX) / 3;
    return `C${round(startX + third)},${round(startY + tangents[offset] * third)},${round(x - third)},${round(y - tangents[offset + 1] * third)},${round(x)},${round(y)}`;
  });
}

/** An SVG path bending smoothly through `points`, in `x` order, without overshooting any of them. */
export function monotonePath(points: readonly Point[]): string {
  if (points.length === 0) return '';
  const start = `M${round(points[0][0])},${round(points[0][1])}`;
  return points.length === 1 ? `${start}Z` : start + monotoneSegments(points).join('');
}

/**
 * The closed SVG path between two such curves: along `top`, then back along
 * `bottom`. Both run through the same `x` positions, in order.
 */
export function monotoneAreaPath(top: readonly Point[], bottom: readonly Point[]): string {
  if (top.length === 0 || bottom.length === 0) return '';
  const back = [...bottom].reverse();
  const along = monotoneSegments(top).join('');
  const returning = monotoneSegments(back).join('');
  return `M${round(top[0][0])},${round(top[0][1])}${along}L${round(back[0][0])},${round(back[0][1])}${returning}Z`;
}

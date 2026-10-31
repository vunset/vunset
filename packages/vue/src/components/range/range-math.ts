/** What a dragged thumb does on meeting another. */
export type ThumbCollisionBehavior = 'push' | 'swap' | 'none';

/** The numbers every value is measured against. */
export interface Scale {
  min: number;
  max: number;
  step: number;
  /** The smallest distance between neighboring thumbs. */
  gap: number;
}

export const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** Where `value` sits between `min` and `max`, in percent. `NaN` for an empty interval. */
export const toPercent = (value: number, { min, max }: Scale) => ((value - min) / (max - min)) * 100;

/** Digits after the point, read off the exponent form so `1e-7` counts as seven. */
function decimals(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const [mantissa = '', exponent = '0'] = value.toExponential().split('e');
  return Math.max(0, (mantissa.split('.')[1]?.length ?? 0) - Number(exponent));
}

/** Rounds away float noise at the finest precision any of `sources` carries. */
export function tidy(value: number, ...sources: number[]): number {
  return Number(value.toFixed(Math.max(0, ...sources.map(decimals))));
}

/** The grid value nearest `value`, counting from `min`. */
export function snap(value: number, { min, step }: Scale): number {
  return tidy(min + Math.round((value - min) / step) * step, min, step);
}

/** How far thumb `index` may go without crowding a neighbor. */
export function roomFor(values: readonly number[], index: number, scale: Scale): [low: number, high: number] {
  const below = values[index - 1];
  const above = values[index + 1];
  const low = below === undefined ? scale.min : tidy(below + scale.gap, below, scale.gap);
  const high = above === undefined ? scale.max : tidy(above - scale.gap, above, scale.gap);
  return [Math.max(low, scale.min), Math.min(high, scale.max)];
}

export interface DragResult {
  values: number[];
  /** The thumb holding the drag afterwards; only a swap changes it. */
  index: number;
}

/**
 * Moves thumb `index` towards `target` during a drag.
 *
 * `origin` is the values as the drag began: a pushed thumb falls back towards
 * where it stood then, and never past it.
 */
export function dragTo(
  values: readonly number[],
  index: number,
  target: number,
  scale: Scale,
  behavior: ThumbCollisionBehavior,
  origin: readonly number[] = values
): DragResult {
  const last = values.length - 1;
  // Far enough from either end that every other thumb still fits.
  const reachable = clamp(
    target,
    tidy(scale.min + index * scale.gap, scale.min, scale.gap),
    tidy(scale.max - (last - index) * scale.gap, scale.max, scale.gap)
  );

  if (behavior === 'push') return { values: push(origin, index, reachable, scale.gap), index };
  if (behavior === 'swap') return swap(values, index, target, scale);

  const next = [...values];
  next[index] = clamp(reachable, ...roomFor(values, index, scale));
  return { values: next, index };
}

/** Each thumb beyond the dragged one keeps a gap from its neighbor, or its own origin, whichever is further out. */
function push(origin: readonly number[], index: number, target: number, gap: number): number[] {
  const next = [...origin];
  next[index] = target;

  for (let i = index + 1; i < next.length; i += 1) {
    next[i] = Math.max(origin[i]!, tidy(next[i - 1]! + gap, next[i - 1]!, gap));
  }
  for (let i = index - 1; i >= 0; i -= 1) {
    next[i] = Math.min(origin[i]!, tidy(next[i + 1]! - gap, next[i + 1]!, gap));
  }

  return next;
}

/**
 * The drag moves into whichever slot `target` now falls in. The thumbs it
 * passed keep their values; only a thumb moved strictly past counts, so
 * meeting a neighbor exactly is not yet a swap.
 */
function swap(values: readonly number[], index: number, target: number, scale: Scale): DragResult {
  const others = values.filter((_, i) => i !== index);
  const slot = others.filter((value, i) => value < target || (value === target && i < index)).length;

  const next = [...others];
  next.splice(slot, 0, target);

  const [low, high] = roomFor(next, slot, scale);
  if (low > high) {
    // No gap-sized room between the thumbs passed: stay put, held at the neighbor.
    const stay = [...values];
    stay[index] = clamp(target, ...roomFor(values, index, scale));
    return { values: stay, index };
  }

  next[slot] = clamp(target, low, high);
  return { values: next, index: slot };
}

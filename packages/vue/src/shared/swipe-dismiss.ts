/** The release rules for everything dismissed with a swipe: drawer and toast. */

/** How far, in pixels, a pull the wrong way can stretch at most. */
const OVER_PULL_LIMIT = 48;

/**
 * Rubber-banding for a pull the element cannot follow: it gives at first, then
 * stiffens towards {@link OVER_PULL_LIMIT}. Keeps the sign of `distance`.
 */
export function resist(distance: number): number {
  const pull = Math.abs(distance);
  return (Math.sign(distance) * pull * OVER_PULL_LIMIT) / (pull + OVER_PULL_LIMIT);
}

export interface SwipeRelease {
  /** Distance traveled towards dismissal, in pixels; negative the other way. */
  traveled: number;
  /** Speed towards dismissal at release, in pixels per millisecond. */
  velocity: number;
  /** The element's size along the swipe. */
  size: number;
  /** Fraction of `size` past which a release dismisses. @default 0.4 */
  distanceRatio?: number;
  /** Speed past which a shorter release still dismisses, as a flick. @default 0.4 */
  flickSpeed?: number;
}

export function dismissesOnRelease(release: SwipeRelease): boolean {
  const { traveled, velocity, size, distanceRatio = 0.4, flickSpeed = 0.4 } = release;
  if (size <= 0) return false;

  // A flick still has to cover some ground, or a twitch at speed would dismiss.
  const flicked = velocity > flickSpeed && traveled > Math.max(16, size * 0.05);
  return traveled > distanceRatio * size || flicked;
}

/** Speed along one coordinate, taken from the two most recent samples. */
export function createVelocity(position: number, time: number) {
  let lastPosition = position;
  let lastTime = time;
  let speed = 0;

  return {
    sample(position: number, time: number): void {
      const elapsed = time - lastTime;
      if (elapsed <= 0) return;

      speed = (position - lastPosition) / elapsed;
      lastPosition = position;
      lastTime = time;
    },
    /** Pixels per millisecond, signed along the coordinate. */
    speed: (): number => speed
  };
}

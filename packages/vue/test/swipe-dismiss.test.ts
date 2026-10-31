import { describe, it, expect } from 'vitest';
import { createVelocity, dismissesOnRelease, resist } from '../src/shared/swipe-dismiss';

describe('swipe dismissal', () => {
  it('dismisses past the distance ratio of the element’s size', () => {
    expect(dismissesOnRelease({ traveled: 41, velocity: 0, size: 100 })).toBe(true);
    expect(dismissesOnRelease({ traveled: 39, velocity: 0, size: 100 })).toBe(false);
  });

  it('dismisses a flick short of the distance, once it has covered some ground', () => {
    expect(dismissesOnRelease({ traveled: 20, velocity: 1, size: 100 })).toBe(true);
    expect(dismissesOnRelease({ traveled: 10, velocity: 1, size: 100 })).toBe(false);
  });

  it('never dismisses an element with no size, such as one not laid out', () => {
    expect(dismissesOnRelease({ traveled: 500, velocity: 5, size: 0 })).toBe(false);
  });

  it('resists a pull the wrong way, keeping its sign and staying under the limit', () => {
    expect(resist(-1000)).toBeLessThan(0);
    expect(resist(-1000)).toBeGreaterThan(-48);
    expect(resist(10)).toBeGreaterThan(0);
    expect(resist(10)).toBeLessThan(10);
  });

  it('measures speed from the latest two samples', () => {
    const velocity = createVelocity(0, 0);
    velocity.sample(100, 100);
    velocity.sample(300, 200);
    expect(velocity.speed()).toBe(2);
  });
});

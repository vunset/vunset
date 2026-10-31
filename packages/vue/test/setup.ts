/**
 * jsdom implements neither ResizeObserver nor the Web Animations API. Both are
 * optional in the components under test — this stubs them so the suite exercises
 * the path a real browser takes rather than the graceful-degradation fallback.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in globalThis)) {
  (globalThis as any).ResizeObserver = ResizeObserverStub;
}

if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

/**
 * A `PointerEvent` whose `timeStamp` a test can set.
 *
 * `timeStamp` is read-only and stamped at construction, so events dispatched
 * back-to-back in a test are microseconds apart and every gesture computes an
 * impossible velocity — a slow drag reads as a flick. Setting it is how a test
 * expresses a drag's real speed.
 *
 * jsdom used to ship no `PointerEvent` at all, and this also stood in for it
 * (extending `MouseEvent` alone drops `pointerType`, which silently made every
 * synthetic touch look like a mouse). It ships one now, so this extends
 * whatever is there rather than only filling a hole — the gate that used to
 * skip it entirely is what let the drag tests go quietly meaningless.
 */
const PointerEventBase: typeof MouseEvent =
  'PointerEvent' in globalThis ? (globalThis as any).PointerEvent : MouseEvent;

(globalThis as any).PointerEvent = class TestPointerEvent extends PointerEventBase {
  pointerType: string;
  pointerId: number;

  constructor(type: string, params: PointerEventInit & { timeStamp?: number } = {}) {
    super(type, params);
    this.pointerType = (this as any).pointerType ?? params.pointerType ?? 'mouse';
    this.pointerId = (this as any).pointerId ?? params.pointerId ?? 1;

    if (params.timeStamp !== undefined) {
      Object.defineProperty(this, 'timeStamp', { value: params.timeStamp });
    }
  }
} as any;

/**
 * Components here teleport into `document.body` and register themselves in a
 * module-level dismiss stack. Without unmounting between tests, both leak: a
 * later query finds an earlier test's popup, and stale layers keep intercepting
 * Escape. Auto-unmount disposes the scopes; clearing the body catches anything
 * that escaped it.
 */
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, beforeEach } from 'vitest';

enableAutoUnmount(afterEach);

// Cleared before the next test rather than after the previous one: wiping the
// body in an `afterEach` races with Vue's own unmount, which then tries to
// remove nodes that are already gone.
beforeEach(() => {
  document.body.innerHTML = '';
});

/**
 * jsdom performs no layout, so every element reports a zero-sized rect at the
 * origin. Floating UI then sees overflow on all sides and flips placements
 * arbitrarily, which makes placement untestable.
 *
 * Giving elements a small, sane box inside the viewport lets Floating UI's real
 * algorithm run on plausible input. This verifies which placement is *requested*
 * and resolved in the non-colliding case; genuine collision behavior — flipping
 * near a viewport edge — still needs a real browser.
 */
import { layout, resetLayout } from './layout';

function rect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x, y, width, height,
    top: y, left: x, right: x + width, bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;
}

Element.prototype.getBoundingClientRect = function getBoundingClientRect(this: Element) {
  // The root and body define the clipping viewport. Giving them the same small
  // box as everything else makes Floating UI believe the viewport is tiny, so
  // every placement overflows and flips — the whole point is that they are big.
  if (this === document.documentElement || this === document.body) {
    return rect(0, 0, layout.viewport.width, layout.viewport.height);
  }
  const { x, y, width, height } = layout.box;
  return rect(x, y, width, height);
};

/**
 * Floating UI measures the floating element with `offsetWidth`/`offsetHeight`,
 * which jsdom reports as 0. A zero-sized popup overflows nothing, so collision
 * handling never triggers on size — only on position. Without this, a test can
 * appear to verify flipping while actually proving nothing about the element's
 * dimensions.
 */
for (const prop of ['offsetWidth', 'offsetHeight'] as const) {
  Object.defineProperty(HTMLElement.prototype, prop, {
    configurable: true,
    get(this: HTMLElement) {
      if (this === document.documentElement || this === document.body) {
        return prop === 'offsetWidth' ? layout.viewport.width : layout.viewport.height;
      }
      return prop === 'offsetWidth' ? layout.box.width : layout.box.height;
    },
  });
}

/**
 * jsdom reports `scrollHeight` as 0, which item alignment reads as "the popup is
 * all chrome and no content" — nonsense geometry that makes it give up before
 * any of the wiring runs. Reporting the element's own box means "nothing
 * overflows", the honest answer where there is no layout.
 */
for (const prop of ['scrollWidth', 'scrollHeight'] as const) {
  Object.defineProperty(Element.prototype, prop, {
    configurable: true,
    get(this: Element) {
      if (this === document.documentElement || this === document.body) {
        return prop === 'scrollWidth' ? layout.viewport.width : layout.viewport.height;
      }
      return prop === 'scrollWidth' ? layout.box.width : layout.box.height;
    },
  });
}

// Floating UI reads these for the viewport; jsdom reports 0 for both.
for (const prop of ['clientWidth', 'clientHeight'] as const) {
  Object.defineProperty(document.documentElement, prop, {
    configurable: true,
    get: () => (prop === 'clientWidth' ? layout.viewport.width : layout.viewport.height),
  });
}

beforeEach(resetLayout);

// jsdom has no layout, so it implements no scrolling. Stubbing it keeps the
// call exercised rather than silently skipped by the optional-call guard.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

/**
 * jsdom reports `offsetParent` as null for every element, which is how a browser
 * says "not rendered". Focus helpers filter on it, so every tabbable list came
 * back empty and initial focus always fell through to the container. Null only
 * where a browser would agree: detached or under `display: none`.
 */
Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  configurable: true,
  get(this: HTMLElement) {
    if (!this.isConnected || this === document.body) return null;
    for (let el: Element | null = this; el; el = el.parentElement) {
      if (getComputedStyle(el).display === 'none') return null;
    }
    return this.parentElement;
  },
});

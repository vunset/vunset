// jsdom lacks ResizeObserver and Web Animations; stubbed so tests take a real browser's path, not the fallback.
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

// `timeStamp` is read-only and stamped at construction, so back-to-back events read as a flick; this lets a test set it.
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

// Teleported popups and the module-level dismiss stack leak between tests without unmounting.
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, beforeEach } from 'vitest';

enableAutoUnmount(afterEach);

// Before, not after: clearing in `afterEach` races Vue's own unmount.
beforeEach(() => {
  document.body.innerHTML = '';
});

// jsdom has no layout; a small box inside the viewport lets Floating UI resolve placements (collisions need a real browser).
import { layout, resetLayout } from './layout';

function rect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x, y, width, height,
    top: y, left: x, right: x + width, bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;
}

Element.prototype.getBoundingClientRect = function getBoundingClientRect(this: Element) {
  // The root and body are the clipping viewport, so they must be big or every placement flips.
  if (this === document.documentElement || this === document.body) {
    return rect(0, 0, layout.viewport.width, layout.viewport.height);
  }
  const { x, y, width, height } = layout.box;
  return rect(x, y, width, height);
};

// jsdom reports 0, and a zero-sized popup never collides on size.
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

// jsdom reports 0, which item alignment reads as all chrome and no content; the own box means nothing overflows.
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

// Stubbed so the call runs instead of being skipped by the optional-call guard.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// jsdom reports null everywhere, which focus helpers read as not rendered; null only when detached or `display: none`.
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

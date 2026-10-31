import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { ScrollArea } from '../src';

/**
 * jsdom performs no layout: every element reports a zero box and never scrolls.
 * Overriding the geometry on the one element under test gives the composable
 * plausible numbers to read, and a handle for the test to scroll it by.
 */
interface Geometry {
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
  scrollTop: number;
  scrollLeft: number;
}

function fakeGeometry(element: HTMLElement, initial: Partial<Geometry> = {}): Geometry {
  const geometry: Geometry = {
    clientWidth: 0,
    clientHeight: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    scrollTop: 0,
    scrollLeft: 0,
    ...initial,
  };

  for (const key of Object.keys(geometry) as (keyof Geometry)[]) {
    Object.defineProperty(element, key, {
      configurable: true,
      get: () => geometry[key],
      set: (value: number) => {
        geometry[key] = value;
      },
    });
  }

  return geometry;
}

/**
 * The stub in `test/setup.ts` never calls back, which would leave every resize
 * path untested. This one records its instances so a test can deliver the
 * notification itself.
 */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];

  targets = new Set<Element>();

  constructor(private callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  observe(element: Element) {
    this.targets.add(element);
  }

  unobserve(element: Element) {
    this.targets.delete(element);
  }

  disconnect() {
    this.targets.clear();
  }

  fire() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

let originalResizeObserver: typeof ResizeObserver;

beforeEach(() => {
  FakeResizeObserver.instances = [];
  originalResizeObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

/** Delivers a resize to every live observer, as a browser would. */
async function resize() {
  for (const observer of FakeResizeObserver.instances) {
    observer.fire();
  }
  await nextTick();
}

function mountScrollArea(props: Record<string, any> = {}, slots?: any) {
  return mount(ScrollArea as any, {
    props,
    slots: slots ?? { default: () => h('div', { class: 'content' }, 'content') },
    attachTo: document.body,
  });
}

const viewport = (w: any) => w.element as HTMLElement;
const attrs = (w: any) => w.attributes();
/** Everything `defineExpose` hands back, untyped through the `any` mount. */
const api = (w: any) => w.vm as any;
const cssVar = (w: any, name: string) => viewport(w).style.getPropertyValue(name);

/** A 200×100 viewport holding 200×400 of content: vertical overflow only. */
function tallContent(w: any) {
  return fakeGeometry(viewport(w), {
    clientWidth: 200,
    clientHeight: 100,
    scrollWidth: 200,
    scrollHeight: 400,
  });
}

async function scrollTo(w: any, geometry: Geometry, position: Partial<Geometry>) {
  Object.assign(geometry, position);
  viewport(w).dispatchEvent(new Event('scroll'));
  await nextTick();
}

describe('ScrollArea', () => {
  describe('rendering', () => {
    it('renders one scrolling element with the content inside it', () => {
      const w = mountScrollArea();
      expect(viewport(w).tagName).toBe('DIV');
      expect(viewport(w).style.overflowX).toBe('auto');
      expect(viewport(w).style.overflowY).toBe('auto');
      expect(w.find('.content').exists()).toBe(true);
    });

    it('clips the axis it was told not to scroll', () => {
      // The overflow it writes is an inline style, which a stylesheet cannot
      // outrank — so a one-way strip needs the prop rather than a class.
      const w = mountScrollArea({ axis: 'x' });
      expect(viewport(w).style.overflowX).toBe('auto');
      expect(viewport(w).style.overflowY).toBe('hidden');
    });

    it('renders a different tag when asked', () => {
      const w = mountScrollArea({ as: 'section' });
      expect(viewport(w).tagName).toBe('SECTION');
    });
  });

  describe('overflow state', () => {
    it('reports no overflow when the content fits', async () => {
      const w = mountScrollArea();
      fakeGeometry(viewport(w), {
        clientWidth: 200,
        clientHeight: 100,
        scrollWidth: 200,
        scrollHeight: 100,
      });
      await resize();

      expect(attrs(w)).not.toHaveProperty('data-has-overflow-y');
      expect(attrs(w)).not.toHaveProperty('data-has-overflow-x');
      expect(attrs(w)).not.toHaveProperty('data-overflow-y-end');
    });

    it('marks the axis that overflows, and only that one', async () => {
      const w = mountScrollArea();
      tallContent(w);
      await resize();

      expect(attrs(w)).toHaveProperty('data-has-overflow-y');
      expect(attrs(w)).not.toHaveProperty('data-has-overflow-x');
    });

    it('flags the end edge at rest and the start edge once scrolled away', async () => {
      const w = mountScrollArea();
      const geometry = tallContent(w);
      await resize();

      // Pinned to the top: everything is below, nothing above.
      expect(attrs(w)).toHaveProperty('data-overflow-y-end');
      expect(attrs(w)).not.toHaveProperty('data-overflow-y-start');

      await scrollTo(w, geometry, { scrollTop: 150 });
      expect(attrs(w)).toHaveProperty('data-overflow-y-start');
      expect(attrs(w)).toHaveProperty('data-overflow-y-end');

      await scrollTo(w, geometry, { scrollTop: 300 });
      expect(attrs(w)).toHaveProperty('data-overflow-y-start');
      expect(attrs(w)).not.toHaveProperty('data-overflow-y-end');
    });

    it('treats a sub-pixel gap as having reached the edge', async () => {
      // Fractional layout and browser zoom leave the last fraction of a pixel
      // unscrolled; without the tolerance the end fade would never go away.
      const w = mountScrollArea();
      const geometry = tallContent(w);
      await resize();

      await scrollTo(w, geometry, { scrollTop: 299.5 });
      expect(attrs(w)).not.toHaveProperty('data-overflow-y-end');
      expect(cssVar(w, '--scroll-area-overflow-y-end')).toBe('0px');
    });

    it('treats a sub-pixel offset from the start as still at the start', async () => {
      const w = mountScrollArea();
      const geometry = tallContent(w);
      await resize();

      await scrollTo(w, geometry, { scrollTop: 0.5 });
      expect(attrs(w)).not.toHaveProperty('data-overflow-y-start');
      expect(cssVar(w, '--scroll-area-overflow-y-start')).toBe('0px');
    });

    it('reads a right-to-left scroll position, where scrollLeft counts down', async () => {
      const w = mountScrollArea();
      const geometry = fakeGeometry(viewport(w), {
        clientWidth: 200,
        clientHeight: 100,
        scrollWidth: 600,
        scrollHeight: 100,
      });
      await resize();

      await scrollTo(w, geometry, { scrollLeft: -120 });
      expect(cssVar(w, '--scroll-area-overflow-x-start')).toBe('120px');
      expect(cssVar(w, '--scroll-area-overflow-x-end')).toBe('280px');
    });

    it('holds the flags until the content has moved past the threshold', async () => {
      const w = mountScrollArea({ overflowThreshold: 20 });
      const geometry = tallContent(w);
      await resize();

      await scrollTo(w, geometry, { scrollTop: 12 });
      expect(attrs(w)).not.toHaveProperty('data-overflow-y-start');

      // Exactly at the threshold still counts as sitting at the edge.
      await scrollTo(w, geometry, { scrollTop: 20 });
      expect(attrs(w)).not.toHaveProperty('data-overflow-y-start');

      await scrollTo(w, geometry, { scrollTop: 40 });
      expect(attrs(w)).toHaveProperty('data-overflow-y-start');
    });

    it('re-decides the same geometry when the threshold changes', async () => {
      const w = mountScrollArea({ overflowThreshold: 20 });
      const geometry = tallContent(w);
      await resize();
      await scrollTo(w, geometry, { scrollTop: 12 });
      expect(attrs(w)).not.toHaveProperty('data-overflow-y-start');

      await w.setProps({ overflowThreshold: 5 });
      await nextTick();
      expect(attrs(w)).toHaveProperty('data-overflow-y-start');
    });
  });

  describe('css variables', () => {
    it('publishes the distance to each edge in pixels', async () => {
      const w = mountScrollArea();
      const geometry = tallContent(w);
      await resize();

      expect(cssVar(w, '--scroll-area-overflow-y-start')).toBe('0px');
      expect(cssVar(w, '--scroll-area-overflow-y-end')).toBe('300px');

      await scrollTo(w, geometry, { scrollTop: 120 });
      expect(cssVar(w, '--scroll-area-overflow-y-start')).toBe('120px');
      expect(cssVar(w, '--scroll-area-overflow-y-end')).toBe('180px');
    });

    it('publishes zeroes on an axis with nothing to scroll', async () => {
      // The fade formula reads all four unconditionally; a missing variable
      // would invalidate the whole `min()` and drop the mask entirely.
      const w = mountScrollArea();
      tallContent(w);
      await resize();

      expect(cssVar(w, '--scroll-area-overflow-x-start')).toBe('0px');
      expect(cssVar(w, '--scroll-area-overflow-x-end')).toBe('0px');
    });
  });

  describe('fade', () => {
    const mask = (w: any) => (api(w).rootProps.style as Record<string, string>).maskImage;

    it('applies no mask by default', () => {
      const w = mountScrollArea();
      expect(api(w).rootProps.style).not.toHaveProperty('maskImage');
    });

    it('masks one axis when asked for one', () => {
      const w = mountScrollArea({ fade: 'y' });
      expect(mask(w)).toContain('to bottom');
      expect(mask(w)).not.toContain('to right');
      expect(api(w).rootProps.style).not.toHaveProperty('maskComposite');
    });

    it('masks both axes, intersected, when asked for both', () => {
      const w = mountScrollArea({ fade: true });
      expect(mask(w)).toContain('to right');
      expect(mask(w)).toContain('to bottom');
      // Added together, the two layers would keep everything and fade nothing.
      expect(api(w).rootProps.style.maskComposite).toBe('intersect');
    });

    it('ramps the mask from the published overflow distance', () => {
      const w = mountScrollArea({ fade: 'y' });
      expect(mask(w)).toContain(
        'min(var(--scroll-area-fade-size, 40px), var(--scroll-area-overflow-y-start, 0px))',
      );
    });

    it('aims the horizontal fade at the start edge, wherever that is', async () => {
      // The variables are logical: `x-start` is the right-hand side in RTL, so
      // a gradient fixed to `to right` would fade the wrong end of the row.
      const w = mount(ScrollArea as any, {
        props: { fade: 'x' },
        attrs: { style: 'direction: rtl' },
        slots: { default: () => h('div', { class: 'content' }) },
        attachTo: document.body,
      });
      await resize();

      expect(api(w).rootProps.style.maskImage).toContain('to left');
    });

    it('takes a fade size, as a number of pixels or a length', () => {
      const w = mountScrollArea({ fade: 'y', fadeSize: 24 });
      expect(api(w).rootProps.style['--scroll-area-fade-size']).toBe('24px');

      const custom = mountScrollArea({ fade: 'y', fadeSize: '3rem' });
      expect(api(custom).rootProps.style['--scroll-area-fade-size']).toBe('3rem');
    });

    it('leaves the size to CSS when no prop is given', () => {
      const w = mountScrollArea({ fade: 'y' });
      expect(api(w).rootProps.style).not.toHaveProperty('--scroll-area-fade-size');
    });
  });

  describe('keyboard reachability', () => {
    it('is a tab stop only while there is something to scroll', async () => {
      const w = mountScrollArea();
      const geometry = tallContent(w);
      expect(attrs(w).tabindex).toBe('-1');

      await resize();
      expect(attrs(w).tabindex).toBe('0');

      Object.assign(geometry, { scrollHeight: 100 });
      await resize();
      expect(attrs(w).tabindex).toBe('-1');
    });
  });

  describe('measuring', () => {
    it('watches the content, not just the viewport', async () => {
      // The viewport's own box never changes when what is inside it grows, so
      // observing only the viewport would miss every content change.
      const w = mountScrollArea();
      const observer = FakeResizeObserver.instances.at(-1)!;

      expect(observer.targets.has(viewport(w))).toBe(true);
      expect(observer.targets.has(w.find('.content').element)).toBe(true);
    });

    it('notices content that grows past the viewport', async () => {
      const w = mountScrollArea();
      const geometry = tallContent(w);
      Object.assign(geometry, { scrollHeight: 100 });
      await resize();
      expect(attrs(w)).not.toHaveProperty('data-has-overflow-y');

      Object.assign(geometry, { scrollHeight: 400 });
      await resize();
      expect(attrs(w)).toHaveProperty('data-has-overflow-y');
    });

    it('picks up content appended after mount', async () => {
      const w = mountScrollArea();
      const extra = document.createElement('div');
      viewport(w).appendChild(extra);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(FakeResizeObserver.instances.at(-1)!.targets.has(extra)).toBe(true);
    });

    it('exposes measure for content no observer can see', async () => {
      const w = mountScrollArea();
      const geometry = tallContent(w);
      Object.assign(geometry, { scrollHeight: 100 });
      await resize();
      expect(attrs(w)).not.toHaveProperty('data-has-overflow-y');

      // A web font landing changes the scrollable height without resizing
      // anything the observer holds.
      Object.assign(geometry, { scrollHeight: 400 });
      api(w).measure();
      await nextTick();
      expect(attrs(w)).toHaveProperty('data-has-overflow-y');
    });
  });

  describe('composition', () => {
    it('runs the caller’s own scroll handler alongside the measuring one', async () => {
      let calls = 0;
      const w = mount(ScrollArea as any, {
        attrs: {
          onScroll: () => {
            calls += 1;
          },
        },
        slots: { default: () => h('div', { class: 'content' }) },
        attachTo: document.body,
      });
      const geometry = tallContent(w);
      await resize();

      await scrollTo(w, geometry, { scrollTop: 50 });
      expect(calls).toBe(1);
      expect(cssVar(w, '--scroll-area-overflow-y-start')).toBe('50px');
    });

    it('lets a class and a style ride alongside the ones it sets', async () => {
      const w = mount(ScrollArea as any, {
        props: { fade: 'y' },
        attrs: { class: 'List', style: 'overflow-x: hidden' },
        slots: { default: () => h('div', { class: 'content' }) },
        attachTo: document.body,
      });

      expect(w.classes()).toContain('List');
      expect(viewport(w).style.overflowX).toBe('hidden');
    });
  });
});

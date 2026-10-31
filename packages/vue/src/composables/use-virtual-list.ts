import {
  computed,
  onMounted,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref
} from 'vue';

export interface UseVirtualListOptions<T> {
  items: MaybeRefOrGetter<T[]>;
  /** Every item is this tall. Measure it once and pass it in; it is not re-read. */
  itemHeight: MaybeRefOrGetter<number>;
  /** @default true */
  enabled?: MaybeRefOrGetter<boolean | undefined>;
  /** The element that scrolls. Left out, the list follows the page instead. */
  scroller?: Ref<HTMLElement | null | undefined>;
  /** The element the first item is drawn at the top of — a `<tbody>`, a listbox. */
  list?: Ref<HTMLElement | null | undefined>;
  /** Items drawn past each edge of the viewport. @default 20 */
  overscan?: MaybeRefOrGetter<number | undefined>;
  /** How close to an edge of what is drawn the viewport may get before redrawing. @default half of `overscan` */
  threshold?: MaybeRefOrGetter<number | undefined>;
}

export interface UseVirtualListReturn<T> {
  /** Index of the first item drawn. */
  start: ComputedRef<number>;
  /** Index after the last item drawn. */
  end: ComputedRef<number>;
  visible: ComputedRef<T[]>;
  /** Space to leave before the drawn items, in pixels. */
  before: ComputedRef<number>;
  /** Space to leave after them. */
  after: ComputedRef<number>;
  /** Brings an item into view, at the top of the viewport. */
  scrollToIndex: (index: number) => void;
}

/**
 * Draws only the items near the viewport of a long list, with spacers standing
 * in for the rest.
 */
export function useVirtualList<T>(options: UseVirtualListOptions<T>): UseVirtualListReturn<T> {
  const overscan = () => toValue(options.overscan) ?? 20;
  const threshold = () => toValue(options.threshold) ?? Math.floor(overscan() / 2);

  const enabled = () => toValue(options.enabled) ?? true;
  const items = computed(() => toValue(options.items));
  const height = () => Math.max(1, toValue(options.itemHeight));
  const total = computed(() => items.value.length);

  const start = ref(0);
  const end = ref(Math.min(total.value, overscan() * 2));

  let offset = 0;
  // The scroller's ancestors that clip it. A scroller with no height of its own grows to hold every
  // item, and what really scrolls is one of these, or the page.
  let clips: HTMLElement[] = [];

  function clipsOf(element: HTMLElement): HTMLElement[] {
    const found: HTMLElement[] = [];
    for (let el = element.parentElement; el && el !== document.body; el = el.parentElement) {
      if (getComputedStyle(el).overflowY !== 'visible') found.push(el);
    }
    return found;
  }

  // The part of the scroller's own viewport that is on screen, from its top.
  function shown(scroller: HTMLElement): { top: number; skipped: number; height: number } {
    const own = scroller.getBoundingClientRect().top + scroller.clientTop;
    let top = Math.max(own, 0);
    let bottom = Math.min(own + (scroller.clientHeight || window.innerHeight), window.innerHeight);
    for (const clip of clips) {
      const edge = clip.getBoundingClientRect().top + clip.clientTop;
      top = Math.max(top, edge);
      bottom = Math.min(bottom, edge + clip.clientHeight);
    }
    return { top, skipped: Math.max(0, top - own), height: Math.max(0, bottom - top) };
  }

  function view(): { position: number; viewport: number } {
    const scroller = options.scroller?.value;
    const list = options.list?.value;
    if (scroller) {
      const { skipped, height } = shown(scroller);
      return { position: Math.max(0, scroller.scrollTop + skipped - offset), viewport: height };
    }
    const viewport = typeof window === 'undefined' ? 0 : window.innerHeight;
    return { position: list ? Math.max(0, -list.getBoundingClientRect().top) : 0, viewport };
  }

  function measure(): void {
    const scroller = options.scroller?.value;
    const list = options.list?.value;
    clips = scroller ? clipsOf(scroller) : [];
    offset =
      scroller && list
        ? list.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
        : 0;
  }

  function update(force = false): void {
    const count = total.value;
    const { position, viewport } = view();
    const first = Math.min(Math.max(Math.floor(position / height()), 0), count);
    const last = Math.min(first + Math.ceil(viewport / height()) + 1, count);

    // A change in length is always forced, from the watch below.
    const stale = force || first - start.value < threshold() || end.value - last < threshold();

    if (!stale) return;

    start.value = Math.max(first - overscan(), 0);
    end.value = Math.min(last + overscan(), count);
  }

  let frame = 0;
  function onScroll(): void {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  }

  function onResize(): void {
    measure();
    update(true);
  }

  let cleanup: (() => void) | null = null;

  function listen(): void {
    cleanup?.();
    if (typeof window === 'undefined' || !enabled()) return;

    const scroller = options.scroller?.value;
    // Captured on the window: a scroll anywhere above may move the list, and scroll doesn't bubble.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onResize);

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize);
    const observed = scroller ?? options.list?.value;
    if (observed) observer?.observe(observed);

    cleanup = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
      cleanup = null;
    };

    onResize();
  }

  onMounted(listen);
  watch(() => [options.scroller?.value, options.list?.value, enabled()], listen, { flush: 'post' });
  watch([total, () => toValue(options.itemHeight), overscan], () => update(true));
  onScopeDispose(() => cleanup?.());

  const visible = computed(() => (enabled() ? items.value.slice(start.value, end.value) : items.value));
  const before = computed(() => (enabled() ? start.value * height() : 0));
  const after = computed(() => (enabled() ? Math.max(0, (total.value - end.value) * height()) : 0));

  function scrollToIndex(index: number): void {
    const top = offset + Math.max(0, index) * height();
    const scroller = options.scroller?.value;
    if (scroller) {
      scroller.scrollTop = top;
      // It couldn't get there itself: it holds every item, so move what scrolls it.
      if (scroller.scrollTop >= top) return;
      const by =
        scroller.getBoundingClientRect().top + scroller.clientTop + top - scroller.scrollTop - shown(scroller).top;
      const outer = clips.find((clip) => clip.scrollHeight > clip.clientHeight);
      if (outer) outer.scrollTop += by;
      else window.scrollBy({ top: by });
    } else if (typeof window !== 'undefined') {
      const list = options.list?.value;
      window.scrollTo({ top: (list ? list.getBoundingClientRect().top + window.scrollY : 0) + index * height() });
    }
  }

  return {
    start: computed(() => (enabled() ? start.value : 0)),
    end: computed(() => (enabled() ? end.value : total.value)),
    visible,
    before,
    after,
    scrollToIndex
  };
}

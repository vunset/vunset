import { computed, onMounted, onScopeDispose, ref, toValue, watch, type ComponentPublicInstance, type MaybeRefOrGetter, type Ref } from 'vue';
import { useRequestFetch, type AsyncDataRequestStatus } from '#app';

export interface UseInfinityFetchOptions {
  /**
   * The list: an element or a component (its root element), a template ref or a getter. The next page loads
   * once its end is in view: its bottom within the window, and, when it scrolls itself (a table capped to a
   * height, a panel), scrolled to its own end.
   */
  el: MaybeRefOrGetter<Element | ComponentPublicInstance | null | undefined>;
  /** How many pixels before the end the next page starts loading. @default 0 */
  offset?: number;
  /** Where the page's items are in the response, when it isn't the list itself. */
  dataKey?: string;
  /** `POST` sends the query, with `page`, as the body. @default 'GET' */
  method?: 'GET' | 'POST';
  /** Sent with every page; a change starts over from the first. */
  query?: MaybeRefOrGetter<Record<string, unknown> | undefined>;
}

export interface UseInfinityFetchReturn<T> {
  /** Every page loaded so far, in order. */
  data: Ref<T[]>;
  /** `end` once a page comes back empty. */
  status: Ref<AsyncDataRequestStatus | 'end'>;
  /** Starts over from the first page. */
  refresh: () => void;
  /** The next page to load. */
  currentPage: Ref<number>;
}

/** A list fetched a page at a time, the next one as its end scrolls into view. */
export function useInfinityFetch<T>(url: string, options: UseInfinityFetchOptions): UseInfinityFetchReturn<T> {
  // Untyped: the route is a runtime string, so Nuxt's typed routes can't check it.
  const request = useRequestFetch() as (url: string, options: Record<string, unknown>) => Promise<unknown>;
  const data = ref<T[]>([]) as Ref<T[]>;
  const page = ref(1);
  const status = ref<AsyncDataRequestStatus | 'end'>('idle');
  const query = computed(() => toValue(options.query));

  async function fetchPage() {
    if (status.value === 'pending' || status.value === 'end') return;
    status.value = 'pending';

    const params = { ...query.value, page: page.value };
    const method = options.method ?? 'GET';
    const response = await request(url, method === 'POST' ? { method, body: params } : { method, query: params });
    const items = (options.dataKey ? (response as Record<string, unknown>)[options.dataKey] : response) as T[] | undefined;

    if (!items || items.length === 0) {
      status.value = 'end';
      return;
    }

    data.value = [...data.value, ...items];
    page.value += 1;
    status.value = 'idle';
  }

  function refresh() {
    page.value = 1;
    data.value = [];
    status.value = 'idle';
    void fetchPage();
  }

  watch(query, refresh, { deep: true });

  onMounted(() => {
    void fetchPage();

    const check = () => {
      const value = toValue(options.el);
      const target = value instanceof Element ? value : value?.$el;
      if (!(target instanceof Element)) return;

      const offset = options.offset ?? 0;
      // A list that doesn't scroll itself has nothing left to scroll, so only the window counts; a box capped
      // to a height is always in the window, so only its own scroll counts.
      const inWindow = target.getBoundingClientRect().bottom <= window.innerHeight + offset;
      const scrolledToEnd = target.scrollHeight - target.scrollTop - target.clientHeight <= offset;

      if (inWindow && scrolledToEnd) void fetchPage();
    };

    // Captured, so a scroll inside any scrolling ancestor counts too.
    window.addEventListener('scroll', check, { capture: true, passive: true });
    window.addEventListener('resize', check, { passive: true });
    // A page that leaves the end still in view loads the next at once. After the render, so the
    // page's items are measured, not the list as it was before them.
    watch(status, (value) => value === 'idle' && check(), { flush: 'post' });

    onScopeDispose(() => {
      window.removeEventListener('scroll', check, { capture: true });
      window.removeEventListener('resize', check);
    });
  });

  return { data, status, refresh, currentPage: page };
}

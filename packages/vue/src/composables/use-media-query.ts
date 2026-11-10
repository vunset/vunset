import { getCurrentInstance, onMounted, onScopeDispose, readonly, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';

export interface UseMediaQueryOptions {
  /** What it holds on the server, and in a component until it mounts. @default false */
  ssrValue?: boolean;
}

/** Whether `query` matches, kept up to date as the page resizes or the setting changes. */
export function useMediaQuery(query: MaybeRefOrGetter<string>, options: UseMediaQueryOptions = {}): Readonly<Ref<boolean>> {
  const fallback = options.ssrValue ?? false;
  const matches = ref(fallback);

  // In a component, read on mount: the server rendered `ssrValue`, and hydration has to see the same.
  const ready = ref(!getCurrentInstance());
  if (!ready.value) onMounted(() => (ready.value = true));

  let list: MediaQueryList | undefined;
  const follow = (event: MediaQueryListEvent) => (matches.value = event.matches);

  function release() {
    list?.removeEventListener?.('change', follow);
    list = undefined;
  }

  watch(
    [() => toValue(query), ready],
    ([value, ok]) => {
      release();
      if (!ok || typeof window === 'undefined' || !window.matchMedia) return;
      list = window.matchMedia(value);
      list.addEventListener?.('change', follow);
      matches.value = list.matches;
    },
    { immediate: true }
  );

  onScopeDispose(release);

  return readonly(matches);
}

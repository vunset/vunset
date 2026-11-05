import { computed, toValue, useAttrs, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { mergeProps } from './merge-props';

/** Merges a prop bag with the caller's attrs. The part needs `inheritAttrs: false`, or Vue applies them twice. */
export function usePartProps(bag: MaybeRefOrGetter<Record<string, unknown>>): ComputedRef<Record<string, unknown>> {
  const attrs = useAttrs();
  return computed(() => mergeProps(toValue(bag), attrs));
}

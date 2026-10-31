import { computed, toValue, useAttrs, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { mergeProps } from './merge-props';

/**
 * Merges a composable's prop bag with the caller's fallthrough attrs.
 *
 * Components using it must declare `inheritAttrs: false`, or Vue applies the
 * attrs a second time and the merge is bypassed.
 */
export function usePartProps(bag: MaybeRefOrGetter<Record<string, unknown>>): ComputedRef<Record<string, unknown>> {
  const attrs = useAttrs();
  return computed(() => mergeProps(toValue(bag), attrs));
}

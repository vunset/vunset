import { toValue, watch, onScopeDispose, type MaybeRefOrGetter } from 'vue';
import { pushDismissLayer, type DismissReason } from './dismiss-stack';

export interface UseDismissOptions {
  enabled: MaybeRefOrGetter<boolean>;
  /** Elements that count as inside. A press on any of these will not dismiss. */
  elements: () => (HTMLElement | null)[];
  onDismiss: (reason: DismissReason) => void;
  escapeKey?: MaybeRefOrGetter<boolean>;
  outsidePress?: MaybeRefOrGetter<boolean>;
  /** Whether this layer covers what is beneath it. */
  modal?: MaybeRefOrGetter<boolean>;
}

export function useDismiss(options: UseDismissOptions): void {
  let remove: (() => void) | null = null;

  watch(
    () => toValue(options.enabled),
    (enabled) => {
      remove?.();
      remove = null;

      // On the server the watcher never disposes, so a pushed layer would outlive the request.
      if (!enabled || typeof document === 'undefined') return;

      remove = pushDismissLayer({
        elements: options.elements,
        dismiss: options.onDismiss,
        escapeKey: () => toValue(options.escapeKey) ?? true,
        outsidePress: () => toValue(options.outsidePress) ?? true,
        modal: () => toValue(options.modal) ?? false
      });
    },
    { immediate: true, flush: 'post' }
  );

  onScopeDispose(() => remove?.());
}

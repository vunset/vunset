import {
  computed,
  getCurrentInstance,
  ref,
  toValue,
  watchEffect,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { onRecycle } from './recycle';

export interface UseControlledOptions<T> {
  /** The controlled value. Anything but `undefined` makes the value controlled. */
  value: MaybeRefOrGetter<T | undefined>;
  /** The initial value used while uncontrolled. */
  defaultValue: MaybeRefOrGetter<T>;
  /**
   * The component prop holding the value. Bound at all, it makes the value controlled too, even to
   * `undefined`: a `v-model` on a ref that starts out empty.
   */
  prop?: string;
  /** What a bound `undefined` reads as. */
  empty?: MaybeRefOrGetter<T>;
  /** Notified on every write. Wire this to `update:<name>` to support `v-model`. */
  onChange?: (value: T) => void;
  /** Component name, used in the development warning. */
  name?: string;
  /** Value name, used in the development warning. */
  label?: string;
}

/** Whether the current component's caller bound `prop`, whatever it holds. */
export function isPropBound(prop: string): boolean {
  const props = getCurrentInstance()?.vnode.props;
  if (!props) return false;
  return prop in props || prop.replace(/\B([A-Z])/g, '-$1').toLowerCase() in props;
}

/** A value that may be owned by the caller or by the component. */
export function useControlled<T>(options: UseControlledOptions<T>): WritableComputedRef<T> {
  const { value, defaultValue, prop, empty, onChange, name = 'Component', label = 'value' } = options;

  const isControlled = (prop !== undefined && isPropBound(prop)) || toValue(value) !== undefined;
  const internal = ref(toValue(defaultValue)) as Ref<T>;
  // Owned here, it belongs to the item the part was drawn for: a new one starts from the default.
  if (!isControlled) onRecycle(() => (internal.value = toValue(defaultValue)));

  if (process.env.NODE_ENV !== 'production') {
    let warned = false;
    watchEffect(() => {
      const defined = toValue(value) !== undefined;
      // A bound prop may hold `undefined`; only a value turning up unbound is a switch.
      const switched = prop ? !isControlled && defined : defined !== isControlled;
      if (!warned && switched) {
        warned = true;
        console.warn(
          `[${name}] The ${label} changed from ${isControlled ? '' : 'un'}controlled to ` +
            `${isControlled ? 'un' : ''}controlled. Pick one for the lifetime of the component.`
        );
      }
    });
  }

  const read = (): T => {
    const current = toValue(value);
    return (current === undefined ? toValue(empty) : current) as T;
  };

  return computed({
    get: () => (isControlled ? read() : internal.value),
    set(next) {
      if (!isControlled) {
        internal.value = next;
      }
      onChange?.(next);
    }
  });
}

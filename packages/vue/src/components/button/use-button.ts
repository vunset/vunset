import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { dataAttrs } from '../../shared/data-attrs';
import { dispatchClickWithModifiers } from '../../shared/dispatch-click-with-modifiers';

export interface ButtonState {
  disabled: boolean;
}

export interface UseButtonOptions {
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  /** Only ever set on a real `<button>`. @default 'button' */
  type?: MaybeRefOrGetter<'button' | 'submit' | 'reset' | undefined>;
  /** Whether a real `<button>` is being rendered. @default true */
  native?: MaybeRefOrGetter<boolean | undefined>;
  /** Whether the element navigates. @default false */
  link?: MaybeRefOrGetter<boolean | undefined>;
  /** Keep a disabled button in the tab order. @default false */
  focusableWhenDisabled?: MaybeRefOrGetter<boolean | undefined>;
}

export interface UseButtonReturn {
  state: ComputedRef<ButtonState>;
  rootProps: ComputedRef<Record<string, unknown>>;
}

export function useButton(options: UseButtonOptions = {}): UseButtonReturn {
  const disabled = () => toValue(options.disabled) ?? false;
  const native = () => toValue(options.native) ?? true;
  const link = () => toValue(options.link) ?? false;
  const focusableWhenDisabled = () => toValue(options.focusableWhenDisabled) ?? false;

  const state = computed<ButtonState>(() => ({
    disabled: disabled()
  }));

  const hooks = computed(() => dataAttrs(state.value));

  const needsKeyboard = () => !native() && !link();

  const rootProps = computed(() => ({
    'data-part': 'button',
    ...hooks.value,
    type: native() ? (toValue(options.type) ?? 'button') : undefined,
    disabled: native() && !focusableWhenDisabled() ? disabled() || undefined : undefined,
    'aria-disabled': disabled() && (!native() || focusableWhenDisabled()) ? ('true' as const) : undefined,
    role: needsKeyboard() ? 'button' : undefined,
    tabindex: needsKeyboard() ? (disabled() && !focusableWhenDisabled() ? -1 : 0) : undefined,

    onClickCapture(event: MouseEvent) {
      if (disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },

    onKeydown(event: KeyboardEvent) {
      if (disabled() || !needsKeyboard()) return;

      if (event.key === 'Enter') {
        event.preventDefault();
        dispatchClickWithModifiers(event.currentTarget as HTMLElement, event, { bubbles: true });
        return;
      }

      if (event.key === ' ') event.preventDefault();
    },

    onKeyup(event: KeyboardEvent) {
      if (disabled() || !needsKeyboard() || event.key !== ' ') return;
      event.preventDefault();
      dispatchClickWithModifiers(event.currentTarget as HTMLElement, event, { bubbles: true });
    }
  }));

  return { state, rootProps };
}

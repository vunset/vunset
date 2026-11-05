import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue';
import { visuallyHidden } from './visually-hidden';

/** What the visible element announces itself as. */
export type ToggleRole = 'switch' | 'checkbox' | 'radio';

export interface UseToggleInputOptions {
  role: ToggleRole;
  /** The hidden input's type. A `radio` groups natively by `name`, so arrows and submission just work. */
  inputType?: 'checkbox' | 'radio';
  checked: () => boolean;
  /** Checkboxes only: a press resolves it to checked rather than cycling through it. */
  indeterminate?: () => boolean;
  disabled?: () => boolean;
  readOnly?: () => boolean;
  required?: () => boolean;
  id?: () => string | undefined;
  name?: () => string | undefined;
  value?: () => string | undefined;
  form?: () => string | undefined;
  /** The ids of the text describing the control, a field's description and error. */
  describedBy?: () => string | undefined;
  /** Whether the visible element is a real `<button>`, which keys itself. */
  native?: () => boolean;
  /** Tab position. A roving group hands out `0` to one member and `-1` to the rest. */
  tabindex?: () => number | undefined;
  hooks: () => Record<string, string>;
  onToggle: (next: boolean, event: Event) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

export interface UseToggleInputReturn {
  rootEl: Ref<HTMLElement | null>;
  inputEl: Ref<HTMLInputElement | null>;
  rootProps: ComputedRef<Record<string, unknown>>;
  inputProps: ComputedRef<Record<string, unknown>>;
  /** Whether to render the input: only a `name` or a wrapping `<label>` has a use for it. */
  rendersInput: ComputedRef<boolean>;
  activate: (event?: Event) => void;
}

// Shared by switch, checkbox and radio: a hidden native input behind a styled element, for forms, labels and radio grouping.
// Owns no state: `checked` is read and changes go out through `onToggle`, since a radio's value lives in its group.
export function useToggleInput(options: UseToggleInputOptions): UseToggleInputReturn {
  const rootEl = ref<HTMLElement | null>(null);
  const inputEl = ref<HTMLInputElement | null>(null);

  const disabled = () => options.disabled?.() ?? false;
  const readOnly = () => options.readOnly?.() ?? false;
  const required = () => options.required?.() ?? false;
  const native = () => options.native?.() ?? false;
  const indeterminate = () => options.indeterminate?.() ?? false;
  const name = () => options.name?.();

  // Known only once mounted, so the server and the first client render agree on leaving it out.
  const inLabel = ref(false);
  onMounted(() => {
    inLabel.value = rootEl.value?.closest('label') != null;
  });
  const rendersInput = computed(() => Boolean(name()) || inLabel.value);

  /** Every press ends here: the input, when there is one, toggles itself, so the change is a native one. */
  function activate(event?: Event) {
    if (disabled() || readOnly()) return;
    if (inputEl.value) inputEl.value.click();
    else options.onToggle(!options.checked(), event ?? new Event('change'));
  }

  const rootProps = computed(() => ({
    ...options.hooks(),
    id: options.id?.(),
    role: options.role,
    // `mixed` is the one value the three roles disagree on.
    'aria-checked': indeterminate() ? 'mixed' : options.checked(),
    'aria-readonly': readOnly() || undefined,
    'aria-required': required() || undefined,
    'aria-disabled': disabled() || undefined,
    'aria-describedby': options.describedBy?.(),
    // A real button would otherwise submit a surrounding form, and stays focusable unless disabled outright.
    type: native() ? 'button' : undefined,
    disabled: (native() && disabled()) || undefined,
    // A non-native element gets no keyboard activation, so a button's two paths are reproduced below.
    tabindex: options.tabindex ? options.tabindex() : native() || disabled() ? undefined : 0,
    ref: (el: unknown) => {
      rootEl.value = (el as HTMLElement) ?? null;
    },
    onFocus: options.onFocus,
    onBlur: options.onBlur,
    onClick(event: MouseEvent) {
      // Otherwise the root's own default (form submit, label activation) would be a second press.
      event.preventDefault();
      activate(event);
    },
    onKeydown(event: KeyboardEvent) {
      if (native() || disabled() || event.target !== event.currentTarget) {
        return;
      }
      if (event.key === ' ') {
        // Suppress the page scroll; Space activates on keyup, as it does natively.
        event.preventDefault();
      } else if (event.key === 'Enter' && !event.defaultPrevented) {
        event.preventDefault();
        (event.currentTarget as HTMLElement).click();
      }
    },
    onKeyup(event: KeyboardEvent) {
      if (native() || disabled() || event.defaultPrevented) {
        return;
      }
      if (event.key === ' ' && event.target === event.currentTarget) {
        (event.currentTarget as HTMLElement).click();
      }
    },
  }));

  const inputProps = computed(() => ({
    type: options.inputType ?? 'checkbox',
    name: name(),
    value: options.value?.(),
    form: options.form?.(),
    disabled: disabled(),
    checked: options.checked(),
    // A property: there is no `indeterminate` attribute.
    indeterminate: indeterminate(),
    // Out of sight and out of the tab order: the root is the control.
    style: visuallyHidden,
    tabindex: -1,
    'aria-hidden': true,
    ref: (el: unknown) => {
      inputEl.value = (el as HTMLInputElement) ?? null;
    },
    onClick(event: MouseEvent) {
      // The sender already bubbled the user's own click; this one stops here.
      event.stopPropagation();
      // A label skips the root's guard; canceling makes the browser undo the toggle and skip `change`.
      if (readOnly()) event.preventDefault();
    },
    onChange(event: Event) {
      options.onToggle((event.target as HTMLInputElement).checked, event);
    },
    // Focus sent here — by a label, or by a form reporting it invalid — is the root's.
    onFocus: () => rootEl.value?.focus(),
  }));

  return { rootEl, inputEl, rootProps, inputProps, rendersInput, activate };
}

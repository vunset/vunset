import { computed, onMounted, ref, type ComputedRef, type Ref } from 'vue';
import { visuallyHidden } from './visually-hidden';

/** What the visible element announces itself as. */
export type ToggleRole = 'switch' | 'checkbox' | 'radio';

export interface UseToggleInputOptions {
  role: ToggleRole;
  /**
   * The hidden input's own type. A `radio` groups natively by `name`, which is
   * what makes arrow keys and form submission behave without any help.
   */
  inputType?: 'checkbox' | 'radio';
  /** Whether the control is on. Read, never written — the caller owns it. */
  checked: () => boolean;
  /**
   * Neither on nor off. Checkboxes only: it is a presentation state, so a press
   * resolves it to checked rather than cycling back through it.
   */
  indeterminate?: () => boolean;
  disabled?: () => boolean;
  readOnly?: () => boolean;
  required?: () => boolean;
  id?: () => string | undefined;
  name?: () => string | undefined;
  /** Submitted when checked. */
  value?: () => string | undefined;
  form?: () => string | undefined;
  /** The ids of the text describing the control, a field's description and error. */
  describedBy?: () => string | undefined;
  /** Whether the visible element is a real `<button>`, which keys itself. */
  native?: () => boolean;
  /** Tab position. A roving group hands out `0` to one member and `-1` to the rest. */
  tabindex?: () => number | undefined;
  /** The `data-*` hooks to put on every part. */
  hooks: () => Record<string, string>;
  /** Called when the control is activated, with the state it is moving to. */
  onToggle: (next: boolean, event: Event) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
}

export interface UseToggleInputReturn {
  /** The visible element. */
  rootEl: Ref<HTMLElement | null>;
  /** The hidden input behind it. */
  inputEl: Ref<HTMLInputElement | null>;
  rootProps: ComputedRef<Record<string, unknown>>;
  inputProps: ComputedRef<Record<string, unknown>>;
  /** Whether to render the input: only a `name` or a wrapping `<label>` has a use for it. */
  rendersInput: ComputedRef<boolean>;
  /** Activates the control as a press would, respecting disabled and readOnly. */
  activate: (event?: Event) => void;
}

/**
 * The wiring shared by every control that is a hidden native input with
 * something styled in front of it — switch, checkbox, radio.
 *
 * The input is what makes the control submit with a form, respond to a
 * wrapping `<label>` and — for radios — group by `name` so the browser enforces
 * exclusivity. Presses on the visible element are forwarded to it, so a change
 * originates natively. Without a name or a label it has no use, and a root may
 * leave it out (`rendersInput`): a page of unnamed row checkboxes then carries
 * no inputs at all, and the press toggles directly.
 *
 * Deliberately owns no state of its own: `checked` is read through a getter and
 * changes are reported through `onToggle`. A switch and a checkbox own their
 * boolean; a radio owns nothing, because the group it belongs to holds the one
 * value shared between its members. One engine serves all three only because it
 * stays out of that question.
 */
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
    // `mixed` is the third state a checkbox can be in, and the only place the
    // three roles disagree about what `aria-checked` may say.
    'aria-checked': indeterminate() ? 'mixed' : options.checked(),
    'aria-readonly': readOnly() || undefined,
    'aria-required': required() || undefined,
    'aria-disabled': disabled() || undefined,
    'aria-describedby': options.describedBy?.(),
    // A real button would otherwise submit a surrounding form, and stays focusable unless disabled outright.
    type: native() ? 'button' : undefined,
    disabled: (native() && disabled()) || undefined,
    // A non-native element gets no keyboard behavior from the browser, so a
    // native button's two activation paths are reproduced below.
    tabindex: options.tabindex ? options.tabindex() : native() || disabled() ? undefined : 0,
    ref: (el: unknown) => {
      rootEl.value = (el as HTMLElement) ?? null;
    },
    onFocus: options.onFocus,
    onBlur: options.onBlur,
    onClick(event: MouseEvent) {
      // Left to run, the root's own default — submitting a form as a button, or
      // activating a wrapping label's input — would be a second press.
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
    // What the form reads.
    type: options.inputType ?? 'checkbox',
    name: name(),
    value: options.value?.(),
    form: options.form?.(),
    disabled: disabled(),
    checked: options.checked(),
    // A DOM property rather than an attribute: there is no `indeterminate`
    // attribute to write, which is why it survives no round trip through HTML.
    indeterminate: indeterminate(),
    // Out of sight and out of the tab order: the root is the control. Never
    // displaced from it, though — see `visuallyHidden`.
    style: visuallyHidden,
    tabindex: -1,
    'aria-hidden': true,
    ref: (el: unknown) => {
      inputEl.value = (el as HTMLInputElement) ?? null;
    },
    onClick(event: MouseEvent) {
      // Whoever sent this click — the root, or a wrapping label — already
      // bubbled the user's own; this one stops here.
      event.stopPropagation();
      // A label reaches the input without passing the root's guard. Canceling
      // the click makes the browser undo the toggle and skip `change` entirely.
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

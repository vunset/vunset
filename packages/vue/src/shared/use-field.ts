import {
  computed,
  onBeforeUnmount,
  onScopeDispose,
  ref,
  toValue,
  useId,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref
} from 'vue';
import { createContext } from './context';
import { dataAttrs } from './data-attrs';
import { popupStateAttrs } from './popup-state-attrs';
import { useTransitionStatus, type TransitionStatus } from './use-transition-status';
import { useExitAnimation } from './use-exit-animation';
import { useValidate } from '../composables/use-validate';

export interface FieldState {
  /** Whether the field ignores user interaction. */
  disabled: boolean;
  /** Whether the value can be read and selected but not edited. */
  readOnly: boolean;
  /** Whether a value is required: announced and marked, never enforced by the browser. */
  required: boolean;
  /** Whether the control has been focused and left at least once. */
  touched: boolean;
  /** Whether the value differs from the one the control started with. */
  dirty: boolean;
  /** Whether the control holds a non-empty value. */
  filled: boolean;
  /** Whether the control currently has focus. */
  focused: boolean;
  /** Whether the field is marked invalid. */
  invalid: boolean;
}

export interface UseFieldOptions {
  /** Whether the field ignores user interaction. */
  disabled?: MaybeRefOrGetter<boolean>;
  /** Whether the value can be read and selected but not edited. */
  readOnly?: MaybeRefOrGetter<boolean>;
  /** Whether a value is required: announced and marked, never enforced by the browser. */
  required?: MaybeRefOrGetter<boolean>;
  /** Whether the field is invalid. */
  invalid?: MaybeRefOrGetter<boolean>;
  /** Whether the control has been touched. */
  touched?: MaybeRefOrGetter<boolean | undefined>;
  /** Whether the value has changed. */
  dirty?: MaybeRefOrGetter<boolean | undefined>;
  id?: MaybeRefOrGetter<string | undefined>;
  /** The key into the validation errors; also the control's form name unless it sets one. */
  name?: MaybeRefOrGetter<string | undefined>;
}

export interface UseFieldReturn {
  /** The full state, mirrored onto every part. */
  state: ComputedRef<FieldState>;
  /** Bind to the element wrapping the whole field. */
  rootProps: ComputedRef<Record<string, unknown>>;
  /** Bind to the `<label>`. Associates itself with the control. */
  labelProps: ComputedRef<Record<string, unknown>>;
  /** Bind to a box drawn around the control and its adornments. */
  groupProps: ComputedRef<Record<string, unknown>>;
  /** The group's state: the field's, also invalid while the control rejects its own value. */
  groupState: ComputedRef<FieldState>;
  /** The id shared by the label's `for` and the control. */
  controlId: ComputedRef<string>;
  /** The label's id, while one is mounted. Controls point `aria-labelledby` here. */
  labelledBy: ComputedRef<string | undefined>;
  /** The ids describing the control, for its `aria-describedby`. */
  describedBy: ComputedRef<string | undefined>;
  /** Whether a value is required. Read by controls that mark themselves. */
  required: () => boolean;
  name: () => string | undefined;
  /** This field's message in the validation errors. */
  error: ComputedRef<string | undefined>;
  /** Reports the value changing, which clears this field's validation error. */
  changed: () => void;
  /** The control element, once one has published itself. */
  controlRef: Ref<HTMLElement | null>;
  /** Moves focus to the control. */
  focusControl: () => void;
  /** Publishes the control's element, so the frame can hand presses to it. */
  setControl: (element: HTMLElement | null) => void;
  /** Marks the field touched, as leaving the control does. */
  setTouched: (touched: boolean) => void;
  /** Reports focus moving into or out of the control. */
  setFocused: (focused: boolean) => void;
  /** Reports whether the control holds a value. */
  setFilled: (filled: boolean) => void;
  /** Reports the control's own check failing, as a number past `max` does. Marks only the group. */
  setControlInvalid: (invalid: boolean) => void;
  /** Reports whether the control has moved away from its initial value. */
  setDirty: (dirty: boolean) => void;
  /** Adds an id to the control's `aria-describedby`. */
  registerMessage: (id: string) => () => void;
  /** Points the control's `aria-labelledby` at the label. Returns the undo. */
  registerLabel: () => () => void;
}

const LABELABLE = 'button, input, meter, output, progress, select, textarea';
const INTERACTIVE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useField(options: UseFieldOptions = {}): UseFieldReturn {
  const generatedId = useId();
  const labelId = useId();

  const controlEl = ref<HTMLElement | null>(null);
  const messageIds = ref<string[]>([]);
  const hasLabel = ref(false);

  const controlId = computed(() => toValue(options.id) ?? generatedId);

  const disabled = () => toValue(options.disabled) ?? false;
  const readOnly = () => toValue(options.readOnly) ?? false;
  const required = () => toValue(options.required) ?? false;
  const name = () => toValue(options.name);

  const validation = useValidate();
  const error = computed(() => {
    const key = name();
    return key === undefined ? undefined : validation.errors.value[key];
  });
  const invalid = () => (toValue(options.invalid) ?? false) || error.value !== undefined;

  const touchedState = ref(false);
  const focused = ref(false);
  const filled = ref(false);
  const controlInvalid = ref(false);
  const dirtyState = ref(false);

  const touched = computed(() => toValue(options.touched) ?? touchedState.value);
  const dirty = computed(() => toValue(options.dirty) ?? dirtyState.value);

  function setTouched(next: boolean) {
    if (toValue(options.touched) === undefined) {
      touchedState.value = next;
    }
  }

  const state = computed<FieldState>(() => ({
    disabled: disabled(),
    readOnly: readOnly(),
    required: required(),
    touched: touched.value,
    dirty: dirty.value,
    filled: filled.value,
    focused: focused.value,
    invalid: invalid()
  }));

  const hooks = computed(() => dataAttrs(state.value));

  const describedBy = computed(() => (messageIds.value.length > 0 ? messageIds.value.join(' ') : undefined));

  const labelledBy = computed(() => (hasLabel.value ? labelId : undefined));

  function focusControl() {
    controlEl.value?.focus();
  }

  const rootProps = computed(() => ({ ...hooks.value, 'data-part': 'field' }));

  const labelProps = computed(() => ({
    ...hooks.value,
    'data-part': 'field-label',
    id: labelId,
    for: controlId.value,
    onClick(event: MouseEvent) {
      // A label only reaches a native control; a custom one, like a select's
      // trigger, is focused by hand, as clicking the label of a `<select>` would.
      const root = (event.currentTarget as HTMLElement).getRootNode() as Document | ShadowRoot;
      const control = root.getElementById?.(controlId.value);
      if (!control || control.matches(LABELABLE)) return;
      control.focus();
    }
  }));

  // The group draws the control's box, so it shows the control's own verdict too;
  // the field, its label and its error keep to the app's validation.
  const groupState = computed<FieldState>(() => ({
    ...state.value,
    invalid: state.value.invalid || controlInvalid.value
  }));

  const groupProps = computed(() => ({
    ...dataAttrs(groupState.value),
    'data-part': 'field-group',
    onMousedown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target || disabled() || target === controlEl.value) return;
      if (target.closest(INTERACTIVE)) return;

      event.preventDefault();
      focusControl();
    }
  }));

  return {
    state,
    rootProps,
    labelProps,
    groupProps,
    groupState,
    controlId,
    labelledBy,
    describedBy,
    required,
    name,
    error,
    changed() {
      const key = name();
      if (key !== undefined) validation.clearErrors(key);
    },
    controlRef: controlEl,
    focusControl,
    setControl: (element) => {
      controlEl.value = element;
    },
    setTouched,
    setFocused: (next: boolean) => {
      focused.value = next;
    },
    setFilled: (next: boolean) => {
      filled.value = next;
    },
    setControlInvalid: (next: boolean) => {
      controlInvalid.value = next;
    },
    setDirty: (next: boolean) => {
      dirtyState.value = next;
    },
    registerMessage(id: string) {
      messageIds.value = messageIds.value.concat(id);
      return () => {
        messageIds.value = messageIds.value.filter((item) => item !== id);
      };
    },
    registerLabel() {
      hasLabel.value = true;
      return () => {
        hasLabel.value = false;
      };
    }
  };
}

export const {
  provideContext: provideFieldContext,
  useContext: useFieldContext,
  useOptionalContext: useOptionalFieldContext
} = createContext<UseFieldReturn>('Field');

function sameValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return Object.is(a, b);
}

/** Marks the field dirty while `value` differs from what it was on mount, and reports each change. */
export function useFieldValue(field: UseFieldReturn | null, value: () => unknown): void {
  if (!field) return;

  const current = value();
  const initial = Array.isArray(current) ? [...current] : current;

  watch(() => !sameValue(value(), initial), field.setDirty, { immediate: true });
  watch(value, field.changed, { deep: true });
}

export interface UseFieldMessageReturn {
  /** Bind to the describing element. Carries its generated id and the hooks. */
  messageProps: ComputedRef<Record<string, unknown>>;
  /** The state, for rendering. */
  state: ComputedRef<FieldState>;
}

/** An element that describes the control, such as a hint below it. */
export function useFieldMessage(): UseFieldMessageReturn {
  const field = useFieldContext();
  const id = useId();

  onBeforeUnmount(field.registerMessage(id));

  return {
    messageProps: computed(() => ({ ...dataAttrs(field.state.value), 'data-part': 'field-description', id })),
    state: field.state
  };
}

export interface FieldErrorState extends FieldState {
  /**
   * Where the message is in its enter or exit animation.
   * @attribute `data-enter-from` as it enters, `data-leave-to` as it leaves
   */
  transitionStatus: TransitionStatus;
}

export interface UseFieldErrorOptions {
  /** Forces the message shown or hidden. */
  match?: MaybeRefOrGetter<boolean | undefined>;
  /** Shows this name's validation error, inside a `FieldRoot` or on its own. */
  name?: MaybeRefOrGetter<string | undefined>;
}

export interface UseFieldErrorReturn {
  /** Whether the element should be in the DOM. Stays true through the exit animation. */
  mounted: Ref<boolean>;
  /** Bind to the message element. */
  errorProps: ComputedRef<Record<string, unknown>>;
  /** The state, including the transition phase. */
  state: ComputedRef<FieldErrorState>;
  /** The field's validation message, kept through the exit animation. */
  message: Ref<string | undefined>;
}

const NO_FIELD: FieldState = {
  disabled: false,
  readOnly: false,
  required: false,
  touched: false,
  dirty: false,
  filled: false,
  focused: false,
  invalid: false
};

/** The message shown when the field is invalid, or for a named validation error. */
export function useFieldError(options: UseFieldErrorOptions = {}): UseFieldErrorReturn {
  const field = useOptionalFieldContext();
  const validation = useValidate();
  const id = useId();
  const element = ref<HTMLElement | null>(null);

  const name = () => toValue(options.name);
  const error = computed(() => {
    const key = name();
    return key === undefined ? field?.error.value : validation.errors.value[key];
  });

  const shown = () =>
    toValue(options.match) ?? (name() === undefined && field ? field.state.value.invalid : error.value !== undefined);

  const { mounted, transitionStatus, setMounted } = useTransitionStatus(shown);
  useExitAnimation({ open: shown, mounted, setMounted, element });

  // On its own there is no control to describe.
  let unregister: (() => void) | undefined;
  watch(
    mounted,
    (isMounted) => {
      unregister?.();
      unregister = isMounted ? field?.registerMessage(id) : undefined;
    },
    { immediate: true }
  );
  onScopeDispose(() => unregister?.());

  const state = computed<FieldErrorState>(() => ({
    ...(field?.state.value ?? { ...NO_FIELD, invalid: error.value !== undefined }),
    transitionStatus: transitionStatus.value
  }));

  const message = ref<string>();
  watch(error, (next) => next !== undefined && (message.value = next), { immediate: true });

  const errorProps = computed(() => ({
    ...dataAttrs(state.value, { transitionStatus: popupStateAttrs.transitionStatus }),
    'data-part': 'field-error',
    id,
    ref: (el: unknown) => {
      element.value = (el as HTMLElement) ?? null;
    }
  }));

  return { mounted, errorProps, state, message };
}

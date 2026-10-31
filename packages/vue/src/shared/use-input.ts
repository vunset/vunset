import {
  computed,
  onScopeDispose,
  ref,
  toValue,
  useId,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  type Ref,
  type WritableComputedRef
} from 'vue';
import { createContext } from './context';
import { useControlled } from './use-controlled';
import { dataAttrs } from './data-attrs';
import {
  NON_NEGATIVE_NUMERIC,
  NUMERIC,
  insertedText,
  outOfRange,
  prospectiveValue,
  toFilterPredicate,
  type FieldFilter
} from './input-filter';
import { useFieldValue, useOptionalFieldContext } from './use-field';

export type { FieldFilter };

export interface InputState {
  /** Whether it ignores interaction. */
  disabled: boolean;
  /** Whether the value can be read and selected but not edited. */
  readOnly: boolean;
  /** Whether a value is needed before the form submits. */
  required: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
  /** Whether it holds a non-empty value. */
  filled: boolean;
  /** Whether it has focus. */
  focused: boolean;
}

export interface UseInputOptions {
  /** The value. Supplying it makes the input controlled. */
  value?: MaybeRefOrGetter<string | number | null | undefined>;
  /** The initial value while uncontrolled. */
  defaultValue?: MaybeRefOrGetter<string | number | undefined>;
  disabled?: MaybeRefOrGetter<boolean>;
  readOnly?: MaybeRefOrGetter<boolean>;
  required?: MaybeRefOrGetter<boolean>;
  /** Whether the value is invalid. Also read from a surrounding field. */
  invalid?: MaybeRefOrGetter<boolean>;
  /** The element id. Falls back to the surrounding field's, then a generated one. */
  id?: MaybeRefOrGetter<string | undefined>;
  name?: MaybeRefOrGetter<string | undefined>;
  type?: MaybeRefOrGetter<string | undefined>;
  /** Shortest acceptable value. Marks validity; it cannot block typing, since every value passes through being too short. */
  minLength?: MaybeRefOrGetter<number | undefined>;
  /** Longest acceptable value. Enforced while typing — no amount of further typing makes an over-long value acceptable. */
  maxLength?: MaybeRefOrGetter<number | undefined>;
  /** Smallest acceptable number. Marks validity, and rules out a leading minus when it is not negative. */
  min?: MaybeRefOrGetter<number | string | undefined>;
  /** Largest acceptable number. Marks validity; typing has to pass through smaller numbers to reach it. */
  max?: MaybeRefOrGetter<number | string | undefined>;
  /** Granularity of an acceptable number. Marks validity. */
  step?: MaybeRefOrGetter<number | string | undefined>;
  pattern?: MaybeRefOrGetter<string | undefined>;
  /** What may be typed, tested against every **intermediate** value. `type="number"` supplies one automatically. */
  filter?: MaybeRefOrGetter<FieldFilter | undefined>;
  /** Rewrites the typed text once it's committed, on `change`: blur, or Enter in an input. */
  transform?: MaybeRefOrGetter<((value: string) => string) | undefined>;
  /** Called on every write, including programmatic ones. */
  onChange?: (value: string) => void;
}

export interface UseInputReturn {
  /** The value. Writable — assign to it to set the input programmatically. */
  value: WritableComputedRef<string>;
  state: ComputedRef<InputState>;
  /** Bind to the `<input>` or `<textarea>`. */
  controlProps: ComputedRef<Record<string, unknown>>;
  /** The element, once mounted. */
  controlRef: Ref<HTMLElement | null>;
  /** Whether `next` is a value the control may hold while being typed. */
  accepts: (next: string) => boolean;
  /** Moves focus to the control. */
  focus: () => void;
}

export function useInput(options: UseInputOptions = {}): UseInputReturn {
  const field = useOptionalFieldContext();
  const generatedId = useId();

  const controlEl = ref<HTMLElement | null>(null);

  const disabled = () => (toValue(options.disabled) ?? false) || (field?.state.value.disabled ?? false);
  const readOnly = () => (toValue(options.readOnly) ?? false) || (field?.state.value.readOnly ?? false);
  const required = () => (toValue(options.required) ?? false) || (field?.required() ?? false);
  const numeric = () => toValue(options.type) === 'number';
  // A text input ignores `min`, `max` and `step`, so a number's are checked here.
  const outsideLimits = () =>
    numeric() &&
    outOfRange(value.value, { min: toValue(options.min), max: toValue(options.max), step: toValue(options.step) });
  const invalid = () =>
    (toValue(options.invalid) ?? false) || (field?.state.value.invalid ?? false) || outsideLimits();

  // `null`, a database's empty field, reads as nothing typed rather than the text "null".
  const normalize = (raw: string | number | null | undefined) => (raw == null ? undefined : String(raw));

  const value = useControlled<string>({
    value: () => normalize(toValue(options.value)),
    defaultValue: () => normalize(toValue(options.defaultValue)) ?? '',
    prop: 'modelValue',
    empty: '',
    onChange: options.onChange,
    name: 'useInput',
    label: 'value'
  });

  const focused = ref(false);

  const state = computed<InputState>(() => ({
    disabled: disabled(),
    readOnly: readOnly(),
    required: required(),
    invalid: invalid(),
    filled: value.value !== '',
    focused: focused.value
  }));

  watch(() => value.value, (next) => field?.setFilled(next !== ''), { immediate: true });
  watch(outsideLimits, (next) => field?.setControlInvalid(next), { immediate: true });
  onScopeDispose(() => field?.setControlInvalid(false));

  useFieldValue(field, () => value.value);

  watch(controlEl, (element) => field?.setControl(element), { immediate: true });

  const hooks = computed(() => dataAttrs(state.value));

  const controlId = computed(() => toValue(options.id) ?? field?.controlId.value ?? generatedId);

  function resolveFilter() {
    const custom = toValue(options.filter);
    if (custom !== undefined) return toFilterPredicate(custom);

    if (!numeric()) return null;

    const minimum = Number(toValue(options.min));
    const expression =
      toValue(options.min) !== undefined && Number.isFinite(minimum) && minimum >= 0 ? NON_NEGATIVE_NUMERIC : NUMERIC;

    return (next: string) => expression.test(next);
  }

  function accepts(next: string): boolean {
    const limit = toValue(options.maxLength);
    if (limit !== undefined && next.length > limit) return false;

    const predicate = resolveFilter();
    return !predicate || predicate(next, value.value);
  }

  function restore(element: HTMLInputElement) {
    element.value = value.value;
    try {
      element.setSelectionRange(element.value.length, element.value.length);
    } catch {}
  }

  let composing = false;

  function handleInput(event: Event) {
    const el = event.target as HTMLInputElement;
    value.value = el.value;

    if (el.value !== value.value) el.value = value.value;
  }

  const controlProps = computed(() => ({
    ...hooks.value,
    id: controlId.value,
    name: toValue(options.name) ?? field?.name(),
    disabled: disabled(),
    readonly: readOnly() || undefined,
    // Announced, not enforced: a native `required` would have the browser block the submit.
    'aria-required': required() || undefined,
    value: value.value,
    type: numeric() ? 'text' : toValue(options.type),
    inputmode: numeric() ? 'decimal' : undefined,
    minlength: toValue(options.minLength),
    maxlength: toValue(options.maxLength),
    min: toValue(options.min),
    max: toValue(options.max),
    step: toValue(options.step),
    pattern: toValue(options.pattern),
    'aria-invalid': invalid() || undefined,
    'aria-describedby': field?.describedBy.value,
    'aria-labelledby': field?.labelledBy.value,
    ref: (el: unknown) => {
      controlEl.value = (el as HTMLElement) ?? null;
    },
    onCompositionstart() {
      composing = true;
    },
    onCompositionend(event: CompositionEvent) {
      composing = false;
      handleInput(event);
    },
    onBeforeinput(event: InputEvent) {
      if (!event.inputType?.startsWith('insert')) return;

      const element = event.target as HTMLInputElement;
      const inserted = insertedText(event);
      if (inserted === null) return;

      const next = prospectiveValue(element, inserted) ?? element.value + inserted;
      if (!accepts(next)) event.preventDefault();
    },
    onInput(event: Event) {
      if (composing) return;

      const element = event.target as HTMLInputElement;
      const inputType = (event as InputEvent).inputType;

      if (inputType?.startsWith('insert') && !accepts(element.value)) {
        restore(element);
        return;
      }

      handleInput(event);
    },
    onChange(event: Event) {
      const transform = toValue(options.transform);
      if (transform) value.value = transform((event.target as HTMLInputElement).value);
    },
    onFocus() {
      focused.value = true;
      field?.setFocused(true);
    },
    onBlur() {
      focused.value = false;
      field?.setFocused(false);
      field?.setTouched(true);
    }
  }));

  return {
    value,
    state,
    controlProps,
    controlRef: controlEl,
    accepts,
    focus: () => controlEl.value?.focus()
  };
}

export const { provideContext: provideInputContext, useContext: useInputContext } =
  createContext<UseInputReturn>('Input');

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
import { createContext } from '../../shared/context';
import { useControlled } from '../../shared/use-controlled';
import { dataAttrs } from '../../shared/data-attrs';
import { useToggleInput } from '../../shared/use-toggle-input';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';

export type RadioValue = string | number;

export interface RadioGroupState {
  /**
   * The chosen radio's value.
   * @attribute none
   */
  value: RadioValue | undefined;
  /** Whether every radio ignores interaction. */
  disabled: boolean;
  /** Whether the radios can be focused but not changed. */
  readOnly: boolean;
  /** Whether a radio must be chosen before the form submits. */
  required: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
}

export interface UseRadioGroupOptions {
  value?: MaybeRefOrGetter<RadioValue | undefined>;
  defaultValue?: MaybeRefOrGetter<RadioValue | undefined>;
  disabled?: MaybeRefOrGetter<boolean>;
  readOnly?: MaybeRefOrGetter<boolean>;
  required?: MaybeRefOrGetter<boolean>;
  invalid?: MaybeRefOrGetter<boolean>;
  name?: MaybeRefOrGetter<string | undefined>;
  form?: MaybeRefOrGetter<string | undefined>;
  /** Whether arrow keys wrap past the ends. @default true */
  loop?: MaybeRefOrGetter<boolean>;
  onChange?: (value: RadioValue, event: Event) => void;
}

interface RadioRegistration {
  value: RadioValue;
  disabled: () => boolean;
}

export interface RadioGroupContext {
  value: Ref<RadioValue | undefined>;
  select: (value: RadioValue, event: Event) => void;
  disabled: () => boolean;
  readOnly: () => boolean;
  required: () => boolean;
  invalid: () => boolean;
  name: () => string;
  form: () => string | undefined;
  loop: () => boolean;
  containerRef: Ref<HTMLElement | null>;
  register: (entry: RadioRegistration) => () => void;
  firstEnabledValue: ComputedRef<RadioValue | undefined>;
  resolve: (raw: string) => RadioValue | undefined;
}

export interface UseRadioGroupReturn {
  value: WritableComputedRef<RadioValue | undefined>;
  state: ComputedRef<RadioGroupState>;
  groupProps: ComputedRef<Record<string, unknown>>;
}

export function useRadioGroup(options: UseRadioGroupOptions = {}): UseRadioGroupReturn {
  const field = useOptionalFieldContext();
  const generatedName = useId();
  const containerRef = ref<HTMLElement | null>(null);
  const registrations = ref<RadioRegistration[]>([]);

  const disabled = () => (toValue(options.disabled) ?? false) || (field?.state.value.disabled ?? false);
  const readOnly = () => (toValue(options.readOnly) ?? false) || (field?.state.value.readOnly ?? false);
  const required = () => (toValue(options.required) ?? false) || (field?.required() ?? false);
  const invalid = () => (toValue(options.invalid) ?? false) || (field?.state.value.invalid ?? false);

  const value = useControlled<RadioValue | undefined>({
    value: () => toValue(options.value),
    defaultValue: () => toValue(options.defaultValue),
    prop: 'modelValue',
    name: 'useRadioGroup',
    label: 'value'
  });

  const state = computed<RadioGroupState>(() => ({
    value: value.value,
    disabled: disabled(),
    readOnly: readOnly(),
    required: required(),
    invalid: invalid()
  }));

  useFieldValue(field, () => value.value);
  watch(() => value.value != null, (filled) => field?.setFilled(filled), { immediate: true });

  const firstEnabledValue = computed(() => registrations.value.find((entry) => !entry.disabled())?.value);

  function select(next: RadioValue, event: Event) {
    if (disabled() || readOnly()) return;

    value.value = next;
    options.onChange?.(next, event);
  }

  provideRadioGroupContext({
    value,
    select,
    disabled,
    readOnly,
    required,
    invalid,
    name: () => toValue(options.name) ?? field?.name() ?? generatedName,
    form: () => toValue(options.form),
    loop: () => toValue(options.loop) ?? true,
    containerRef,
    register(entry) {
      registrations.value = [...registrations.value, entry];
      return () => {
        registrations.value = registrations.value.filter((item) => item !== entry);
      };
    },
    firstEnabledValue,
    resolve: (raw) => registrations.value.find((entry) => String(entry.value) === raw)?.value
  });

  const groupProps = computed(() => ({
    ...dataAttrs(state.value, { value: () => null }),
    'data-part': 'radio-group',
    role: 'radiogroup',
    'aria-labelledby': field?.labelledBy.value,
    'aria-describedby': field?.describedBy.value,
    'aria-required': required() || undefined,
    'aria-disabled': disabled() || undefined,
    'aria-readonly': readOnly() || undefined,
    'aria-invalid': invalid() || undefined,
    ref: (el: unknown) => {
      containerRef.value = (el as HTMLElement) ?? null;
    },
    onFocusin: () => field?.setFocused(true),
    // Touched once focus leaves the group, not when it moves between radios.
    onFocusout(event: FocusEvent) {
      const next = event.relatedTarget;
      if (next instanceof Node && containerRef.value?.contains(next)) return;

      field?.setFocused(false);
      field?.setTouched(true);
    }
  }));

  return { value, state, groupProps };
}

export const { provideContext: provideRadioGroupContext, useContext: useRadioGroupContext } =
  createContext<RadioGroupContext>('RadioGroup');

export interface RadioState {
  /**
   * Whether this radio is the chosen one.
   * @attribute `data-checked` while chosen, `data-unchecked` otherwise
   */
  checked: boolean;
  /** Whether it ignores interaction, on its own or through the group. */
  disabled: boolean;
  /** Whether the group can be focused but not changed. */
  readOnly: boolean;
  /** Whether the group must have a choice before the form submits. */
  required: boolean;
  /** Whether the group's value is invalid. */
  invalid: boolean;
}

export interface UseRadioOptions {
  value: MaybeRefOrGetter<RadioValue>;
  disabled?: MaybeRefOrGetter<boolean>;
  id?: MaybeRefOrGetter<string | undefined>;
  /** Whether the root is a real `<button>`, which supplies its own key handling. */
  native?: MaybeRefOrGetter<boolean>;
}

export interface UseRadioReturn {
  checked: ComputedRef<boolean>;
  state: ComputedRef<RadioState>;
  hooks: ComputedRef<Record<string, string>>;
  rootProps: ComputedRef<Record<string, unknown>>;
  inputProps: ComputedRef<Record<string, unknown>>;
}

const FORWARD_KEYS = new Set(['ArrowDown', 'ArrowRight']);
const BACKWARD_KEYS = new Set(['ArrowUp', 'ArrowLeft']);

export function useRadio(options: UseRadioOptions): UseRadioReturn {
  const group = useRadioGroupContext();
  const generatedId = useId();

  const radioValue = () => toValue(options.value);
  const disabled = () => (toValue(options.disabled) ?? false) || group.disabled();
  const checked = computed(() => group.value.value === radioValue());

  onScopeDispose(group.register({ value: radioValue(), disabled }));

  const state = computed<RadioState>(() => ({
    checked: checked.value,
    disabled: disabled(),
    readOnly: group.readOnly(),
    required: group.required(),
    invalid: group.invalid()
  }));

  const hooks = computed(() =>
    dataAttrs(state.value, {
      checked: (on) => (on ? { 'data-checked': '' } : { 'data-unchecked': '' })
    })
  );

  function tabindex() {
    if (disabled()) return undefined;
    if (group.value.value !== undefined) return checked.value ? 0 : -1;
    return group.firstEnabledValue.value === radioValue() ? 0 : -1;
  }

  function siblings(): HTMLElement[] {
    const container = group.containerRef.value;
    if (!container) return [];

    return Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]')).filter(
      (el) => el.getAttribute('aria-disabled') !== 'true'
    );
  }

  function moveTo(target: HTMLElement | undefined, event: Event) {
    if (!target) return;

    target.focus();
    const next = group.resolve(target.dataset.value ?? '');

    if (next !== undefined) group.select(next, event);
  }

  const toggleInput = useToggleInput({
    role: 'radio',
    inputType: 'radio',
    checked: () => checked.value,
    disabled,
    readOnly: group.readOnly,
    required: group.required,
    id: () => toValue(options.id) ?? generatedId,
    name: group.name,
    value: () => String(radioValue()),
    form: group.form,
    native: () => toValue(options.native) ?? false,
    tabindex,
    hooks: () => hooks.value,
    onToggle: (_next, event) => group.select(radioValue(), event)
  });

  const rootProps = computed(() => {
    const base = toggleInput.rootProps.value;
    const baseKeydown = base.onKeydown as (event: KeyboardEvent) => void;

    return {
      ...base,
      'data-value': String(radioValue()),
      onKeydown(event: KeyboardEvent) {
        baseKeydown(event);

        if (disabled() || group.readOnly() || event.defaultPrevented) return;

        const list = siblings();
        const index = list.indexOf(toggleInput.rootEl.value as HTMLElement);
        if (index === -1) return;

        const step = FORWARD_KEYS.has(event.key) ? 1 : BACKWARD_KEYS.has(event.key) ? -1 : 0;

        if (step !== 0) {
          event.preventDefault();
          const next = index + step;
          const wrapped = group.loop()
            ? (next + list.length) % list.length
            : Math.min(Math.max(next, 0), list.length - 1);
          moveTo(list[wrapped], event);
          return;
        }

        if (event.key === 'Home') {
          event.preventDefault();
          moveTo(list[0], event);
        } else if (event.key === 'End') {
          event.preventDefault();
          moveTo(list[list.length - 1], event);
        }
      }
    };
  });

  return { checked, state, hooks, rootProps, inputProps: toggleInput.inputProps };
}

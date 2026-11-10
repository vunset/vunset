<script lang="ts">
import type { ComputedRef } from 'vue';
import { createContext } from '../../shared/context';

export interface NumberFieldState {
  /** Whether it ignores interaction. */
  disabled: boolean;
  /** Whether the value can be read but not edited. */
  readOnly: boolean;
  /** Whether a value is needed before the form submits. */
  required: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
  /** Whether it holds a number. */
  filled: boolean;
  /** Whether the input has focus. */
  focused: boolean;
}

interface NumberFieldContext {
  state: ComputedRef<NumberFieldState>;
  inputProps: ComputedRef<Record<string, unknown>>;
  incrementProps: ComputedRef<Record<string, unknown>>;
  decrementProps: ComputedRef<Record<string, unknown>>;
}

export const { provideContext, useContext: useNumberFieldContext } =
  createContext<NumberFieldContext>('NumberField');

const decimals = (value: number) => {
  const [, fraction = '', exponent] = /^-?\d*(?:\.(\d+))?(?:e([+-]\d+))?$/i.exec(String(value)) ?? [];
  return Math.max(0, fraction.length - Number(exponent ?? 0));
};

/** `value` moved one `amount` in `direction`, landing on the grid of `amount` counted from `base`. */
export function stepValue(value: number, amount: number, direction: 1 | -1, base: number): number {
  // Rounded first, so 0.30000000000000004 counts as on the grid.
  const quotient = Number(((value - base) / amount).toFixed(10));
  const index = direction > 0 ? Math.floor(quotient) + 1 : Math.ceil(quotient) - 1;
  const precision = Math.max(decimals(amount), decimals(base), decimals(value));
  return Number((base + index * amount).toFixed(Math.min(precision, 20)));
}

const REPEAT_DELAY = 400;
const REPEAT_INTERVAL = 60;
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, nextTick, onScopeDispose, ref, useAttrs, useId, watch } from 'vue';
import { parseNumber, toPlainNumber, formatNumber } from '@vunset/utils';
import { dataAttrs } from '../../shared/data-attrs';
import { insertedText, prospectiveValue } from '../../shared/input-filter';
import { mergeProps } from '../../shared/merge-props';
import { useControlled } from '../../shared/use-controlled';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';

defineOptions({ name: 'NumberFieldRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The value, bound with `v-model`: a number, or `null` when empty. */
    modelValue?: number | null;
    /** The value at first, when no `v-model` owns it. */
    defaultValue?: number | null;
    /** The lowest value. Typing below it is clamped on commit; a minus can't be typed at zero or more. */
    min?: number;
    /** The highest value. */
    max?: number;
    /** How far a button, ArrowUp or ArrowDown moves it, onto a grid counted from `min`. */
    step?: number;
    /** How far Shift with a step, PageUp or PageDown moves it. */
    largeStep?: number;
    /** How the value is shown and read back, as `Intl.NumberFormat` options. */
    format?: Intl.NumberFormatOptions;
    /** The locale `format` uses. The runtime's own by default. */
    locale?: Intl.LocalesArgument;
    /** Steps with the mouse wheel while the input has focus. */
    wheel?: boolean;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Can be read and selected but not changed. Inside a `FieldRoot`, follows the field. */
    readOnly?: boolean;
    /** Needs a value. Announced and styled, not enforced. Inside a `FieldRoot`, follows the field. */
    required?: boolean;
    /** Sets `aria-invalid` and `data-invalid`. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** The input's id. Inside a `FieldRoot`, the field's control id. */
    id?: string;
    /** The form field name, submitted with the plain number. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The id of the form the hidden input belongs to, when it sits outside it. */
    form?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, defaultValue: null, step: 1, largeStep: 10, as: 'div' }
);

const emit = defineEmits<{
  /** The new value, for `v-model`: as typed, and clamped once committed. */
  'update:modelValue': [value: number | null];
}>();

defineSlots<{
  default(props: NumberFieldState & { value: number | null }): unknown;
}>();

const field = useOptionalFieldContext();
const generatedId = useId();

const disabled = () => props.disabled || (field?.state.value.disabled ?? false);
const readOnly = () => props.readOnly || (field?.state.value.readOnly ?? false);
const required = () => props.required || (field?.required() ?? false);
const invalid = () => props.invalid || (field?.state.value.invalid ?? false);
const locked = () => disabled() || readOnly();

// Without a format, every decimal typed is kept: Intl's default would round to three.
const formatOptions = computed(() => ({ locale: props.locale, ...(props.format ?? { maximumFractionDigits: 20 }) }));

const value = useControlled<number | null>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue,
  prop: 'modelValue',
  empty: null,
  onChange: (next) => emit('update:modelValue', next),
  name: 'NumberFieldRoot',
  label: 'value'
});

const display = (number: number | null) =>
  number === null || !Number.isFinite(number) ? '' : formatNumber(number, { fallback: '', ...formatOptions.value });

const clamp = (number: number) => Math.min(props.max ?? Infinity, Math.max(props.min ?? -Infinity, number));

const text = ref(display(value.value));
const inputEl = ref<HTMLInputElement | null>(null);
const focused = ref(false);

// A value set from outside is shown formatted; one that is what's being typed leaves the text alone.
watch(
  () => value.value,
  (next) => {
    if (next !== parseNumber(text.value, formatOptions.value)) text.value = display(next);
  }
);
watch(formatOptions, () => (text.value = display(value.value)), { deep: true });

function write(next: number | null) {
  if (next !== value.value) value.value = next;
}

// Shown from the number written, not read back: a controlled value is the old one until the parent re-renders.
function set(next: number | null) {
  write(next);
  text.value = display(next);
  // A parent that turns the value down keeps its own: the text follows it back.
  nextTick(() => {
    if (value.value !== next) text.value = display(value.value);
  });
}

function commit() {
  const parsed = parseNumber(text.value, formatOptions.value);
  if (parsed !== null && Number.isNaN(parsed)) text.value = display(value.value);
  else set(parsed === null ? null : clamp(parsed));
}

function goTo(number: number) {
  if (!locked()) set(number);
}

function stepBy(direction: 1 | -1, large = false) {
  if (locked()) return;
  const typed = parseNumber(text.value, formatOptions.value);
  const current = typed !== null && !Number.isNaN(typed) ? typed : value.value;
  let next: number;
  if (current === null) {
    next = direction > 0 ? (props.min ?? 0) : (props.max ?? 0);
  } else {
    const amount = large ? props.largeStep : props.step;
    next = stepValue(current, amount, direction, props.min ?? 0);
  }
  set(clamp(next));
}

const atMin = () => value.value !== null && props.min !== undefined && value.value <= props.min;
const atMax = () => value.value !== null && props.max !== undefined && value.value >= props.max;

// Whether text being typed could still turn into a number: a minus only where `min` allows one.
function accepts(next: string): boolean {
  const plain = toPlainNumber(next, formatOptions.value);
  if (plain === null) return false;
  return !(plain.startsWith('-') && props.min !== undefined && props.min >= 0);
}

useFieldValue(field, () => value.value);
watch(
  () => value.value !== null,
  (filled) => field?.setFilled(filled),
  { immediate: true }
);
watch(inputEl, (element) => field?.setControl(element), { immediate: true });

const state = computed<NumberFieldState>(() => ({
  disabled: disabled(),
  readOnly: readOnly(),
  required: required(),
  invalid: invalid(),
  filled: value.value !== null,
  focused: focused.value
}));

const hooks = computed(() => dataAttrs(state.value));
const name = () => props.name ?? field?.name();

// A keypad of digits alone fits only a whole number that can't be negative.
const wholeOnly = () => props.format?.maximumFractionDigits === 0 && props.min !== undefined && props.min >= 0;

const inputProps = computed(() => ({
  ...hooks.value,
  'data-part': 'input',
  id: props.id ?? field?.controlId.value ?? generatedId,
  type: 'text',
  role: 'spinbutton',
  inputmode: wholeOnly() ? 'numeric' : 'decimal',
  autocomplete: 'off',
  autocorrect: 'off',
  spellcheck: false,
  value: text.value,
  disabled: disabled(),
  readonly: readOnly() || undefined,
  'aria-valuenow': value.value ?? undefined,
  'aria-valuemin': props.min,
  'aria-valuemax': props.max,
  'aria-valuetext': value.value === null ? undefined : display(value.value),
  'aria-required': required() || undefined,
  'aria-invalid': invalid() || undefined,
  'aria-labelledby': field?.labelledBy.value,
  'aria-describedby': field?.describedBy.value,
  ref: (el: unknown) => {
    inputEl.value = (el as HTMLInputElement) ?? null;
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
    const element = event.target as HTMLInputElement;
    if (!accepts(element.value)) {
      element.value = text.value;
      return;
    }
    text.value = element.value;
    const parsed = parseNumber(element.value, formatOptions.value);
    if (parsed === null) write(null);
    else if (!Number.isNaN(parsed)) write(parsed);
    nextTick(() => {
      if (element.value !== text.value) element.value = text.value;
    });
  },
  onKeydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const actions: Record<string, () => void> = {
      ArrowUp: () => stepBy(1, event.shiftKey),
      ArrowDown: () => stepBy(-1, event.shiftKey),
      PageUp: () => stepBy(1, true),
      PageDown: () => stepBy(-1, true),
      Enter: commit
    };
    // Home and End move the caret unless there's an end of the range to go to.
    const { min, max } = props;
    if (min !== undefined) actions.Home = () => goTo(min);
    if (max !== undefined) actions.End = () => goTo(max);
    const action = actions[event.key];
    if (!action) return;
    if (event.key !== 'Enter') event.preventDefault();
    action();
  },
  onWheel(event: WheelEvent) {
    if (!props.wheel || document.activeElement !== event.currentTarget || event.deltaY === 0) return;
    event.preventDefault();
    stepBy(event.deltaY < 0 ? 1 : -1, event.shiftKey);
  },
  onFocus() {
    focused.value = true;
    field?.setFocused(true);
  },
  onBlur() {
    focused.value = false;
    commit();
    field?.setFocused(false);
    field?.setTouched(true);
  }
}));

let delay: ReturnType<typeof setTimeout> | undefined;
let repeat: ReturnType<typeof setInterval> | undefined;
let pressed = false;

function stopRepeat() {
  clearTimeout(delay);
  clearInterval(repeat);
}
onScopeDispose(stopRepeat);

function buttonProps(direction: 1 | -1) {
  const atEnd = direction > 0 ? atMax() : atMin();
  const off = locked() || atEnd;
  return {
    ...hooks.value,
    ...(off ? { 'data-disabled': '' } : null),
    'data-part': direction > 0 ? 'increment' : 'decrement',
    type: 'button',
    tabindex: -1,
    disabled: off,
    'aria-label': direction > 0 ? 'Increase' : 'Decrease',
    'aria-controls': inputProps.value.id,
    onPointerdown(event: PointerEvent) {
      if (event.button !== 0 || off) return;
      // Focus stays where it is: in the input, its caret and selection too.
      event.preventDefault();
      pressed = true;
      stepBy(direction);
      stopRepeat();
      delay = setTimeout(() => {
        repeat = setInterval(() => stepBy(direction), REPEAT_INTERVAL);
      }, REPEAT_DELAY);
    },
    onPointerup: stopRepeat,
    onPointerleave: stopRepeat,
    onPointercancel: stopRepeat,
    // A click with no press before it, from a keyboard or assistive technology, steps once.
    onClick() {
      if (pressed) {
        pressed = false;
        return;
      }
      stepBy(direction);
    }
  };
}

const incrementProps = computed(() => buttonProps(1));
const decrementProps = computed(() => buttonProps(-1));

watch([atMin, atMax, locked], stopRepeat);

provideContext({ state, inputProps, incrementProps, decrementProps });

const attrs = useAttrs();
const rootProps = computed(() => mergeProps({ ...hooks.value, 'data-part': 'number-field' }, attrs));

defineExpose({ value, state, increment: () => stepBy(1), decrement: () => stepBy(-1), focus: () => inputEl.value?.focus() });
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="state" :value="value" />
    <input v-if="name()" type="hidden" :name="name()" :value="value ?? ''" :form="props.form" />
  </Part>
</template>

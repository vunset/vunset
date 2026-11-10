<script lang="ts">
import type { ComputedRef } from 'vue';
import { createContext } from '../../shared/context';

/** Which characters a box takes: `numeric` digits, `alphanumeric` letters and digits. */
export type OtpType = 'numeric' | 'alphanumeric';

export interface OtpState {
  /** Whether it ignores interaction. */
  disabled: boolean;
  /** Whether the code can be read but not edited. */
  readOnly: boolean;
  /** Whether a code is needed before the form submits. */
  required: boolean;
  /** Whether the code is invalid. */
  invalid: boolean;
  /** Whether any character is typed. */
  filled: boolean;
  /** Whether every box is filled. */
  complete: boolean;
  /** Whether a box has focus. */
  focused: boolean;
}

interface OtpContext {
  state: ComputedRef<OtpState>;
  getInputProps: (index: number) => Record<string, unknown>;
}

export const { provideContext, useContext: useOtpContext } = createContext<OtpContext>('Otp');

const DIGIT = /^\p{Nd}$/u;
const ALPHANUMERIC = /^[\p{L}\p{N}]$/u;
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, nextTick, onScopeDispose, ref, useAttrs, useId, watch } from 'vue';
import { dataAttrs } from '../../shared/data-attrs';
import { logicalKey } from '../../shared/direction';
import { insertedText, toFilterPredicate, type FieldFilter } from '../../shared/input-filter';
import { mergeProps } from '../../shared/merge-props';
import { useControlled } from '../../shared/use-controlled';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';

defineOptions({ name: 'OtpRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The code, bound with `v-model`. */
    modelValue?: string | null;
    /** The code at first, when no `v-model` owns it. */
    defaultValue?: string;
    /** How many characters the code has: one `OtpInput` each. */
    length?: number;
    /** Which characters a box takes. */
    type?: OtpType;
    /** What one character must pass, in place of `type`: a regex source, a RegExp or a function. */
    filter?: FieldFilter;
    /** Hides the characters, as a password does. */
    mask?: boolean;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Can be read but not edited. Inside a `FieldRoot`, follows the field. */
    readOnly?: boolean;
    /** Needs a code. Announced and styled, not enforced. Inside a `FieldRoot`, follows the field. */
    required?: boolean;
    /** Sets `aria-invalid` and `data-invalid`. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** The first box's id. Inside a `FieldRoot`, the field's control id. */
    id?: string;
    /** The form field name, submitted with the whole code. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The id of the form the hidden input belongs to, when it sits outside it. */
    form?: string;
    /** Each box's accessible name. */
    getInputLabel?: (index: number, length: number) => string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    modelValue: undefined,
    length: 6,
    type: 'numeric',
    getInputLabel: (index: number, length: number) => `Character ${index + 1} of ${length}`,
    as: 'div'
  }
);

const emit = defineEmits<{
  /** The new code, for `v-model`. */
  'update:modelValue': [value: string];
  /** Every box is filled, by typing, pasting or autofill. */
  complete: [value: string];
}>();

defineSlots<{
  default(props: OtpState & { length: number; value: string }): unknown;
}>();

const field = useOptionalFieldContext();
const baseId = useId();

const disabled = () => props.disabled || (field?.state.value.disabled ?? false);
const readOnly = () => props.readOnly || (field?.state.value.readOnly ?? false);
const required = () => props.required || (field?.required() ?? false);
const invalid = () => props.invalid || (field?.state.value.invalid ?? false);
const name = () => props.name ?? field?.name();

function accepts(char: string): boolean {
  if (props.filter !== undefined) return toFilterPredicate(props.filter)?.(char, '') ?? true;
  return (props.type === 'alphanumeric' ? ALPHANUMERIC : DIGIT).test(char);
}

const clean = (text: string) => Array.from(text).filter(accepts).join('');

const model = useControlled<string>({
  value: () => (props.modelValue === null ? '' : props.modelValue),
  defaultValue: () => props.defaultValue ?? '',
  prop: 'modelValue',
  empty: '',
  onChange: (next) => emit('update:modelValue', next),
  name: 'OtpRoot',
  label: 'value'
});

// What the boxes show: a value set from outside is held to the same rules as typing.
const value = computed(() => Array.from(clean(model.value ?? '')).slice(0, props.length).join(''));

function write(next: string) {
  const previous = value.value;
  if (next === previous) return;
  model.value = next;
  if (Array.from(next).length === props.length) emit('complete', next);
}

const focused = ref(false);
const focusedIndex = ref<number | null>(null);
const boxes = new Map<number, HTMLInputElement>();
const rootEl = ref<HTMLElement | null>(null);

const count = () => Array.from(value.value).length;
// The furthest box focus may reach: the first empty one, or the last.
const reach = () => Math.min(count(), props.length - 1);

function focusBox(index: number) {
  const box = boxes.get(Math.max(0, Math.min(index, reach())));
  box?.focus();
  box?.select();
}

function insert(index: number, text: string) {
  if (readOnly() || disabled()) return;
  const chars = Array.from(clean(text));
  if (!chars.length) return;

  const current = Array.from(value.value);
  const at = Math.min(index, current.length);
  const next = [...current.slice(0, at), ...chars, ...current.slice(at + chars.length)].slice(0, props.length);
  write(next.join(''));
  nextTick(() => focusBox(Math.min(at + chars.length, props.length - 1)));
}

function remove(index: number, backward: boolean) {
  if (readOnly() || disabled()) return;
  const current = Array.from(value.value);
  if (index < current.length) {
    current.splice(index, 1);
    write(current.join(''));
    nextTick(() => focusBox(index));
  } else if (backward && index > 0) {
    current.splice(index - 1, 1);
    write(current.join(''));
    nextTick(() => focusBox(index - 1));
  }
}

function onKeydown(index: number, event: KeyboardEvent) {
  const key = logicalKey(event.key, event.target);
  const moves: Record<string, () => void> = {
    ArrowLeft: () => focusBox(index - 1),
    ArrowRight: () => focusBox(index + 1),
    Home: () => focusBox(0),
    End: () => focusBox(reach()),
    Backspace: () => remove(index, true),
    Delete: () => remove(index, false)
  };
  const action = moves[key];
  if (!action || event.altKey || event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  action();
}

function sync(element: HTMLInputElement, index: number) {
  nextTick(() => {
    const shown = Array.from(value.value)[index] ?? '';
    if (element.value !== shown) element.value = shown;
  });
}

useFieldValue(field, () => value.value);
watch(
  () => value.value !== '',
  (filled) => field?.setFilled(filled),
  { immediate: true }
);
onScopeDispose(() => field?.setFilled(false));

const state = computed<OtpState>(() => ({
  disabled: disabled(),
  readOnly: readOnly(),
  required: required(),
  invalid: invalid(),
  filled: value.value !== '',
  complete: count() === props.length,
  focused: focused.value
}));

function getInputProps(index: number): Record<string, unknown> {
  const char = Array.from(value.value)[index] ?? '';
  const first = index === 0;

  return {
    ...dataAttrs({ ...state.value, filled: char !== '', focused: focusedIndex.value === index }),
    'data-part': 'input',
    'data-index': index,
    id: first ? (props.id ?? field?.controlId.value ?? `${baseId}-0`) : `${baseId}-${index}`,
    type: props.mask ? 'password' : 'text',
    inputmode: props.type === 'numeric' && props.filter === undefined ? 'numeric' : 'text',
    // Only the first box is offered the code a message brings; it arrives whole and fills the rest.
    autocomplete: first ? 'one-time-code' : 'off',
    autocapitalize: 'off',
    autocorrect: 'off',
    spellcheck: false,
    value: char,
    disabled: disabled(),
    readonly: readOnly() || undefined,
    'aria-required': required() || undefined,
    'aria-invalid': invalid() || undefined,
    'aria-label': props.getInputLabel(index, props.length),
    'aria-describedby': field?.describedBy.value,
    ref: (el: unknown) => {
      if (el) boxes.set(index, el as HTMLInputElement);
      else boxes.delete(index);
      if (first) field?.setControl((el as HTMLElement) ?? null);
    },
    onFocus(event: FocusEvent) {
      focusedIndex.value = index;
      // The code is typed from the start: a box past the first empty one hands focus to it.
      if (index > reach()) {
        focusBox(reach());
        return;
      }
      (event.target as HTMLInputElement).select();
    },
    onBlur() {
      if (focusedIndex.value === index) focusedIndex.value = null;
    },
    onKeydown: (event: KeyboardEvent) => onKeydown(index, event),
    onBeforeinput(event: InputEvent) {
      const element = event.target as HTMLInputElement;
      if (event.inputType?.startsWith('insert')) {
        event.preventDefault();
        const text = insertedText(event);
        if (text) insert(index, text);
        sync(element, index);
      } else if (event.inputType?.startsWith('delete')) {
        // A soft keyboard may delete without a Backspace keydown.
        event.preventDefault();
        remove(index, event.inputType === 'deleteContentBackward');
      }
    },
    // Whatever got past `beforeinput` (some autofills): what's new in the box, then the box set back.
    onInput(event: Event) {
      const element = event.target as HTMLInputElement;
      const typed = element.value.startsWith(char) ? element.value.slice(char.length) : element.value;
      if (typed) insert(index, typed);
      sync(element, index);
    }
  };
}

provideContext({ state, getInputProps });

const attrs = useAttrs();
const rootProps = computed(() =>
  mergeProps(
    {
      ...dataAttrs(state.value),
      'data-part': 'otp',
      role: 'group',
      'aria-labelledby': field?.labelledBy.value,
      'aria-describedby': field?.describedBy.value,
      ref: (el: unknown) => {
        rootEl.value = (el as HTMLElement) ?? null;
      },
      onFocusin() {
        focused.value = true;
        field?.setFocused(true);
      },
      // Touched once focus leaves every box, not as it moves between them.
      onFocusout(event: FocusEvent) {
        const next = event.relatedTarget;
        if (next instanceof Node && rootEl.value?.contains(next)) return;
        focused.value = false;
        field?.setFocused(false);
        field?.setTouched(true);
      }
    },
    attrs
  )
);

defineExpose({ value, state, focus: () => focusBox(reach()) });
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="state" :length="props.length" :value="value" />
    <input v-if="name()" type="hidden" :name="name()" :value="value" :form="props.form" />
  </Part>
</template>

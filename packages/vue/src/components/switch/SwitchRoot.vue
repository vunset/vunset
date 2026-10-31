<script lang="ts">
import type { ComputedRef } from 'vue';
import { createContext } from '../../shared/context';

export interface SwitchState {
  /**
   * Whether the switch is on.
   * @attribute `data-checked` while on, `data-unchecked` while off
   */
  checked: boolean;
  /** Whether the switch ignores user interaction. */
  disabled: boolean;
  /** Whether the switch can be focused but not changed. */
  readOnly: boolean;
  /** Whether the switch must be on before its form can be submitted. */
  required: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
}

export interface SwitchContext {
  state: ComputedRef<SwitchState>;
  hooks: ComputedRef<Record<string, string>>;
}

export const { provideContext, useContext: useSwitchContext } = createContext<SwitchContext>('Switch');
</script>

<script setup lang="ts" generic="TValue extends string | number | boolean = boolean">
import { Part } from '../../shared/part';
import { computed, useAttrs, useId, watch } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { dataAttrs } from '../../shared/data-attrs';
import { useControlled } from '../../shared/use-controlled';
import { useToggleInput } from '../../shared/use-toggle-input';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';

defineOptions({ name: 'SwitchRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Bound with `v-model`: `true-value` while on, `false-value` while off. */
    modelValue?: TValue | null;
    /** The model value while on. @default true */
    trueValue?: TValue;
    /** The model value while off. @default false */
    falseValue?: TValue;
    /** Starts on, when no `v-model` owns the state. A number counts as on unless it is `0`. */
    defaultChecked?: boolean | number;
    /** Ignores interaction, and the form leaves it out. */
    disabled?: boolean;
    /** Stays focusable but can't be changed. */
    readOnly?: boolean;
    /** Must be on. Announced and styled, not enforced. */
    required?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. */
    invalid?: boolean;
    /** The root's id. Inside a `FieldRoot`, the field's control id. */
    id?: string;
    /** The form field name. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** Submitted while on. The browser sends `on` without it. */
    value?: string;
    /** Submitted while off. Without it, an off switch submits nothing. */
    uncheckedValue?: string;
    /** The id of a `<form>` to submit with, when the switch sits outside it. */
    form?: string;
    /** Element or component to render. Anything but a `button` gets `tabindex` and Enter/Space keys, and a `<label>` no longer names it. */
    as?: string | object;
  }>(),
  { defaultChecked: false, as: 'button' }
);

const emit = defineEmits<{
  /** The new model value, for `v-model`. */
  'update:modelValue': [value: TValue];
  /** Every toggle by the user, with the new state and the event behind it. */
  change: [checked: boolean, event: Event];
}>();

const trueValue = computed(() => (props.trueValue ?? true) as TValue);
const falseValue = computed(() => (props.falseValue ?? false) as TValue);

const field = useOptionalFieldContext();
const formName = computed(() => props.name ?? field?.name());
const generatedId = useId();

const isDisabled = () => (props.disabled ?? false) || (field?.state.value.disabled ?? false);
const isReadOnly = () => (props.readOnly ?? false) || (field?.state.value.readOnly ?? false);
const isInvalid = () => (props.invalid ?? false) || (field?.state.value.invalid ?? false);
const isRequired = () => (props.required ?? false) || (field?.required() ?? false);

const checked = useControlled<boolean>({
  value: () => (props.modelValue === undefined ? undefined : props.modelValue === trueValue.value),
  defaultValue: () => Boolean(props.defaultChecked),
  prop: 'modelValue',
  empty: false,
  name: 'Switch',
  label: 'checked'
});

const state = computed<SwitchState>(() => ({
  checked: checked.value,
  disabled: isDisabled(),
  readOnly: isReadOnly(),
  required: isRequired(),
  invalid: isInvalid()
}));

const hooks = computed(() =>
  dataAttrs(state.value, { checked: (on) => (on ? { 'data-checked': '' } : { 'data-unchecked': '' }) })
);

provideContext({ state, hooks });

useFieldValue(field, () => checked.value);
watch(checked, (on) => field?.setFilled(on), { immediate: true });

const toggleInput = useToggleInput({
  role: 'switch',
  checked: () => checked.value,
  disabled: isDisabled,
  readOnly: isReadOnly,
  required: isRequired,
  id: () => props.id ?? field?.controlId.value ?? generatedId,
  name: () => formName.value,
  value: () => props.value,
  form: () => props.form,
  describedBy: () => field?.describedBy.value,
  native: () => props.as === 'button',
  hooks: () => hooks.value,
  onFocus: () => field?.setFocused(true),
  onBlur: () => {
    field?.setFocused(false);
    field?.setTouched(true);
  },
  onToggle: (next, event) => {
    checked.value = next;
    emit('update:modelValue', next ? trueValue.value : falseValue.value);
    emit('change', next, event);
  }
});

defineExpose({
  checked,
  state,
  rootProps: toggleInput.rootProps,
  inputProps: toggleInput.inputProps,
  toggle: toggleInput.activate
});

const attrs = useAttrs();
const rootProps = computed(() => mergeProps({ 'data-part': 'root', ...toggleInput.rootProps.value }, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="state" />
  </Part>
  <!-- Beside the root, not in it: a button may hold no interactive content. -->
  <input
    v-if="!checked && formName && uncheckedValue !== undefined"
    type="hidden"
    :form="form"
    :name="formName"
    :value="uncheckedValue"
    :disabled="isDisabled()"
  />
  <input v-if="toggleInput.rendersInput.value" v-bind="toggleInput.inputProps.value" />
</template>

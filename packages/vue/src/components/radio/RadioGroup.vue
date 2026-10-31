<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useRadioGroup, type RadioValue } from './use-radio-group';

defineOptions({ name: 'RadioGroup', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The chosen radio's `value`, bound with `v-model`. */
    modelValue?: RadioValue;
    /** The value chosen at first, when no `v-model` owns it. */
    defaultValue?: RadioValue;
    /** Disables every radio, and the form leaves the group out. */
    disabled?: boolean;
    /** Keeps the radios focusable but unchangeable. */
    readOnly?: boolean;
    /** A radio must be chosen. Announced and styled, not enforced. Inside a `FieldRoot`, follows the field. */
    required?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. */
    invalid?: boolean;
    /** The form field name every radio shares. Generated when not given. */
    name?: string;
    /** The id of a `<form>` to submit with, when the group sits outside it. */
    form?: string;
    /** Whether arrow keys wrap past the ends. */
    loop?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, defaultValue: undefined, loop: true, as: 'div' }
);

const emit = defineEmits<{
  /** The newly chosen value, for `v-model`. */
  'update:modelValue': [value: RadioValue];
  /** Every choice by the user, with the value and the event behind it. */
  change: [value: RadioValue, event: Event];
}>();

const api = useRadioGroup({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  disabled: toRef(() => props.disabled ?? false),
  readOnly: toRef(() => props.readOnly ?? false),
  required: toRef(() => props.required ?? false),
  invalid: toRef(() => props.invalid ?? false),
  name: toRef(() => props.name),
  form: toRef(() => props.form),
  loop: toRef(() => props.loop ?? true),
  onChange: (value, event) => {
    emit('update:modelValue', value);
    emit('change', value, event);
  }
});

defineExpose(api);

const merged = usePartProps(api.groupProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="api.state.value" />
  </Part>
</template>

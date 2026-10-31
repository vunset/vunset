<script setup lang="ts" generic="TValue extends string | number | boolean = boolean">
import { SwitchRoot, SwitchThumb, isPropBound } from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import type { HTMLAttributes } from 'vue';
import { useFieldAttrs } from './use-field-attrs';

defineOptions({ name: 'FormSwitch', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

defineProps<{
  modelValue?: TValue | null;
  /** The model value when on. */
  trueValue?: TValue;
  /** The model value when off. */
  falseValue?: TValue;
  /** Starts on, without a `v-model`. A number counts as on unless it is `0`. */
  defaultChecked?: boolean | number;
  label?: string;
  help?: string;
  /** Shown under the label, and marks the switch invalid. */
  error?: string;
  name?: string;
  /** Submitted when on. */
  value?: string;
  /** Submitted when off; without it, an off switch submits nothing. */
  uncheckedValue?: string;
  form?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Classes for the control's box, beside its own. */
  controlClass?: HTMLAttributes['class'];
  /** Classes for the label, beside its own. */
  labelClass?: HTMLAttributes['class'];
  /** Classes for the help text, beside its own. */
  helpClass?: HTMLAttributes['class'];
  /** Classes for the error message, beside its own. */
  errorClass?: HTMLAttributes['class'];
  /** The control's height, padding and text; the label, help and error keep theirs. @default 'md' */
  size?: FormSize;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: TValue];
  change: [checked: boolean, event: Event];
}>();

const { fieldAttrs, controlAttrs } = useFieldAttrs();
</script>

<template>
  <FormField
    v-bind="fieldAttrs"
    layout="inline"
    :label="label"
    :help="help"
    :error="error"
    :name="name"
    :id="id"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :invalid="invalid"
    :label-class="labelClass"
    :help-class="helpClass"
    :error-class="errorClass"
    :size="size"
  >
    <template v-if="$slots.label" #label><slot name="label" /></template>
    <template v-if="$slots['label-start']" #label-start><slot name="label-start" /></template>
    <template v-if="$slots['label-end']" #label-end><slot name="label-end" /></template>
    <template v-if="$slots.help" #help><slot name="help" /></template>
    <template v-if="$slots.error" #error="{ message }"><slot name="error" :message="message" /></template>

    <SwitchRoot
      v-bind="modelBound ? { ...controlAttrs, modelValue } : controlAttrs"
      class="form-switch"
      :class="controlClass"
      :true-value="trueValue"
      :false-value="falseValue"
      :default-checked="defaultChecked"
      :value="value"
      :unchecked-value="uncheckedValue"
      :form="form"
      @update:model-value="emit('update:modelValue', $event)"
      @change="(checked, event) => emit('change', checked, event)"
    >
      <SwitchThumb class="form-switch-thumb" />
    </SwitchRoot>
  </FormField>
</template>

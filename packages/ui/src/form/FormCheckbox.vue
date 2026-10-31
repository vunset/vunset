<script
  setup
  lang="ts"
  generic="TValue extends string | number | boolean = boolean, TItem extends string | number = string"
>
import { CheckboxRoot, CheckboxIndicator, isPropBound } from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import type { HTMLAttributes } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import AppIcon from '../app/AppIcon.vue';

defineOptions({ name: 'FormCheckbox', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

defineProps<{
  /** `true-value`/`false-value`, or an array that holds `value` while checked. */
  modelValue?: TValue | TItem[] | null;
  /** The model value while checked. */
  trueValue?: TValue;
  /** The model value while unchecked. */
  falseValue?: TValue;
  /** Starts checked, without a `v-model`. A number counts as checked unless it is `0`. */
  defaultChecked?: boolean | number;
  /** Shows neither state, for a parent of checkboxes that disagree. Clicking still toggles it. */
  indeterminate?: boolean;
  /** Submitted while checked, and what an array `v-model` (or a `FormCheckboxGroup`) holds for this box. */
  value?: TItem;
  /** Inside a `FormCheckboxGroup`, checks or clears every other box, and shows indeterminate while they disagree. */
  parent?: boolean;
  form?: string;

  label?: string;
  help?: string;
  /** Shown under the label, and marks the checkbox invalid. */
  error?: string;
  name?: string;
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
  'update:modelValue': [value: TValue | TItem[]];
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

    <CheckboxRoot
      v-bind="modelBound ? { ...controlAttrs, modelValue } : controlAttrs"
      class="form-checkbox"
      :class="controlClass"
      :true-value="trueValue"
      :false-value="falseValue"
      :default-checked="defaultChecked"
      :indeterminate="indeterminate"
      :value="value"
      :parent="parent"
      :form="form"
      @update:model-value="emit('update:modelValue', $event)"
      @change="(checked, event) => emit('change', checked, event)"
    >
      <CheckboxIndicator v-slot="{ indeterminate: mixed }" class="form-checkbox-indicator">
        <AppIcon :name="`checkbox-${mixed ? 'mixed' : 'checked'}`" class="form-icon" />
      </CheckboxIndicator>
    </CheckboxRoot>
  </FormField>
</template>

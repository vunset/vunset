<script lang="ts">
import type { CheckboxGroupValue } from '@vunset/vue';

export interface FormCheckboxOption {
  value: CheckboxGroupValue;
  label?: string;
  help?: string;
  disabled?: boolean;
  [key: string]: unknown;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckboxGroup, isPropBound, type ModelModifiers } from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import FormCheckbox from './FormCheckbox.vue';
import type { HTMLAttributes } from 'vue';

defineOptions({ name: 'FormCheckboxGroup' });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    modelValue?: CheckboxGroupValue[];
    /** `v-model.optional` writes `undefined` once the value is emptied. */
    modelModifiers?: ModelModifiers;
    defaultValue?: CheckboxGroupValue[];
    /** A checkbox per option; or put `FormCheckbox`es with a `value` in the default slot instead. */
    options?: (CheckboxGroupValue | FormCheckboxOption)[];
    /** `horizontal` lines the checkboxes up in a row. */
    orientation?: 'vertical' | 'horizontal';
    /** A first checkbox that checks or clears the rest. A string is its label. */
    selectAll?: boolean | string;
    form?: string;
    /** The question the checkboxes answer. */
    label?: string;
    help?: string;
    /** Shown under the checkboxes, and marks the group invalid. */
    error?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    /** At least one checkbox must be checked. Announced and styled, not enforced. */
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
  }>(),
  { modelValue: undefined, defaultValue: undefined, orientation: 'vertical' }
);

const emit = defineEmits<{
  'update:modelValue': [value: CheckboxGroupValue[] | undefined];
}>();

const items = computed<FormCheckboxOption[]>(() =>
  (props.options ?? []).map((option) =>
    typeof option === 'object' ? option : { value: option, label: String(option) }
  )
);
// For the select-all box, which renders before the options it counts.
const enabledValues = computed(() =>
  items.value.length ? items.value.filter((option) => !option.disabled).map((option) => option.value) : undefined
);
const selectAllLabel = computed(() => (typeof props.selectAll === 'string' ? props.selectAll : 'Select all'));
</script>

<template>
  <FormField
    label-as="div"
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

    <CheckboxGroup
      class="form-checkbox-group"
      :class="controlClass"
      :data-orientation="orientation"
      v-bind="modelBound ? { modelValue } : {}"
      :model-modifiers="modelModifiers"
      :default-value="defaultValue"
      :form="form"
      :all-values="enabledValues"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <FormCheckbox v-if="selectAll" parent :label="selectAllLabel" class="form-checkbox-all" />

      <slot>
        <FormCheckbox
          v-for="option in items"
          :key="option.value"
          :value="option.value"
          :label="option.label"
          :help="option.help"
          :disabled="option.disabled"
        >
          <template v-if="$slots.option" #label><slot name="option" v-bind="option" :option="option" /></template>
        </FormCheckbox>
      </slot>
    </CheckboxGroup>
  </FormField>
</template>

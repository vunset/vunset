<script lang="ts">
import type { RadioValue } from '@vunset/vue';

export interface FormRadioOption {
  value: RadioValue;
  label?: string;
  help?: string;
  disabled?: boolean;
  [key: string]: unknown;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { RadioGroup, isPropBound, type ModelModifiers } from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import FormRadio from './FormRadio.vue';
import { provideFormRadioGroup } from './radio-context';
import type { HTMLAttributes } from 'vue';

defineOptions({ name: 'FormRadioGroup' });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    modelValue?: RadioValue;
    /** `v-model.optional` writes `undefined` once the value is emptied. */
    modelModifiers?: ModelModifiers;
    defaultValue?: RadioValue;
    /** A radio per option; or put `FormRadio`s in the default slot instead. */
    options?: (RadioValue | FormRadioOption)[];
    /** `horizontal` lines the radios up in a row. */
    orientation?: 'vertical' | 'horizontal';
    /** Whether arrow keys wrap past the ends. */
    loop?: boolean;
    form?: string;

    /** The question the radios answer. */
    label?: string;
    help?: string;
    /** Shown under the radios, and marks the group invalid. */
    error?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    /** One of the radios must be chosen. Announced and styled, not enforced. */
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
  { modelValue: undefined, defaultValue: undefined, orientation: 'vertical', loop: true }
);

const emit = defineEmits<{
  'update:modelValue': [value: RadioValue | undefined];
}>();

provideFormRadioGroup(true);

const items = computed<FormRadioOption[]>(() =>
  (props.options ?? []).map((option) =>
    typeof option === 'object' ? option : { value: option, label: String(option) }
  )
);
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

    <RadioGroup
      class="form-radio-group"
      :class="controlClass"
      :data-orientation="orientation"
      v-bind="modelBound ? { modelValue } : {}"
      :model-modifiers="modelModifiers"
      :default-value="defaultValue"
      :loop="loop"
      :form="form"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <slot>
        <FormRadio
          v-for="option in items"
          :key="option.value"
          :value="option.value"
          :label="option.label"
          :help="option.help"
          :disabled="option.disabled"
        >
          <template v-if="$slots.option" #label><slot name="option" v-bind="option" :option="option" /></template>
        </FormRadio>
      </slot>
    </RadioGroup>
  </FormField>
</template>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { NumberFieldRoot, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement, isPropBound } from '@vunset/vue';
import { useFieldAttrs } from './use-field-attrs';
import FormField, { type FormSize } from './FormField.vue';
import AppIcon from '../app/AppIcon.vue';

// `class` and `style` dress the field; every other attribute belongs on the `<input>`.
defineOptions({ name: 'FormNumberField', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    /** A number, or `null` when empty. */
    modelValue?: number | null;
    defaultValue?: number | null;
    /** Typing below it is clamped on commit; a minus can't be typed at zero or more. */
    min?: number;
    max?: number;
    /** How far a button or ArrowUp/ArrowDown moves it. @default 1 */
    step?: number;
    /** How far Shift with a step, PageUp or PageDown moves it. @default 10 */
    largeStep?: number;
    /** How the value is shown and read back, as `Intl.NumberFormat` options. */
    format?: Intl.NumberFormatOptions;
    locale?: Intl.LocalesArgument;
    /** Steps with the mouse wheel while the input has focus. */
    wheel?: boolean;
    /** The − and + buttons on either side. */
    buttons?: boolean;
    incrementLabel?: string;
    decrementLabel?: string;

    label?: string;
    help?: string;
    /** Shown under the input, and marks it invalid. */
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
    /** Classes for the `<input>` itself, where `control-class` goes on the box around it. */
    inputClass?: HTMLAttributes['class'];
  }>(),
  {
    modelValue: undefined,
    defaultValue: null,
    step: 1,
    largeStep: 10,
    buttons: true,
    incrementLabel: 'Increase',
    decrementLabel: 'Decrease'
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: number | null];
}>();

const { fieldAttrs, controlAttrs } = useFieldAttrs();
const model = computed(() => (modelBound ? { modelValue: props.modelValue } : {}));
</script>

<template>
  <FormField
    v-bind="fieldAttrs"
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

    <NumberFieldRoot
      v-bind="model"
      class="form-control form-number-field"
      :class="controlClass"
      :default-value="defaultValue"
      :min="min"
      :max="max"
      :step="step"
      :large-step="largeStep"
      :format="format"
      :locale="locale"
      :wheel="wheel"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <NumberFieldDecrement v-if="buttons" class="form-number-field-button" :aria-label="decrementLabel">
        <AppIcon name="number-decrement" class="form-icon" />
      </NumberFieldDecrement>
      <NumberFieldInput v-bind="controlAttrs" class="form-number-field-input" :class="inputClass" />
      <NumberFieldIncrement v-if="buttons" class="form-number-field-button" :aria-label="incrementLabel">
        <AppIcon name="number-increment" class="form-icon" />
      </NumberFieldIncrement>
    </NumberFieldRoot>
  </FormField>
</template>

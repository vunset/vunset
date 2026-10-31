<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import { FieldGroup, Input, Addon, type FieldFilter, isPropBound, type InputModelModifiers } from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import type { HTMLAttributes } from 'vue';
import AppIcon from '../app/AppIcon.vue';

// `class` and `style` dress the field; every other attribute — `placeholder`,
// `autocomplete`, `inputmode`, `aria-*` — belongs on the `<input>`.
defineOptions({ name: 'FormInput', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = defineProps<{
  modelValue?: string | number | null;
  /** `v-model.optional` writes `undefined` once emptied; `.trim` and `.number` work as on an `<input>`. */
  modelModifiers?: InputModelModifiers;
  defaultValue?: string | number;
  /** The native `type`. `number` lets only numeric text be typed. */
  type?: string;
  minLength?: number;
  /** Also enforced while typing and pasting. */
  maxLength?: number;
  /** The lowest valid number. At zero or more, a minus can't be typed at all. */
  min?: number | string;
  max?: number | string;
  step?: number | string;
  /** Checked on the finished value when the form submits. */
  pattern?: string;
  /** What may be typed at all, checked on every keystroke and paste. */
  filter?: FieldFilter;
  /** Rewrites the typed text once it's committed: on blur, or Enter in an input. */
  transform?: (value: string) => string;
  /** A button that empties the input, shown while it holds a value. */
  clearable?: boolean;

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
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const { fieldAttrs, controlAttrs } = useFieldAttrs();
const inputAttrs = computed(() =>
  modelBound ? { ...controlAttrs.value, modelValue: props.modelValue } : controlAttrs.value
);

const control = useTemplateRef<InstanceType<typeof Input>>('control');

function clear() {
  if (!control.value) return;
  control.value.value = '';
  control.value.focus();
}
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

    <FieldGroup v-slot="state" class="form-control form-input" :class="controlClass">
      <Addon v-if="$slots.start" side="start" class="form-addon">
        <slot name="start" v-bind="state" />
      </Addon>

      <Input
        ref="control"
        v-bind="inputAttrs"
        class="form-input-control"
        :class="inputClass"
        :model-modifiers="modelModifiers"
        :default-value="defaultValue"
        :type="type"
        :min-length="minLength"
        :max-length="maxLength"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        :filter="filter"
        :transform="transform"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <button
        v-if="clearable && state.filled && !state.disabled && !state.readOnly"
        type="button"
        tabindex="-1"
        class="form-clear"
        aria-label="Clear"
        @click="clear"
      >
        <AppIcon name="close" class="form-icon" />
      </button>

      <Addon v-if="$slots.end" side="end" class="form-addon">
        <slot name="end" v-bind="state" />
      </Addon>
    </FieldGroup>
  </FormField>
</template>

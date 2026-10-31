<script lang="ts">
/** `stack` puts the label above the control; `inline` beside it, for a switch or a checkbox. */
export type FormFieldLayout = 'stack' | 'inline';

/** A control's height, padding and text. */
export type FormSize = 'sm' | 'md' | 'lg';
</script>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { FieldRoot, FieldLabel, FieldDescription, FieldError, useValidate } from '@vunset/vue';

defineOptions({ name: 'FormField' });

const props = defineProps<{
  label?: string;
  help?: string;
  /** Shown under the control, and marks the field invalid. */
  error?: string;
  layout?: FormFieldLayout;
  /** The label's tag. A group of controls names itself with a `div`, as no one control can take a `<label for>`. */
  labelAs?: string;
  /** The control's form name, and its key into `useValidate()` errors. */
  name?: string;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** Classes for the label, beside its own. */
  labelClass?: HTMLAttributes['class'];
  /** Classes for the help text, beside its own. */
  helpClass?: HTMLAttributes['class'];
  /** Classes for the error message, beside its own. */
  errorClass?: HTMLAttributes['class'];
  /** The control's height, padding and text; the label, help and error keep theirs. @default 'md' */
  size?: FormSize;
}>();

const validation = useValidate();
// Only a message gets an error element: `invalid` alone marks the control, and
// an empty element would still be announced as its description.
const message = computed(() => props.error ?? (props.name ? validation.errors.value[props.name] : undefined));
</script>

<template>
  <FieldRoot
    class="form-field"
    :data-layout="layout ?? 'stack'"
    :data-size="size"
    :id="id"
    :name="name"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :invalid="invalid || error !== undefined"
  >
    <!-- A row only with something beside the label, kept outside it: a link there shouldn't press the label. -->
    <div v-if="$slots['label-start'] || $slots['label-end']" class="form-label-row">
      <span v-if="$slots['label-start']" class="form-label-start"><slot name="label-start" /></span>
      <FieldLabel v-if="label || $slots.label" :as="labelAs" class="form-label" :class="labelClass">
        <slot name="label">{{ label }}</slot>
      </FieldLabel>
      <span v-if="$slots['label-end']" class="form-label-end"><slot name="label-end" /></span>
    </div>
    <FieldLabel v-else-if="label || $slots.label" :as="labelAs" class="form-label" :class="labelClass">
      <slot name="label">{{ label }}</slot>
    </FieldLabel>

    <slot />

    <FieldDescription v-if="help || $slots.help" class="form-help" :class="helpClass">
      <slot name="help">{{ help }}</slot>
    </FieldDescription>

    <FieldError class="form-error" :class="errorClass" :match="message !== undefined">
      <slot name="error" :message="message">{{ message }}</slot>
    </FieldError>
  </FieldRoot>
</template>

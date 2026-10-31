<script setup lang="ts">
import { computed } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import { FieldGroup, Textarea, Addon, type FieldFilter, isPropBound, type InputModelModifiers } from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import type { HTMLAttributes } from 'vue';

// `class` and `style` dress the field; every other attribute — `placeholder`,
// `rows`, `wrap`, `aria-*` — belongs on the `<textarea>`.
defineOptions({ name: 'FormTextarea', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    /** `v-model.optional` writes `undefined` once emptied; `.trim` and `.number` work as on an `<input>`. */
    modelModifiers?: InputModelModifiers;
    defaultValue?: string | number;
    minLength?: number;
    /** Also enforced while typing and pasting. */
    maxLength?: number;
    /** What may be typed at all, checked on every keystroke and paste. */
    filter?: FieldFilter;
  /** Rewrites the typed text once it's committed: on blur, or Enter in an input. */
  transform?: (value: string) => string;
    /** Grows and shrinks with its content, never below `rows`. */
    autosize?: boolean;
    /** With `autosize`, the most rows it grows to before it scrolls. */
    maxRows?: number;

    label?: string;
    help?: string;
    /** Shown under the textarea, and marks it invalid. */
    error?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
    /** Classes for the box around the textarea and its addons, beside its own. */
    controlClass?: HTMLAttributes['class'];
    /** Classes for the label, beside its own. */
    labelClass?: HTMLAttributes['class'];
    /** Classes for the help text, beside its own. */
    helpClass?: HTMLAttributes['class'];
    /** Classes for the error message, beside its own. */
    errorClass?: HTMLAttributes['class'];
    /** The control's height, padding and text; the label, help and error keep theirs. @default 'md' */
    size?: FormSize;
    /** Classes for the `<textarea>` itself, where `control-class` goes on the box around it. */
    textareaClass?: HTMLAttributes['class'];
  }>(),
  { modelValue: undefined, defaultValue: undefined }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const { fieldAttrs, controlAttrs } = useFieldAttrs();
const textareaAttrs = computed(() =>
  modelBound ? { ...controlAttrs.value, modelValue: props.modelValue } : controlAttrs.value
);
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

    <FieldGroup v-slot="state" class="form-control form-textarea" :class="controlClass">
      <Addon v-if="$slots.start" side="start" class="form-addon">
        <slot name="start" v-bind="state" />
      </Addon>

      <Textarea
        v-bind="textareaAttrs"
        class="form-textarea-control"
        :class="textareaClass"
        :model-modifiers="modelModifiers"
        :default-value="defaultValue"
        :min-length="minLength"
        :max-length="maxLength"
        :filter="filter"
        :transform="transform"
        :autosize="autosize"
        :max-rows="maxRows"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <Addon v-if="$slots.end" side="end" class="form-addon">
        <slot name="end" v-bind="state" />
      </Addon>
    </FieldGroup>
  </FormField>
</template>

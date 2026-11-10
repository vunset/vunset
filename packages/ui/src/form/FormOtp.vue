<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { OtpRoot, OtpInput, isPropBound, type FieldFilter, type OtpType } from '@vunset/vue';
import { useFieldAttrs } from './use-field-attrs';
import FormField, { type FormSize } from './FormField.vue';
import AppGroup from '../app/AppGroup.vue';

// `class` and `style` dress the field; every other attribute belongs on the group of boxes.
defineOptions({ name: 'FormOtp', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    defaultValue?: string;
    /** How many characters, one box each. @default 6 */
    length?: number;
    /** `numeric` digits (the default) or `alphanumeric` letters and digits. */
    type?: OtpType;
    /** What one character must pass, in place of `type`. */
    filter?: FieldFilter;
    /** Hides the characters, as a password does. */
    mask?: boolean;
    /** Boxes joined into groups of these sizes, `[3, 3]` for two of three; apart without it. */
    groups?: number[];
    /** Drawn between the groups. */
    separator?: string;
    /** Each box's accessible name. */
    getInputLabel?: (index: number, length: number) => string;

    label?: string;
    help?: string;
    /** Shown under the boxes, and marks them invalid. */
    error?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
    /** Classes for each box, beside its own. */
    controlClass?: HTMLAttributes['class'];
    /** Classes for the label, beside its own. */
    labelClass?: HTMLAttributes['class'];
    /** Classes for the help text, beside its own. */
    helpClass?: HTMLAttributes['class'];
    /** Classes for the error message, beside its own. */
    errorClass?: HTMLAttributes['class'];
    /** The boxes' size; the label, help and error keep theirs. @default 'md' */
    size?: FormSize;
  }>(),
  { modelValue: undefined, length: 6, type: 'numeric', separator: '–' }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  /** Every box is filled. */
  complete: [value: string];
}>();

const { fieldAttrs, controlAttrs } = useFieldAttrs();
const model = computed(() => (modelBound ? { modelValue: props.modelValue } : {}));

// Each group's box indexes; boxes `groups` leaves out go in one more.
const chunks = computed(() => {
  const sizes = props.groups?.filter((size) => size > 0) ?? [props.length];
  const result: number[][] = [];
  let start = 0;
  for (const size of sizes) {
    if (start >= props.length) break;
    const end = Math.min(start + size, props.length);
    result.push(Array.from({ length: end - start }, (_, i) => start + i));
    start = end;
  }
  if (start < props.length) result.push(Array.from({ length: props.length - start }, (_, i) => start + i));
  return result;
});
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

    <OtpRoot
      v-bind="{ ...controlAttrs, ...model }"
      class="form-otp"
      :default-value="defaultValue"
      :length="length"
      :type="type"
      :filter="filter"
      :mask="mask"
      :get-input-label="getInputLabel"
      @update:model-value="emit('update:modelValue', $event)"
      @complete="emit('complete', $event)"
    >
      <template v-for="(chunk, position) in chunks" :key="position">
        <span v-if="position > 0" class="form-otp-separator" aria-hidden="true">{{ separator }}</span>
        <AppGroup v-if="groups">
          <OtpInput v-for="index in chunk" :key="index" :index="index" class="form-control form-otp-input" :class="controlClass" />
        </AppGroup>
        <template v-else>
          <OtpInput v-for="index in chunk" :key="index" :index="index" class="form-control form-otp-input" :class="controlClass" />
        </template>
      </template>
    </OtpRoot>
  </FormField>
</template>

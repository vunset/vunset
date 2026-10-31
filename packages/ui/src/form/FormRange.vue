<script setup lang="ts">
import { computed } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import {
  FieldLabel,
  RangeRoot,
  RangeValue,
  RangeControl,
  RangeTrack,
  RangeIndicator,
  RangeThumb,
  type RangeChangeDetails,
  type RangeOrientation,
  type ThumbAlignment,
  type ThumbCollisionBehavior,
  isPropBound
} from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import type { HTMLAttributes } from 'vue';

defineOptions({ name: 'FormRange', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    /** A number for one thumb, or an array with one entry per thumb. It keeps the shape it was given. */
    modelValue?: number | number[];
    defaultValue?: number | number[];
    min?: number;
    max?: number;
    step?: number;
    /** What Shift with an arrow key, and Page Up / Page Down, move by. */
    largeStep?: number;
    /** The least gap, in steps, between neighboring thumbs. */
    minStepsBetweenValues?: number;
    /** Vertical runs bottom to top. */
    orientation?: RangeOrientation;
    /** `center` puts a thumb's center on its value; `edge` keeps whole thumbs inside the track. */
    thumbAlignment?: ThumbAlignment;
    /** What a dragged thumb does at a neighbor: `push` it along, `swap` past it, or stop (`none`). */
    thumbCollisionBehavior?: ThumbCollisionBehavior;
    /** How the value is shown and announced, as `Intl.NumberFormat` options. */
    format?: Intl.NumberFormatOptions;
    locale?: Intl.LocalesArgument;
    /** Shows the value beside the label. */
    showValue?: boolean;
    /** Names each thumb, in place of the label: "Lowest" and "Highest" for two. */
    thumbLabels?: string[];
    form?: string;

    label?: string;
    help?: string;
    /** Shown under the range, and marks it invalid. */
    error?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
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
  {
    modelValue: undefined,
    defaultValue: undefined,
    min: 0,
    max: 100,
    step: 1,
    largeStep: 10,
    minStepsBetweenValues: 0,
    orientation: 'horizontal',
    thumbAlignment: 'edge',
    thumbCollisionBehavior: 'push',
    showValue: true
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: number | number[]];
  /** Every move, with why it happened. */
  change: [value: number | number[], details: RangeChangeDetails];
  /** Once an interaction settles, if it left the value somewhere new: the moment to save. */
  commit: [value: number | number[], details: RangeChangeDetails];
}>();

// One thumb per value; the shape is fixed by the first value given.
const thumbs = computed(() => {
  const initial = props.modelValue ?? props.defaultValue;
  return Array.isArray(initial) ? initial.length : 1;
});
const { fieldAttrs, controlAttrs } = useFieldAttrs();
</script>

<template>
  <FormField
    v-bind="fieldAttrs"
    :help="help"
    :error="error"
    :name="name"
    :id="id"
    :disabled="disabled"
    :invalid="invalid"
    :help-class="helpClass"
    :error-class="errorClass"
    :size="size"
  >
    <template v-if="$slots.help" #help><slot name="help" /></template>
    <template v-if="$slots.error" #error="{ message }"><slot name="error" :message="message" /></template>

    <RangeRoot
      v-bind="modelBound ? { ...controlAttrs, modelValue } : controlAttrs"
      class="form-range"
      :default-value="defaultValue"
      :min="min"
      :max="max"
      :step="step"
      :large-step="largeStep"
      :min-steps-between-values="minStepsBetweenValues"
      :orientation="orientation"
      :thumb-alignment="thumbAlignment"
      :thumb-collision-behavior="thumbCollisionBehavior"
      :format="format"
      :locale="locale"
      :form="form"
      @update:model-value="emit('update:modelValue', $event)"
      @change="(value, details) => emit('change', value, details)"
      @commit="(value, details) => emit('commit', value, details)"
    >
      <div
        v-if="label || $slots.label || $slots['label-start'] || $slots['label-end'] || showValue"
        class="form-range-header"
      >
        <span v-if="$slots['label-start']" class="form-label-start"><slot name="label-start" /></span>

        <FieldLabel v-if="label || $slots.label" class="form-label" :class="labelClass">
          <slot name="label">{{ label }}</slot>
        </FieldLabel>

        <span v-if="$slots['label-end']" class="form-label-end"><slot name="label-end" /></span>

        <RangeValue v-if="showValue" class="form-range-value">
          <template v-if="$slots.value" #default="state"><slot name="value" v-bind="state" /></template>
        </RangeValue>
      </div>

      <RangeControl class="form-range-control" :class="controlClass">
        <RangeTrack class="form-range-track">
          <RangeIndicator class="form-range-indicator" />

          <RangeThumb
            v-for="index in thumbs"
            :key="index"
            :aria-label="thumbLabels?.[index - 1]"
            class="form-range-thumb"
          />
        </RangeTrack>
      </RangeControl>
    </RangeRoot>
  </FormField>
</template>

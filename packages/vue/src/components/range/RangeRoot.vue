<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import {
  useRange,
  provideRangeContext,
  type RangeChangeDetails,
  type RangeOrientation,
  type ThumbAlignment,
  type ThumbCollisionBehavior
} from './use-range';

defineOptions({ name: 'RangeRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The value, bound with `v-model`: a number, or an array with one entry per thumb. It keeps the shape it was given. */
    modelValue?: number | number[];
    /** The value at first, when no `v-model` owns it. */
    defaultValue?: number | number[];
    /** The lowest value. */
    min?: number;
    /** The highest value. */
    max?: number;
    /** The grid values snap to: `min + k × step`. */
    step?: number;
    /** What Shift with an arrow key, and Page Up / Page Down, move by. */
    largeStep?: number;
    /** The least gap, in steps, between neighboring thumbs. */
    minStepsBetweenValues?: number;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** Which way the control runs. Vertical runs bottom to top. */
    orientation?: RangeOrientation;
    /** `center` puts a thumb's center on its value; `edge` keeps whole thumbs inside the control. */
    thumbAlignment?: ThumbAlignment;
    /** What a dragged thumb does at a neighbor: `push` it along, `swap` past it, or stop (`none`). */
    thumbCollisionBehavior?: ThumbCollisionBehavior;
    /** How values are written in `RangeValue` and announced, as `Intl.NumberFormat` options. */
    format?: Intl.NumberFormatOptions;
    /** The locale for `format`. The page's when not given. */
    locale?: Intl.LocalesArgument;
    /** The root's id. */
    id?: string;
    /** The form field name, set on every thumb's input. */
    name?: string;
    /** The id of a `<form>` to submit with, when the range sits outside it. */
    form?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    min: 0,
    max: 100,
    step: 1,
    largeStep: 10,
    minStepsBetweenValues: 0,
    disabled: false,
    invalid: false,
    orientation: 'horizontal',
    thumbAlignment: 'center',
    thumbCollisionBehavior: 'push',
    as: 'div'
  }
);

const emit = defineEmits<{
  /** The new value, for `v-model`. */
  'update:modelValue': [value: number | number[]];
  /** Every move, with why it happened: `drag`, `track-press`, `keyboard` or `input-change`. */
  change: [value: number | number[], details: RangeChangeDetails];
  /** Once an interaction settles, if it left the value somewhere new: the moment to save. */
  commit: [value: number | number[], details: RangeChangeDetails];
}>();

const api = useRange({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  min: toRef(() => props.min),
  max: toRef(() => props.max),
  step: toRef(() => props.step),
  largeStep: toRef(() => props.largeStep),
  minStepsBetweenValues: toRef(() => props.minStepsBetweenValues),
  disabled: toRef(() => props.disabled),
  invalid: toRef(() => props.invalid),
  orientation: toRef(() => props.orientation),
  thumbAlignment: toRef(() => props.thumbAlignment),
  thumbCollisionBehavior: toRef(() => props.thumbCollisionBehavior),
  format: toRef(() => props.format),
  locale: toRef(() => props.locale),
  id: toRef(() => props.id),
  name: toRef(() => props.name),
  form: toRef(() => props.form),
  onChange: (value, details) => {
    emit('update:modelValue', value);
    emit('change', value, details);
  },
  onCommit: (value, details) => emit('commit', value, details)
});

provideRangeContext(api);
defineExpose(api);

const merged = usePartProps(api.rootProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="api.state.value" />
  </Part>
</template>

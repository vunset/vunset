<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { applyModelModifiers, type ModelModifiers } from '../../shared/model-modifiers';
import { useTimepicker, provideTimepickerContext, type HourCycle, type TimepickerState } from './use-timepicker';
import type { Align, Side } from '../../shared/use-positioning';

defineOptions({ name: 'TimepickerRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The time, bound with `v-model`: `HH:mm`, or `HH:mm:ss` with `seconds`. `null` while empty. */
    modelValue?: string | null;
    /** `v-model.optional` writes `undefined` once emptied. */
    modelModifiers?: ModelModifiers;
    /** The time at first, when no `v-model` owns it. */
    defaultValue?: string | null;
    /** Adds a seconds segment and column, and writes `HH:mm:ss`. */
    seconds?: boolean;
    /** The earliest time that can be stepped to or picked, `HH:mm(:ss)`. A typed time before it marks the picker invalid. */
    min?: string | null;
    /** The latest time that can be stepped to or picked, `HH:mm(:ss)`. A typed time after it marks the picker invalid. */
    max?: string | null;
    /** `12` shows the hour as 12, 01–11 beside an AM/PM segment. The value stays 24-hour. */
    hourCycle?: HourCycle;
    /** The AM/PM segment's text; typing either one's first letter sets it. */
    periodLabels?: readonly [string, string];
    /** Whether the popup is open, bound with `v-model:open`. */
    open?: boolean;
    /** Opens the popup when focus enters the segments, and leaves focus there. `false` leaves opening to `TimepickerTrigger`. */
    openOnFocus?: boolean;
    /** Which side of the picker the popup prefers. */
    side?: Side;
    /** How the popup lines up along that side. */
    align?: Align;
    /** The gap between the picker and the popup, in pixels. */
    sideOffset?: number;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Shows the time but changes nothing. Inside a `FieldRoot`, follows the field. */
    readOnly?: boolean;
    /** A time must be entered. Announced and styled, not enforced. Inside a `FieldRoot`, follows the field. */
    required?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** Submits the time as `HH:mm(:ss)` under this name. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The id of a `<form>` to submit with, when the picker sits outside it. */
    form?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    seconds: false,
    hourCycle: 24,
    periodLabels: () => ['AM', 'PM'] as const,
    open: undefined,
    openOnFocus: true,
    side: 'bottom',
    align: 'start',
    sideOffset: 8,
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    as: 'div'
  }
);

const emit = defineEmits<{
  /** The new time, for `v-model`; `null` once any segment is emptied. */
  'update:modelValue': [value: string | null | undefined];
  /** The popup opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
}>();

defineSlots<{
  default(props: TimepickerState): unknown;
}>();

const picker = useTimepicker({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue,
  seconds: () => props.seconds,
  min: () => props.min,
  max: () => props.max,
  hourCycle: () => props.hourCycle,
  periodLabels: () => props.periodLabels,
  open: () => props.open,
  openOnFocus: () => props.openOnFocus,
  side: () => props.side,
  align: () => props.align,
  sideOffset: () => props.sideOffset,
  disabled: () => props.disabled,
  readOnly: () => props.readOnly,
  required: () => props.required,
  invalid: () => props.invalid,
  name: () => props.name,
  form: () => props.form,
  onChange: (value) => emit('update:modelValue', applyModelModifiers(value, props.modelModifiers)),
  onOpenChange: (open) => emit('update:open', open)
});

provideTimepickerContext(picker);

defineExpose({ value: picker.value, open: picker.open, state: picker.state, clear: picker.clear });

const merged = usePartProps(picker.rootProps);
const { state, hiddenValue, name, form } = picker;
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
    <input v-if="name()" type="hidden" :name="name()" :value="hiddenValue" :form="form()" />
  </Part>
</template>

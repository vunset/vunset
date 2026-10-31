<script setup lang="ts">
import { applyModelModifiers } from '../../shared/model-modifiers';
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import {
  useCalendar,
  provideCalendarContext,
  serializeCalendarValue,
  type CalendarModelModifiers,
  type CalendarModelValue,
  type CalendarPresetsInput,
  type CalendarSelectionMode,
  type CalendarValue,
  type CalendarValueInput
} from './use-calendar';
import type { DateInput, DatePresetKey, WeekDay } from '@vunset/utils';

defineOptions({ name: 'CalendarRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The selection, bound with `v-model`: a date, a `[start, end]` range, or a list of dates. */
    modelValue?: CalendarValueInput;
    /** `v-model.iso` emits `YYYY-MM-DD` strings; `.safe` steps today back while UTC is still on yesterday; `.optional` writes `undefined` once emptied. */
    modelModifiers?: CalendarModelModifiers;
    /** The selection at first, when no `v-model` owns it. */
    defaultValue?: CalendarValueInput;
    /** Picks one day, a range from one day to another, or any number of days. */
    mode?: CalendarSelectionMode;
    /** Which month opens when nothing is selected to open on. */
    defaultMonth?: DateInput;
    /** The earliest day that can be picked. The arrows stop here too. */
    min?: DateInput;
    /** The latest day that can be picked. */
    max?: DateInput;
    /** Nothing after today can be picked; the earlier of the two with `max`. */
    maxToday?: boolean;
    /** Individual days to rule out. */
    disabledDates?: DateInput[];
    /** Rules out days a list cannot express — every weekend, every holiday. */
    isDateDisabled?: (date: Date) => boolean;
    /** The day each week starts on. `0` is Sunday. Defaults to the locale's. */
    firstDayOfWeek?: WeekDay;
    /** Always draw six rows, so the calendar keeps its height month to month. */
    fixedWeeks?: boolean;
    /** Names the months and the weekdays. Defaults to the runtime's locale. */
    locale?: Intl.LocalesArgument;
    /** The presets `CalendarPresets` offers: `base`, `all`, or a list of keys, custom ones and groups (`['base', 'q1']`). */
    presets?: CalendarPresetsInput;
    /** A preset whose days are the starting value, used while the value is empty. A bound `v-model` receives them. */
    preset?: DatePresetKey | (string & {});
    /** Whether the rolling presets end today rather than yesterday. */
    includeToday?: boolean;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Readable and walkable, but nothing can be picked. Inside a `FieldRoot`, follows the field. */
    readOnly?: boolean;
    /** A day must be picked. Announced and styled, not enforced. Inside a `FieldRoot`, follows the field. */
    required?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** Submits each picked day as `YYYY-MM-DD` under this name; a range once both ends are picked. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The id of a `<form>` to submit with, when the calendar sits outside it. */
    form?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    mode: 'single',
    firstDayOfWeek: undefined,
    fixedWeeks: false,
    maxToday: false,
    includeToday: false,
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    as: 'div'
  }
);

const emit = defineEmits<{
  /** The new selection, for `v-model`: dates, or `YYYY-MM-DD` with `.iso`. */
  'update:modelValue': [value: CalendarModelValue | undefined];
  /** The same new selection, for a listener without `v-model`. */
  change: [value: CalendarValue];
}>();

const api = useCalendar({
  mode: () => props.mode,
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue,
  defaultMonth: () => props.defaultMonth,
  min: () => props.min,
  max: () => props.max,
  maxToday: () => props.maxToday,
  disabledDates: () => props.disabledDates,
  isDateDisabled: props.isDateDisabled,
  firstDayOfWeek: () => props.firstDayOfWeek,
  fixedWeeks: () => props.fixedWeeks,
  locale: () => props.locale,
  presets: () => props.presets,
  preset: () => props.preset,
  includeToday: () => props.includeToday,
  disabled: () => props.disabled,
  readOnly: () => props.readOnly,
  required: () => props.required,
  invalid: () => props.invalid,
  name: () => props.name,
  form: () => props.form,
  onChange: (value) => {
    const serialized = serializeCalendarValue(value, props.modelModifiers);
    emit('update:modelValue', applyModelModifiers(serialized, props.modelModifiers));
    emit('change', value);
  }
});

provideCalendarContext(api);
defineExpose(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps(api.rootProps.value, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="api.state.value" />

    <input
      v-for="hidden in api.hiddenInputs.value"
      :key="hidden.value"
      type="hidden"
      :name="hidden.name"
      :value="hidden.value"
      :form="hidden.form"
    />
  </Part>
</template>

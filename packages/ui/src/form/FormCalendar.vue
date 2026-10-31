<script setup lang="ts">
import {
  CalendarRoot,
  type CalendarModelModifiers,
  type CalendarModelValue,
  type CalendarPresetsInput,
  type CalendarSelectionMode,
  type CalendarValueInput,
  type DateInput,
  type DatePresetKey,
  type WeekDay,
  isPropBound
} from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import FormCalendarPanel, { calendarPresets } from './FormCalendarPanel.vue';
import { computed, type HTMLAttributes } from 'vue';

defineOptions({ name: 'FormCalendar' });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    /** A date, a `[start, end]` range, or a list of dates. */
    modelValue?: CalendarValueInput;
    /** `v-model.iso` emits `YYYY-MM-DD` strings; `.safe` steps today back while UTC is still on yesterday. */
    modelModifiers?: CalendarModelModifiers;
    defaultValue?: CalendarValueInput;
    /** Picks one day, a range from one day to another, or any number of days. */
    mode?: CalendarSelectionMode;
    /** Which month opens when nothing is selected to open on. */
    defaultMonth?: DateInput;
    min?: DateInput;
    max?: DateInput;
    /** Nothing after today can be picked. */
    maxToday?: boolean;
    disabledDates?: DateInput[];
    /** Rules out days a list cannot express — every weekend, every holiday. */
    isDateDisabled?: (date: Date) => boolean;
    /** The day each week starts on. `0` is Sunday. */
    firstDayOfWeek?: WeekDay;
    /** Always six rows, so the calendar keeps its height. */
    fixedWeeks?: boolean;
    locale?: Intl.LocalesArgument;
    /** Under the grid: `base`, `all`, or a list of `today`, `last-7`, … or your own. Unset, a range shows `base`; `false` shows none. */
    presets?: CalendarPresetsInput | boolean;
    /** Adds This Year to the presets. */
    withYear?: boolean;
    /** Adds Q1–Q4 to the presets, as one group; a quarter yet to start is disabled. */
    withQuarters?: boolean;
    /** A preset whose days are the starting value, used while the value is empty. */
    preset?: DatePresetKey | (string & {});
    /** Whether the rolling presets end today rather than yesterday. */
    includeToday?: boolean;
    form?: string;

    label?: string;
    help?: string;
    /** Shown under the calendar, and marks it invalid. */
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
  }>(),
  { mode: 'single', firstDayOfWeek: 1, fixedWeeks: true, presets: undefined }
);

const emit = defineEmits<{
  'update:modelValue': [value: CalendarModelValue | undefined];
}>();

const presetList = computed(() => calendarPresets(props.presets, props.mode, props.withYear, props.withQuarters));
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

    <CalendarRoot
      class="form-calendar"
      :class="controlClass"
      v-bind="modelBound ? { modelValue } : {}"
      :model-modifiers="modelModifiers"
      :default-value="defaultValue"
      :mode="mode"
      :default-month="defaultMonth"
      :min="min"
      :max="max"
      :max-today="maxToday"
      :disabled-dates="disabledDates"
      :is-date-disabled="isDateDisabled"
      :first-day-of-week="firstDayOfWeek"
      :fixed-weeks="fixedWeeks"
      :locale="locale"
      :presets="presetList"
      :preset="preset"
      :include-today="includeToday"
      :form="form"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <FormCalendarPanel :presets="presetList.length > 0" />
    </CalendarRoot>
  </FormField>
</template>

<script setup lang="ts">
import {
  DatepickerRoot,
  DatepickerTrigger,
  DatepickerValue,
  DatepickerClear,
  Portal,
  Positioner,
  Popup,
  type Align,
  type CalendarModelModifiers,
  type CalendarModelValue,
  type CalendarPresetsInput,
  type CalendarSelectionMode,
  type CalendarValueInput,
  type DateInput,
  type DatePresetKey,
  type Side,
  type WeekDay,
  isPropBound
} from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import FormCalendarPanel, { calendarPresets } from './FormCalendarPanel.vue';
import { computed, type HTMLAttributes } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import AppIcon from '../app/AppIcon.vue';

defineOptions({ name: 'FormDatepicker', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');
const openBound = isPropBound('open');

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
    /** Always six rows, so the popup keeps its height. */
    fixedWeeks?: boolean;
    /** Names the months and weekdays, and writes the value. */
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
    open?: boolean;
    /** Whether a complete pick closes the popup. Defaults to on, except for `multiple`. */
    closeOnSelect?: boolean;
    side?: Side;
    align?: Align;
    sideOffset?: number;
    /** A button that empties the value, shown while there is one. */
    clearable?: boolean;
    form?: string;

    label?: string;
    help?: string;
    /** Shown under the datepicker, and marks it invalid. */
    error?: string;
    placeholder?: string;
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
    /** Classes for the popup, beside its own. */
    popupClass?: HTMLAttributes['class'];
  }>(),
  {
    mode: 'single',
    firstDayOfWeek: 1,
    fixedWeeks: true,
    presets: undefined,
    open: undefined,
    closeOnSelect: undefined,
    side: 'bottom',
    align: 'start',
    sideOffset: 6,
    clearable: false
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: CalendarModelValue | undefined];
  'update:open': [open: boolean];
}>();

const presetList = computed(() => calendarPresets(props.presets, props.mode, props.withYear, props.withQuarters));
const { fieldAttrs, controlAttrs } = useFieldAttrs();
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

    <DatepickerRoot
      class="form-control form-datepicker"
      :class="controlClass"
      v-bind="{ ...(modelBound ? { modelValue } : {}), ...(openBound ? { open } : {}) }"
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
      :close-on-select="closeOnSelect"
      :side="side"
      :align="align"
      :side-offset="sideOffset"
      :form="form"
      @update:model-value="emit('update:modelValue', $event)"
      @update:open="emit('update:open', $event)"
    >
      <DatepickerTrigger v-bind="controlAttrs" class="form-datepicker-trigger">
        <span class="form-addon">
          <slot name="icon">
            <AppIcon name="calendar" class="form-icon" />
          </slot>
        </span>

        <DatepickerValue :placeholder="placeholder" class="form-datepicker-value">
          <template v-if="$slots.value" #default="value"><slot name="value" v-bind="value" /></template>
        </DatepickerValue>
      </DatepickerTrigger>

      <DatepickerClear v-if="clearable" class="form-clear">
        <AppIcon name="close" class="form-icon" />
      </DatepickerClear>

      <Portal>
        <Positioner>
          <Popup class="app-surface form-datepicker-popup form-calendar" :class="popupClass">
            <FormCalendarPanel :presets="presetList.length > 0" />
          </Popup>
        </Positioner>
      </Portal>
    </DatepickerRoot>
  </FormField>
</template>

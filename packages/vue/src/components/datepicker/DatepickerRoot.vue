<script lang="ts">
import { applyModelModifiers } from '../../shared/model-modifiers';
import type { ComputedRef } from 'vue';
import { createContext } from '../../shared/context';
import type { CalendarState } from '../calendar/use-calendar';

export interface DatepickerState extends CalendarState {
  /**
   * Whether the popup is open.
   * @attribute `data-open` while open
   */
  open: boolean;
}

export interface DatepickerContext {
  state: ComputedRef<DatepickerState>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  clearProps: ComputedRef<Record<string, unknown>>;
  /** The value as text, empty while nothing is picked. */
  text: ComputedRef<string>;
  hooks: ComputedRef<Record<string, string>>;
}

export const { provideContext: provideDatepickerContext, useContext: useDatepickerContext } =
  createContext<DatepickerContext>('Datepicker');
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, ref, useAttrs, useId, watch } from 'vue';
import { formatDate, formatDateRange, type DateInput, type DatePresetKey, type WeekDay } from '@vunset/utils';
import { mergeProps } from '../../shared/merge-props';
import { dataAttrs } from '../../shared/data-attrs';
import { provideSurface } from '../../shared/surface';
import { useOptionalFieldContext } from '../../shared/use-field';
import { usePopover } from '../popover/use-popover';
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
} from '../calendar/use-calendar';
import type { Align, Side } from '../../shared/use-positioning';

defineOptions({ name: 'DatepickerRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The selection, bound with `v-model`: a date, a `[start, end]` range, or a list of dates. */
    modelValue?: CalendarValueInput;
    /** `v-model.iso` emits `YYYY-MM-DD` strings; `.safe` steps today back while UTC is still on yesterday. */
    modelModifiers?: CalendarModelModifiers;
    /** The selection at first, when no `v-model` owns it. */
    defaultValue?: CalendarValueInput;
    /** Picks one day, a range from one day to another, or any number of days. */
    mode?: CalendarSelectionMode;
    /** Which month opens when nothing is selected to open on. */
    defaultMonth?: DateInput;
    /** The earliest day that can be picked. */
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
    /** Always draw six rows, so the popup keeps its height month to month. */
    fixedWeeks?: boolean;
    /** Names the months and weekdays, and writes the value. @default 'en-US' for the value */
    locale?: Intl.LocalesArgument;
    /** The presets `CalendarPresets` offers: `base` (the six rolling ranges), `all` (adds this year and the quarters), or a list of keys, custom ones and groups. */
    presets?: CalendarPresetsInput;
    /** A preset whose days are the starting value, used while the value is empty. A bound `v-model` receives them. */
    preset?: DatePresetKey | (string & {});
    /** Whether the rolling presets end today rather than yesterday. */
    includeToday?: boolean;
    /** Whether the popup is open, bound with `v-model:open`. */
    open?: boolean;
    /** Whether a complete pick closes the popup. Defaults to on, except for `multiple`. */
    closeOnSelect?: boolean;
    /** Which side of the trigger the popup prefers. */
    side?: Side;
    /** How the popup lines up along that side. */
    align?: Align;
    /** The gap between the trigger and the popup, in pixels. */
    sideOffset?: number;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Shows the value but opens nothing. Inside a `FieldRoot`, follows the field. */
    readOnly?: boolean;
    /** A day must be picked. Announced and styled, not enforced. Inside a `FieldRoot`, follows the field. */
    required?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** Submits each picked day as `YYYY-MM-DD` under this name. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The id of a `<form>` to submit with, when the datepicker sits outside it. */
    form?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    mode: 'single',
    firstDayOfWeek: undefined,
    fixedWeeks: true,
    maxToday: false,
    includeToday: false,
    open: undefined,
    closeOnSelect: undefined,
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
  /** The new selection, for `v-model`: dates, or `YYYY-MM-DD` with `.iso`. */
  'update:modelValue': [value: CalendarModelValue | undefined];
  /** The popup opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
}>();

const field = useOptionalFieldContext();
const generatedId = useId();

const closeOnSelect = () => props.closeOnSelect ?? props.mode !== 'multiple';

// Before the calendar: a `preset` can publish while it sets up, and a pick closes this.
const popover = usePopover({
  open: () => props.open,
  side: () => props.side,
  align: () => props.align,
  sideOffset: () => props.sideOffset,
  onChange: (open) => emit('update:open', open)
});

const calendar = useCalendar({
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
  autofocusDay: true,
  onChange(value) {
    const serialized = serializeCalendarValue(value, props.modelModifiers);
    emit('update:modelValue', applyModelModifiers(serialized, props.modelModifiers));
    if (closeOnSelect() && isComplete(value)) popover.open.value = false;
  }
});

provideCalendarContext(calendar);

// A range is published only once both ends are picked, so any value that isn't empty is complete.
function isComplete(value: CalendarValue): boolean {
  return value !== null && !(Array.isArray(value) && value.length === 0);
}

// A range left with one end is closed onto that day.
watch(popover.open, (open) => {
  if (!open) calendar.completeRange();
});

const locked = () => calendar.state.value.disabled || calendar.state.value.readOnly;

const state = computed<DatepickerState>(() => ({ ...calendar.state.value, open: popover.open.value }));
const hooks = computed(() =>
  dataAttrs(state.value, {
    month: () => null,
    year: () => null,
    monthLabel: () => null,
    yearLabel: () => null,
    selected: () => null,
    readOnly: (on: boolean) => (on ? { 'data-readonly': '' } : null),
    open: (on: boolean) => (on ? { 'data-open': '' } : null)
  })
);

const text = computed(() => {
  const dates = calendar.state.value.selected;
  const locale = props.locale;
  if (!dates.length) return '';

  if (props.mode === 'range') {
    const [from, to] = [...dates].sort((a, b) => a.getTime() - b.getTime());
    return to ? formatDateRange(from!, to, { locale }) : `${formatDate(from!, { locale })} –`;
  }
  if (dates.length > 2) return `${dates.length} days`;
  return dates.map((date) => formatDate(date, { locale })).join(', ');
});

// Focus counts as inside while it's in the trigger or the popup.
const triggerEl = ref<HTMLElement | null>(null);
const popupEl = ref<HTMLElement | null>(null);

function onFocusout(event: FocusEvent) {
  const next = event.relatedTarget;
  if (next instanceof Node && (triggerEl.value?.contains(next) || popupEl.value?.contains(next))) return;

  field?.setFocused(false);
  field?.setTouched(true);
}

const triggerId = computed(() => field?.controlId.value ?? generatedId);

const triggerProps = computed(() => {
  const base = popover.triggerProps.value;
  const baseRef = base.ref as (el: unknown) => void;
  const labelledBy = field?.labelledBy.value;

  return {
    ...base,
    ...hooks.value,
    'data-part': 'trigger',
    id: triggerId.value,
    disabled: calendar.state.value.disabled || undefined,
    // The label, then the trigger's own text: the value.
    'aria-labelledby': labelledBy ? `${labelledBy} ${triggerId.value}` : undefined,
    'aria-describedby': field?.describedBy.value,
    'aria-required': calendar.state.value.required || undefined,
    'aria-invalid': calendar.state.value.invalid || undefined,
    ref(el: unknown) {
      baseRef(el);
      triggerEl.value = (el as HTMLElement) ?? null;
      field?.setControl(triggerEl.value);
    },
    onClick() {
      if (locked()) return;
      // Pressed but not focused (Safari, a label): focus it, so closing can hand focus back here.
      triggerEl.value?.focus();
      popover.open.value = !popover.open.value;
    },
    onFocusin: () => field?.setFocused(true),
    onFocusout
  };
});

const popupProps = computed(() => {
  const base = popover.popupProps.value;
  const baseRef = base.ref as (el: unknown) => void;

  return {
    ...base,
    'aria-labelledby': base['aria-labelledby'] ?? field?.labelledBy.value,
    ref(el: unknown) {
      baseRef(el);
      popupEl.value = (el as HTMLElement) ?? null;
    },
    onFocusin: () => field?.setFocused(true),
    onFocusout
  };
});

// The popover's surface, with the popup above in place of its own.
provideSurface({
  present: popover.present,
  state: popover.state,
  popupProps,
  positionerProps: popover.positionerProps,
  arrowProps: popover.arrowProps
});

const clearProps = computed(() => ({
  ...hooks.value,
  'data-part': 'clear',
  type: 'button',
  'aria-label': 'Clear',
  onClick() {
    if (locked()) return;
    calendar.clear();
    triggerEl.value?.focus();
  }
}));

provideDatepickerContext({ state, triggerProps, clearProps, text, hooks });

defineExpose({ value: calendar.value, open: popover.open, state, clear: calendar.clear });

const attrs = useAttrs();
const rootProps = computed(() => mergeProps({ ...hooks.value, 'data-part': 'datepicker' }, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="state" />

    <input
      v-for="hidden in calendar.hiddenInputs.value"
      :key="hidden.value"
      type="hidden"
      :name="hidden.name"
      :value="hidden.value"
      :form="hidden.form"
    />
  </Part>
</template>

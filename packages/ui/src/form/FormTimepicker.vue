<script setup lang="ts">
import {
  TimepickerRoot,
  TimepickerInput,
  TimepickerTrigger,
  TimepickerClear,
  TimepickerColumn,
  Portal,
  Positioner,
  Popup,
  type Align,
  type HourCycle,
  type ModelModifiers,
  type Side,
  isPropBound
} from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import { type HTMLAttributes } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import AppIcon from '../app/AppIcon.vue';

defineOptions({ name: 'FormTimepicker', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');
const openBound = isPropBound('open');

const props = withDefaults(
  defineProps<{
    /** `HH:mm`, or `HH:mm:ss` with `seconds`; `null` while empty. */
    modelValue?: string | null;
    /** `v-model.optional` writes `undefined` once emptied. */
    modelModifiers?: ModelModifiers;
    defaultValue?: string | null;
    /** Adds a seconds segment and column. */
    seconds?: boolean;
    /** The earliest time the arrows and columns reach, `HH:mm(:ss)`. A typed time before it marks the field invalid. */
    min?: string | null;
    /** The latest time the arrows and columns reach, `HH:mm(:ss)`. A typed time after it marks the field invalid. */
    max?: string | null;
    /** `12` shows 12, 01–11 with an AM/PM segment and column. The value stays 24-hour. @default 24 */
    hourCycle?: HourCycle;
    /** The AM/PM text. @default ['AM', 'PM'] */
    periodLabels?: readonly [string, string];
    open?: boolean;
    /** Opens the popup when the segments get focus. `false` opens it only from the clock. */
    openOnFocus?: boolean;
    side?: Side;
    align?: Align;
    sideOffset?: number;
    /** A button that empties the value, shown while there is one. */
    clearable?: boolean;
    form?: string;

    label?: string;
    help?: string;
    /** Shown under the timepicker, and marks it invalid. */
    error?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
    /** The trigger's name for screen readers. @default 'Choose time' */
    triggerLabel?: string;
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
    seconds: false,
    hourCycle: 24,
    periodLabels: () => ['AM', 'PM'] as const,
    open: undefined,
    openOnFocus: true,
    side: 'bottom',
    align: 'start',
    sideOffset: 6,
    clearable: false,
    triggerLabel: 'Choose time'
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string | null | undefined];
  'update:open': [open: boolean];
}>();

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

    <TimepickerRoot
      class="form-control form-timepicker"
      :class="controlClass"
      v-bind="{ ...(modelBound ? { modelValue } : {}), ...(openBound ? { open } : {}) }"
      :model-modifiers="modelModifiers"
      :default-value="defaultValue"
      :seconds="seconds"
      :min="min"
      :max="max"
      :hour-cycle="hourCycle"
      :period-labels="periodLabels"
      :open-on-focus="openOnFocus"
      :side="side"
      :align="align"
      :side-offset="sideOffset"
      :form="form"
      @update:model-value="emit('update:modelValue', $event)"
      @update:open="emit('update:open', $event)"
    >
      <TimepickerTrigger class="form-addon form-timepicker-trigger" :aria-label="triggerLabel">
        <slot name="icon">
          <AppIcon name="clock" class="form-icon" />
        </slot>
      </TimepickerTrigger>

      <TimepickerInput v-bind="controlAttrs" class="form-timepicker-input" />

      <TimepickerClear v-if="clearable" class="form-clear">
        <AppIcon name="close" class="form-icon" />
      </TimepickerClear>

      <Portal>
        <Positioner>
          <Popup class="app-surface form-timepicker-popup" :class="popupClass">
            <TimepickerColumn unit="hour" class="form-timepicker-column" />
            <div data-part="separator" class="form-timepicker-separator" aria-hidden="true" />
            <TimepickerColumn unit="minute" class="form-timepicker-column" />
            <div v-if="seconds" data-part="separator" class="form-timepicker-separator" aria-hidden="true" />
            <TimepickerColumn unit="second" class="form-timepicker-column" />
            <TimepickerColumn unit="period" class="form-timepicker-column" />
          </Popup>
        </Positioner>
      </Portal>
    </TimepickerRoot>
  </FormField>
</template>

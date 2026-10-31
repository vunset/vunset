<script setup lang="ts">
import { computed } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectClear,
  SelectIndicator,
  SelectSearch,
  SelectPresets,
  SelectScrollIndicator,
  SelectList,
  SelectEmpty,
  Addon,
  Portal,
  Positioner,
  Popup,
  type Align,
  type ListboxItem,
  type ListboxOption,
  type ListboxOptionValue,
  type ListboxOrder,
  type ListboxPresetItem,
  type Side,
  isPropBound,
  type ModelModifiers
} from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import type { HTMLAttributes } from 'vue';
import AppIcon from '../app/AppIcon.vue';

// `class` and `style` go on the field; every other attribute (`aria-label`) on the trigger.
defineOptions({ name: 'FormSelect', inheritAttrs: false });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');
const openBound = isPropBound('open');

const props = withDefaults(
  defineProps<{
    modelValue?: ListboxOptionValue | ListboxOptionValue[] | null;
    /** `v-model.optional` writes `undefined` once the value is emptied. */
    modelModifiers?: ModelModifiers;
    defaultValue?: ListboxOptionValue | ListboxOptionValue[] | null;
    options?: ListboxItem[];
    multiple?: boolean;
    /** A search box at the top of the popup. */
    searchable?: boolean;
    /** Offers a button that drops the whole selection. */
    clearable?: boolean;
    /** How many chosen options the trigger names before the rest collapse into a count. */
    flatten?: number;
    /** Whether choosing an option closes the popup. Defaults to on for a single select. */
    closeOnSelect?: boolean;
    /** Places the popup so the chosen option sits on the trigger. Ignored while `searchable`. */
    alignWithTrigger?: boolean;
    open?: boolean;
    loop?: boolean;
    /** Renders only the options near the scroll position, for long flat lists. Needs `maxHeight`. */
    virtual?: boolean;
    /** Caps the list, which then scrolls. A number is pixels. */
    maxHeight?: number | string;
    /** `selected-first` lifts what is selected to the top of its group, each time the popup opens. */
    order?: ListboxOrder;
    /** Named sets of values offered above the list. Multiple only. */
    presets?: ListboxPresetItem[];
    /** Names the presets outside a group, so they fold like one: "Saved". */
    presetsLabel?: string;
    /** Lays the presets out in this many columns, widening the popup to fit: for a long set. */
    presetColumns?: number;
    valueKey?: string;
    labelKey?: string;
    filter?: (option: ListboxOption, query: string) => boolean;
    side?: Side;
    align?: Align;
    sideOffset?: number;

    label?: string;
    help?: string;
    /** Shown under the select, and marks it invalid. */
    error?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
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
    modelValue: undefined,
    defaultValue: undefined,
    open: undefined,
    closeOnSelect: undefined,
    clearable: false,
    loop: true,
    searchPlaceholder: 'Search',
    emptyText: 'No matches'
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: ListboxOptionValue | ListboxOptionValue[] | null | undefined];
  'update:open': [open: boolean];
}>();

// Everything the select itself takes; the field-wide state goes to `FormField`,
// which the select inherits it from.
const selectProps = computed(() => {
  const {
    label,
    help,
    error,
    placeholder,
    searchPlaceholder,
    emptyText,
    name,
    id,
    disabled,
    readOnly,
    required,
    invalid,
    controlClass,
    popupClass,
    presetColumns,
    labelClass,
    helpClass,
    errorClass,
    size,
    modelValue,
    open,
    ...rest
  } = props;
  return { ...rest, ...(modelBound ? { modelValue } : {}), ...(openBound ? { open } : {}) };
});

const { fieldAttrs, controlAttrs: triggerAttrs } = useFieldAttrs();
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

    <SelectRoot
      v-bind="selectProps"
      class="form-select"
      @update:model-value="emit('update:modelValue', $event)"
      @update:open="emit('update:open', $event)"
    >
      <SelectTrigger
        v-slot="state"
        class="form-control form-select-trigger"
        :class="controlClass"
        v-bind="triggerAttrs"
      >
        <Addon v-if="$slots.start" side="start" class="form-addon">
          <slot name="start" v-bind="state" />
        </Addon>

        <SelectValue :placeholder="placeholder" class="form-select-value">
          <template v-if="$slots.value" #default="value"><slot name="value" v-bind="value" /></template>
        </SelectValue>

        <Addon v-if="$slots.end" side="end" class="form-addon">
          <slot name="end" v-bind="state" />
        </Addon>

        <SelectClear class="form-clear">
          <slot name="clear">
            <AppIcon name="close" class="form-icon" />
          </slot>
        </SelectClear>

        <SelectIndicator class="form-listbox-indicator">
          <slot name="indicator">
            <AppIcon name="listbox-indicator" class="form-icon" />
          </slot>
        </SelectIndicator>
      </SelectTrigger>

      <Portal>
        <Positioner>
          <Popup
            class="form-listbox-popup"
            :class="popupClass"
            :data-preset-columns="presetColumns"
            :style="presetColumns ? { '--form-listbox-preset-columns': presetColumns } : undefined"
          >
            <SelectSearch v-if="searchable" :placeholder="searchPlaceholder" class="form-select-search" />

            <div class="form-listbox-body">
              <SelectPresets class="form-listbox-presets">
                <template #preset="preset">
                  <slot name="preset" v-bind="preset">
                    <span class="form-listbox-preset-check" aria-hidden="true">
                      <AppIcon v-if="preset.active" name="checkbox-checked" />
                    </span>
                    <span class="form-listbox-preset-label" :title="preset.label">{{ preset.label }}</span>
                  </slot>
                </template>

                <template #replace>
                  <AppIcon name="swap" class="form-icon" />
                </template>

                <template #group-indicator>
                  <AppIcon name="chevron-down" class="form-listbox-preset-chevron" />
                </template>
              </SelectPresets>

              <!-- The arrows sit at the list's own ends, under the search and presets. -->
              <div class="form-listbox-viewport">
                <SelectScrollIndicator direction="up" class="form-listbox-scroll">
                  <AppIcon name="chevron-up" class="form-icon" />
                </SelectScrollIndicator>

                <SelectList class="form-listbox-list">
                  <template v-if="$slots.option" #option="option"><slot name="option" v-bind="option" /></template>
                  <template v-if="$slots.group" #group="group"><slot name="group" v-bind="group" /></template>
                </SelectList>

                <SelectScrollIndicator direction="down" class="form-listbox-scroll">
                  <AppIcon name="chevron-down" class="form-icon" />
                </SelectScrollIndicator>
              </div>

              <SelectEmpty class="form-listbox-empty">
                <slot name="empty">{{ emptyText }}</slot>
              </SelectEmpty>
            </div>
          </Popup>
        </Positioner>
      </Portal>
    </SelectRoot>
  </FormField>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFieldAttrs } from './use-field-attrs';
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxChips,
  ComboboxChipRemove,
  ComboboxInput,
  ComboboxClear,
  ComboboxIndicator,
  ComboboxPresets,
  ComboboxScrollIndicator,
  ComboboxList,
  ComboboxEmpty,
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

defineOptions({ name: 'FormCombobox', inheritAttrs: false });

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
    /** Lets more than one option be chosen, shown as chips. */
    multiple?: boolean;
    /** Lets typed text that matches no option become a value. A function decides per query. */
    creatable?: boolean | ((query: string) => boolean);
    /** Offers a button that drops the whole selection. */
    clearable?: boolean;
    /** How many chips show before the rest collapse into a count. */
    flatten?: number;
    /** Whether choosing an option closes the popup. Defaults to on for a single combobox. */
    closeOnSelect?: boolean;
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
    /** Replaces the built-in search, a case-insensitive match on the label. */
    filter?: (option: ListboxOption, query: string) => boolean;
    side?: Side;
    align?: Align;
    sideOffset?: number;

    label?: string;
    help?: string;
    /** Shown under the combobox, and marks it invalid. */
    error?: string;
    /** With `multiple`, shown only until a chip is chosen, so the input shrinks to the caret beside them. */
    placeholder?: string;
    /** Keeps the placeholder beside the chips too. */
    showPlaceholder?: boolean;
    emptyText?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
    /** Classes for the control's box, beside its own. */
    controlClass?: HTMLAttributes['class'];
    /** Classes for the row of chips and input, beside its own. */
    valuesClass?: HTMLAttributes['class'];
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
    clearable: true,
    loop: true,
    emptyText: 'No matches'
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: ListboxOptionValue | ListboxOptionValue[] | null | undefined];
  'update:open': [open: boolean];
  /** Typed text about to become a value, so the page can add it as a real option. */
  create: [value: string];
}>();

// Everything the combobox itself takes; the field-wide state goes to `FormField`,
// which the combobox inherits it from.
const comboboxProps = computed(() => {
  const {
    label,
    help,
    error,
    placeholder,
    showPlaceholder,
    emptyText,
    name,
    id,
    disabled,
    readOnly,
    required,
    invalid,
    controlClass,
    valuesClass,
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

    <ComboboxRoot
      v-bind="comboboxProps"
      class="form-combobox"
      @update:model-value="emit('update:modelValue', $event)"
      @update:open="emit('update:open', $event)"
      @create="emit('create', $event)"
    >
      <ComboboxTrigger v-slot="state" class="form-control form-combobox-trigger" :class="controlClass">
        <Addon v-if="$slots.start" side="start" class="form-addon">
          <slot name="start" v-bind="state" />
        </Addon>

        <div class="form-combobox-values" :class="valuesClass">
          <ComboboxChips class="form-combobox-chips">
            <template v-if="$slots.chip" #chip="option"><slot name="chip" v-bind="option" /></template>
            <template #remove>
              <ComboboxChipRemove class="form-combobox-chip-remove">
                <AppIcon name="close" class="form-icon" />
              </ComboboxChipRemove>
            </template>
          </ComboboxChips>

          <ComboboxInput
            v-bind="controlAttrs"
            :placeholder="multiple && state.filled && !showPlaceholder ? undefined : placeholder"
            class="form-combobox-input"
          />
        </div>

        <Addon v-if="$slots.end" side="end" class="form-addon">
          <slot name="end" v-bind="state" />
        </Addon>

        <ComboboxClear class="form-clear">
          <slot name="clear">
            <AppIcon name="close" class="form-icon" />
          </slot>
        </ComboboxClear>

        <ComboboxIndicator class="form-listbox-indicator">
          <slot name="indicator">
            <AppIcon name="listbox-indicator" class="form-icon" />
          </slot>
        </ComboboxIndicator>
      </ComboboxTrigger>

      <Portal>
        <Positioner>
          <Popup
            class="form-listbox-popup"
            :class="popupClass"
            :data-preset-columns="presetColumns"
            :style="presetColumns ? { '--form-listbox-preset-columns': presetColumns } : undefined"
          >
            <!-- Everything under the search scrolls as one, within the space the popup has. -->
            <div class="form-listbox-body">
              <ComboboxPresets class="form-listbox-presets">
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
              </ComboboxPresets>

              <!-- The arrows sit at the list's own ends, under the search and presets. -->
              <div class="form-listbox-viewport">
                <ComboboxScrollIndicator direction="up" class="form-listbox-scroll">
                  <AppIcon name="chevron-up" class="form-icon" />
                </ComboboxScrollIndicator>

                <ComboboxList class="form-listbox-list">
                  <template v-if="$slots.option" #option="option"><slot name="option" v-bind="option" /></template>
                  <template v-if="$slots.group" #group="group"><slot name="group" v-bind="group" /></template>
                  <template v-if="$slots.create" #create="option"><slot name="create" v-bind="option" /></template>
                </ComboboxList>

                <ComboboxScrollIndicator direction="down" class="form-listbox-scroll">
                  <AppIcon name="chevron-down" class="form-icon" />
                </ComboboxScrollIndicator>
              </div>

              <ComboboxEmpty class="form-listbox-empty">
                <slot name="empty">{{ emptyText }}</slot>
              </ComboboxEmpty>
            </div>
          </Popup>
        </Positioner>
      </Portal>
    </ComboboxRoot>
  </FormField>
</template>

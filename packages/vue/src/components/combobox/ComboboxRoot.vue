<script setup lang="ts">
import { applyModelModifiers, type ModelModifiers } from '../../shared/model-modifiers';
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import {
  useListbox,
  provideListboxContext,
  type ListboxItem,
  type ListboxOption,
  type ListboxOptionValue,
  type ListboxOrder,
  type ListboxPresetItem
} from '../../shared/use-listbox';
import type { Align, Side } from '../../shared/use-positioning';

defineOptions({ name: 'ComboboxRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The selection, bound with `v-model`: a value, an array when `multiple`, or `null`. */
    modelValue?: ListboxOptionValue | ListboxOptionValue[] | null;
    /** `v-model.optional` writes `undefined` once the value is emptied. */
    modelModifiers?: ModelModifiers;
    /** The selection at first, when no `v-model` owns it. */
    defaultValue?: ListboxOptionValue | ListboxOptionValue[] | null;
    /** The options, flat or grouped. A bare string or number stands for itself. */
    options?: ListboxItem[];
    /** Lets more than one option be chosen, shown as chips; the model becomes an array. */
    multiple?: boolean;
    /** Lets typed text that matches no option become a value. A function decides per query. */
    creatable?: boolean | ((query: string) => boolean);
    /** Whether the whole selection can be dropped at once. */
    clearable?: boolean;
    /** How many chips `ComboboxChips` renders before the rest collapse into a count. */
    flatten?: number;
    /** Whether choosing an option closes the popup. Defaults to on for a single select. */
    closeOnSelect?: boolean;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Opens no popup and changes nothing, but stays focusable. */
    readOnly?: boolean;
    /** Needs a selection. Announced and styled, not enforced. */
    required?: boolean;
    /** Marks the selection invalid, for styling through `data-invalid`. */
    invalid?: boolean;
    /** The form field name; the selection is submitted through hidden inputs. */
    name?: string;
    /** The input's id. Inside a `FieldRoot`, the field's control id. */
    id?: string;
    /** Whether the popup is open, bound with `v-model:open`. */
    open?: boolean;
    /** Whether arrow keys wrap past the ends of the list. */
    loop?: boolean;
    /** Render only the options near the scroll position, for long flat lists. Needs `maxHeight`. */
    virtual?: boolean;
    /** Caps the list, which then scrolls. A number is pixels. */
    maxHeight?: number | string;
    /** `selected-first` lifts what is selected to the top of its group, each time the popup opens. */
    order?: ListboxOrder;
    /** Named sets of values, shown by `ComboboxPresets`. Multiple only. A group (`{ label, presets, collapsed }`) folds away from its heading. */
    presets?: ListboxPresetItem[];
    /** Names the presets outside a group, so they fold like one. */
    presetsLabel?: string;
    /** Which key on an option holds its value. */
    valueKey?: string;
    /** Which key on an option holds its text. */
    labelKey?: string;
    /** Replaces the built-in search, a case-insensitive match on the label. */
    filter?: (option: ListboxOption, query: string) => boolean;
    /** Which side of the trigger the popup prefers. */
    side?: Side;
    /** How the popup lines up along that side. */
    align?: Align;
    /** The gap between the trigger and the popup, in pixels. */
    sideOffset?: number;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    modelValue: undefined,
    open: undefined,
    closeOnSelect: undefined,
    flatten: undefined,
    creatable: false,
    options: () => [],
    multiple: false,
    clearable: true,
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    loop: true,
    as: 'div'
  }
);

const emit = defineEmits<{
  /** The new selection, for `v-model`. */
  'update:modelValue': [value: ListboxOptionValue | ListboxOptionValue[] | null | undefined];
  /** The popup opened or closed, for `v-model:open`. */
  'update:open': [open: boolean];
  /** Typed text about to become a value, so the page can add it as a real option. */
  create: [value: string];
}>();

const api = useListbox({
  mode: 'combobox',
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  options: toRef(() => props.options),
  multiple: toRef(() => props.multiple),
  creatable: toRef(() => props.creatable),
  clearable: toRef(() => props.clearable),
  flatten: toRef(() => props.flatten),
  closeOnSelect: toRef(() => props.closeOnSelect),
  disabled: toRef(() => props.disabled),
  readOnly: toRef(() => props.readOnly),
  required: toRef(() => props.required),
  invalid: toRef(() => props.invalid),
  name: toRef(() => props.name),
  id: toRef(() => props.id),
  open: toRef(() => props.open),
  loop: toRef(() => props.loop),
  virtual: toRef(() => props.virtual),
  maxHeight: toRef(() => props.maxHeight),
  order: toRef(() => props.order),
  presets: toRef(() => props.presets),
  presetsLabel: toRef(() => props.presetsLabel),
  valueKey: toRef(() => props.valueKey),
  labelKey: toRef(() => props.labelKey),
  filter: props.filter,
  side: toRef(() => props.side),
  align: toRef(() => props.align),
  sideOffset: toRef(() => props.sideOffset),
  onChange: (value) => emit('update:modelValue', applyModelModifiers(value, props.modelModifiers)),
  onOpenChange: (open) => emit('update:open', open),
  onCreate: (value) => emit('create', value)
});

provideListboxContext(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps(api.rootProps.value, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="api.state.value" />

    <input
      v-for="(hidden, index) in api.hiddenInputs.value"
      :key="index"
      type="hidden"
      :name="hidden.name"
      :value="hidden.value"
    />
  </Part>
</template>

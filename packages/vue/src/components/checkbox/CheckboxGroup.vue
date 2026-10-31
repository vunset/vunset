<script lang="ts">
import { applyModelModifiers, type ModelModifiers } from '../../shared/model-modifiers';
import type { ComputedRef } from 'vue';
import { createContext } from '../../shared/context';
import type { UseFieldReturn } from '../../shared/use-field';

export type CheckboxGroupValue = string | number;

export interface CheckboxGroupState {
  /**
   * The checked boxes' values.
   * @attribute none
   */
  value: CheckboxGroupValue[];
  /** Whether every box ignores interaction. */
  disabled: boolean;
  /** Whether the boxes can be focused but not changed. */
  readOnly: boolean;
  /** Whether at least one box must be checked before the form submits. */
  required: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
}

interface CheckboxRegistration {
  value: () => CheckboxGroupValue | undefined;
  /** Whether this box, on its own or through the group, can't be toggled. */
  locked: () => boolean;
}

export interface CheckboxGroupContext {
  value: ComputedRef<CheckboxGroupValue[]>;
  /** Adds or removes one value. */
  toggle: (value: CheckboxGroupValue, on: boolean, event: Event) => void;
  /** Checks or clears every box that isn't locked, for the parent box. */
  toggleAll: (on: boolean, event: Event) => void;
  /** Of the boxes that aren't locked: how many there are and how many are checked. */
  counts: ComputedRef<{ total: number; checked: number }>;
  register: (entry: CheckboxRegistration) => () => void;
  disabled: () => boolean;
  readOnly: () => boolean;
  invalid: () => boolean;
  name: () => string | undefined;
  form: () => string | undefined;
  /** The field the group is the control of, which its boxes leave to it. */
  field: UseFieldReturn | null;
}

export const { provideContext: provideCheckboxGroupContext, useOptionalContext: useOptionalCheckboxGroupContext } =
  createContext<CheckboxGroupContext>('CheckboxGroup');
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, ref, shallowRef, watch } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { dataAttrs } from '../../shared/data-attrs';
import { useControlled } from '../../shared/use-controlled';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';

defineOptions({ name: 'CheckboxGroup', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The checked boxes' values, bound with `v-model`. */
    modelValue?: CheckboxGroupValue[];
    /** `v-model.optional` writes `undefined` once the value is emptied. */
    modelModifiers?: ModelModifiers;
    /** The values checked at first, when no `v-model` owns them. */
    defaultValue?: CheckboxGroupValue[];
    /** Disables every box, and the form leaves them out. */
    disabled?: boolean;
    /** Keeps the boxes focusable but unchangeable. */
    readOnly?: boolean;
    /** At least one box must be checked. Announced and styled, not enforced. */
    required?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. */
    invalid?: boolean;
    /** The form field name every box submits its value under. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The id of a `<form>` to submit with, when the group sits outside it. */
    form?: string;
    /** Every enabled box's value, so a parent box can count them before they render, as on a server. */
    allValues?: CheckboxGroupValue[];
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, defaultValue: undefined, as: 'div' }
);

const emit = defineEmits<{
  /** The new array of values, for `v-model`. */
  'update:modelValue': [value: CheckboxGroupValue[] | undefined];
  /** Every toggle by the user, with the new array and the event behind it. */
  change: [value: CheckboxGroupValue[], event: Event];
}>();

const field = useOptionalFieldContext();
const container = ref<HTMLElement | null>(null);
const registrations = shallowRef<CheckboxRegistration[]>([]);

const disabled = () => (props.disabled ?? false) || (field?.state.value.disabled ?? false);
const readOnly = () => (props.readOnly ?? false) || (field?.state.value.readOnly ?? false);
const required = () => (props.required ?? false) || (field?.required() ?? false);
const invalid = () => (props.invalid ?? false) || (field?.state.value.invalid ?? false);

const controlled = useControlled<CheckboxGroupValue[]>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? [],
  prop: 'modelValue',
  empty: () => [],
  name: 'CheckboxGroup',
  label: 'value'
});
const value = computed(() => controlled.value ?? []);

const state = computed<CheckboxGroupState>(() => ({
  value: value.value,
  disabled: disabled(),
  readOnly: readOnly(),
  required: required(),
  invalid: invalid()
}));

useFieldValue(field, () => value.value);
watch(
  () => value.value.length > 0,
  (filled) => field?.setFilled(filled),
  { immediate: true }
);

// Values with no box first, as they were, then the boxes' in mount order.
function ordered(checked: Set<CheckboxGroupValue>): CheckboxGroupValue[] {
  const known = registrations.value.map((entry) => entry.value()).filter((item) => item !== undefined);
  const knownSet = new Set(known);
  return [...[...checked].filter((item) => !knownSet.has(item)), ...known.filter((item) => checked.has(item))];
}

function commit(next: CheckboxGroupValue[], event: Event) {
  controlled.value = next;
  emit('update:modelValue', applyModelModifiers(next, props.modelModifiers));
  emit('change', next, event);
}

const counts = computed(() => {
  // A parent box renders before the boxes register, and a server render never goes back to it.
  const open = registrations.value.length
    ? registrations.value.filter((entry) => entry.value() !== undefined && !entry.locked()).map((entry) => entry.value()!)
    : (props.allValues ?? []);
  return { total: open.length, checked: open.filter((item) => value.value.includes(item)).length };
});

provideCheckboxGroupContext({
  value,
  toggle(item, on, event) {
    if (disabled() || readOnly()) return;
    const checked = new Set(value.value);
    if (on) checked.add(item);
    else checked.delete(item);
    commit(ordered(checked), event);
  },
  toggleAll(on, event) {
    if (disabled() || readOnly()) return;
    const checked = new Set(value.value);
    for (const entry of registrations.value) {
      const item = entry.value();
      if (item === undefined || entry.locked()) continue;
      if (on) checked.add(item);
      else checked.delete(item);
    }
    commit(ordered(checked), event);
  },
  counts,
  register(entry) {
    registrations.value = [...registrations.value, entry];
    return () => {
      registrations.value = registrations.value.filter((item) => item !== entry);
    };
  },
  disabled,
  readOnly,
  invalid,
  name: () => props.name ?? field?.name(),
  form: () => props.form,
  field
});

defineExpose({ value, state });

const merged = usePartProps(() => ({
  ...dataAttrs(state.value, { value: () => null }),
  'data-part': 'checkbox-group',
  role: 'group',
  'aria-labelledby': field?.labelledBy.value,
  'aria-describedby': field?.describedBy.value,
  'aria-required': required() || undefined,
  'aria-disabled': disabled() || undefined,
  'aria-readonly': readOnly() || undefined,
  'aria-invalid': invalid() || undefined,
  ref: (el: unknown) => {
    container.value = (el as HTMLElement) ?? null;
  },
  onFocusin: () => field?.setFocused(true),
  // Touched once focus leaves the group, not when it moves between boxes.
  onFocusout(event: FocusEvent) {
    const next = event.relatedTarget;
    if (next instanceof Node && container.value?.contains(next)) return;

    field?.setFocused(false);
    field?.setTouched(true);
  }
}));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

<script lang="ts">
export interface CheckboxState {
  /**
   * Whether the checkbox is checked.
   * @attribute `data-checked` while checked, `data-unchecked` otherwise
   */
  checked: boolean;
  /** Neither checked nor unchecked — a group whose members disagree. */
  indeterminate: boolean;
  /** Whether it ignores interaction. */
  disabled: boolean;
  /** Whether it can be focused but not changed. */
  readOnly: boolean;
  /** Whether it must be checked before its form submits. */
  required: boolean;
  /** Whether the value is invalid. */
  invalid: boolean;
}
</script>

<script
  setup
  lang="ts"
  generic="TValue extends string | number | boolean = boolean, TItem extends string | number = string"
>
import { Part } from '../../shared/part';
import { computed, onScopeDispose, useAttrs, useId, watch } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { dataAttrs } from '../../shared/data-attrs';
import { useControlled } from '../../shared/use-controlled';
import { useToggleInput } from '../../shared/use-toggle-input';
import { useFieldValue, useOptionalFieldContext } from '../../shared/use-field';
import { provideToggleIndicator } from '../../shared/use-toggle-indicator';
import { useOptionalCheckboxGroupContext } from './CheckboxGroup.vue';

defineOptions({ name: 'CheckboxRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Bound with `v-model`: `true-value`/`false-value`, or an array that holds `value` while checked. Ignored inside a `CheckboxGroup`. */
    modelValue?: TValue | TItem[] | null;
    /** The model value while checked. @default true */
    trueValue?: TValue;
    /** The model value while unchecked. @default false */
    falseValue?: TValue;
    /** Starts checked, when no `v-model` owns the state. A number counts as checked unless it is `0`. */
    defaultChecked?: boolean | number;
    /** Shows neither state, for a parent of checkboxes that disagree. Clicking still toggles `checked`. */
    indeterminate?: boolean;
    /** Ignores interaction, and the form leaves it out. */
    disabled?: boolean;
    /** Stays focusable but can't be changed. */
    readOnly?: boolean;
    /** Must be checked. Announced and styled, not enforced. */
    required?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. */
    invalid?: boolean;
    /** The root's id. Inside a `FieldRoot`, the field's control id. */
    id?: string;
    /** The form field name. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** Submitted while checked, and what an array `v-model` (or a `CheckboxGroup`) holds for this box. */
    value?: TItem;
    /** Inside a `CheckboxGroup`, checks or clears every other box, and shows indeterminate while they disagree. */
    parent?: boolean;
    /** The id of a `<form>` to submit with, when the checkbox sits outside it. */
    form?: string;
    /** Element or component to render. Anything but a `button` gets `tabindex` and Enter/Space keys, and a `<label>` no longer names it. */
    as?: string | object;
  }>(),
  { defaultChecked: false, as: 'button', parent: false }
);

const emit = defineEmits<{
  /** The new model value, for `v-model`. */
  'update:modelValue': [value: TValue | TItem[]];
  /** Every toggle by the user, with the new state and the event behind it. */
  change: [checked: boolean, event: Event];
}>();

const trueValue = computed(() => (props.trueValue ?? true) as TValue);
const falseValue = computed(() => (props.falseValue ?? false) as TValue);

/** An array model gains or loses this box's `value`; anything else flips between the two values. */
function nextModel(on: boolean): TValue | TItem[] {
  const model = props.modelValue;
  if (!Array.isArray(model)) return on ? trueValue.value : falseValue.value;
  const item = props.value as TItem;
  const rest = model.filter((entry) => entry !== item);
  return on ? [...rest, item] : rest;
}

const group = useOptionalCheckboxGroupContext();
// The group's own field is the group's to use; a field around this one box is still its own.
const nearestField = useOptionalFieldContext();
const field = group && nearestField === group.field ? null : nearestField;
const generatedId = useId();

if (process.env.NODE_ENV !== 'production' && group && !props.parent && props.value === undefined) {
  console.warn("[CheckboxRoot] A checkbox inside a CheckboxGroup needs a `value` to add to the group's array.");
}

// Its own state, before the group's: what keeps the parent box from toggling it.
const ownDisabled = () => (props.disabled ?? false) || (field?.state.value.disabled ?? false);
const ownReadOnly = () => (props.readOnly ?? false) || (field?.state.value.readOnly ?? false);
const isDisabled = () => ownDisabled() || (group?.disabled() ?? false);
const isReadOnly = () => ownReadOnly() || (group?.readOnly() ?? false);
const isInvalid = () =>
  (props.invalid ?? false) || (group?.invalid() ?? false) || (field?.state.value.invalid ?? false);
const isRequired = () => (props.required ?? false) || (field?.required() ?? false);

const parentCounts = () => (group && props.parent ? group.counts.value : null);
const indeterminate = () => {
  const counts = parentCounts();
  if (counts) return counts.checked > 0 && counts.checked < counts.total;
  return props.indeterminate ?? false;
};

if (group && !props.parent) {
  onScopeDispose(group.register({ value: () => props.value, locked: () => ownDisabled() || ownReadOnly() }));
}

const checked = useControlled<boolean>({
  value: () => {
    if (group) {
      const counts = parentCounts();
      if (counts) return counts.total > 0 && counts.checked === counts.total;
      return props.value !== undefined && group.value.value.includes(props.value);
    }
    const model = props.modelValue;
    if (model === undefined) return undefined;
    return Array.isArray(model) ? model.includes(props.value as TItem) : model === trueValue.value;
  },
  defaultValue: () => Boolean(props.defaultChecked),
  prop: 'modelValue',
  empty: false,
  name: 'Checkbox',
  label: 'checked'
});

const state = computed<CheckboxState>(() => ({
  checked: checked.value,
  indeterminate: indeterminate(),
  disabled: isDisabled(),
  readOnly: isReadOnly(),
  required: isRequired(),
  invalid: isInvalid()
}));

const hooks = computed(() =>
  dataAttrs(state.value, {
    checked: (on) => (on ? { 'data-checked': '' } : { 'data-unchecked': '' })
  })
);

provideToggleIndicator({ state, hooks, present: () => checked.value || indeterminate() });

useFieldValue(field, () => checked.value);
watch(checked, (on) => field?.setFilled(on), { immediate: true });

const toggleInput = useToggleInput({
  role: 'checkbox',
  checked: () => checked.value,
  indeterminate,
  disabled: isDisabled,
  readOnly: isReadOnly,
  required: isRequired,
  id: () => props.id ?? field?.controlId.value ?? generatedId,
  name: () => props.name ?? (group ? (props.parent ? undefined : group.name()) : field?.name()),
  value: () => (props.value === undefined || props.parent ? undefined : String(props.value)),
  form: () => props.form ?? group?.form(),
  describedBy: () => field?.describedBy.value,
  native: () => props.as === 'button',
  hooks: () => hooks.value,
  onFocus: () => field?.setFocused(true),
  onBlur: () => {
    field?.setFocused(false);
    field?.setTouched(true);
  },
  onToggle: (next, event) => {
    if (group) {
      if (props.parent) group.toggleAll(next, event);
      else if (props.value !== undefined) group.toggle(props.value, next, event);
    } else {
      checked.value = next;
      emit('update:modelValue', nextModel(next));
    }
    emit('change', next, event);
  }
});

const inputProps = toggleInput.inputProps;

defineExpose({
  checked,
  state,
  rootProps: toggleInput.rootProps,
  inputProps,
  toggle: toggleInput.activate
});

const attrs = useAttrs();
const rootProps = computed(() => mergeProps({ 'data-part': 'root', ...toggleInput.rootProps.value }, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="state" />
  </Part>
  <!-- Beside the root, not in it: a button may hold no interactive content. -->
  <input v-if="toggleInput.rendersInput.value" v-bind="inputProps" />
</template>

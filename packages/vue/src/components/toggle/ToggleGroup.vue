<script setup lang="ts">
import { applyModelModifiers, type ModelModifiers } from '../../shared/model-modifiers';
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useToggleGroup, provideToggleGroupContext, type ToggleGroupValue } from './use-toggle';
import type { Orientation } from '../../shared/use-roving-focus';

defineOptions({ name: 'ToggleGroup', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The pressed toggles' values, bound with `v-model`: one value or `null`, an array with `multiple`. */
    modelValue?: ToggleGroupValue;
    /** `v-model.optional` writes `undefined` once the value is emptied. */
    modelModifiers?: ModelModifiers;
    /** The pressed toggles at first, when no `v-model` owns them. */
    defaultValue?: ToggleGroupValue;
    /** Lets more than one toggle be on; the model becomes an array. */
    multiple?: boolean;
    /** Keeps one toggle on: the last one refuses to come up, and an empty group presses its first. */
    required?: boolean;
    /** Disables every toggle in the group. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Marks the value invalid, for styling through `data-invalid`. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** Submits each pressed toggle's value under this name. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The id of a `<form>` to submit with, when the group sits outside it. */
    form?: string;
    /** Which arrow keys move between the toggles. */
    orientation?: Orientation;
    /** Whether arrow keys wrap past the first and last toggle. @default true, or `false` inside a toolbar */
    loop?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    multiple: false,
    required: false,
    disabled: false,
    invalid: false,
    orientation: 'horizontal',
    loop: undefined,
    as: 'div'
  }
);

const emit = defineEmits<{
  /** The pressed toggles' new value, for `v-model`. */
  'update:modelValue': [value: ToggleGroupValue | undefined];
  /** The same, for a listener without `v-model`. */
  change: [value: ToggleGroupValue];
}>();

const api = useToggleGroup({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  multiple: toRef(() => props.multiple),
  required: toRef(() => props.required),
  disabled: toRef(() => props.disabled),
  invalid: toRef(() => props.invalid),
  name: toRef(() => props.name),
  form: toRef(() => props.form),
  orientation: toRef(() => props.orientation),
  loop: toRef(() => props.loop),
  onChange: (value) => {
    emit('update:modelValue', applyModelModifiers(value, props.modelModifiers));
    emit('change', value);
  }
});

provideToggleGroupContext(api);
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

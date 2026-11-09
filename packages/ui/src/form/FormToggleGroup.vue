<script lang="ts">
import type { ToggleValue } from '@vunset/vue';

export interface FormToggleOption {
  /** Read from `value-key` instead, when that is set. */
  value?: ToggleValue;
  label?: string;
  disabled?: boolean;
  [key: string]: unknown;
}
</script>

<script setup lang="ts" generic="TOption extends FormToggleOption = FormToggleOption">
import { computed } from 'vue';
import { ToggleGroup, Toggle, Addon, type ToggleGroupValue, isPropBound, type ModelModifiers } from '@vunset/vue';
import FormField, { type FormSize } from './FormField.vue';
import { useObjectModel } from './use-object-model';
import type { HTMLAttributes } from 'vue';

defineOptions({ name: 'FormToggleGroup' });

// Forwarded only when bound, so a field without `v-model` keeps its own value.
const modelBound = isPropBound('modelValue');

const props = withDefaults(
  defineProps<{
    /** One value or `null`; an array with `multiple`. With `v-model.object`, the options themselves. */
    modelValue?: ToggleGroupValue | TOption | TOption[];
    /**
     * `v-model.lowercase` lowercases each option's string value, keeping its label as given;
     * `.optional` writes `undefined` once the value is emptied;
     * `.object` writes the whole option, matched by `value-key`, or by identity without one.
     */
    modelModifiers?: ModelModifiers & { lowercase?: boolean; object?: boolean };
    defaultValue?: ToggleGroupValue | TOption | TOption[];
    /** A toggle per option; or put `Toggle`s with `class="form-toggle"` in the default slot instead. */
    options?: (ToggleValue | TOption)[];
    /** Which key on an option holds its value. @default 'value' */
    valueKey?: string;
    /** Which key on an option holds its text. @default 'label' */
    labelKey?: string;
    /** Lets more than one toggle be on; the value becomes an array. */
    multiple?: boolean;
    /** Keeps one toggle on: the last one won't come up, and an empty group presses its first. */
    keepOne?: boolean;
    /** Which arrow keys move between the toggles, and which way they line up. */
    orientation?: 'horizontal' | 'vertical';
    /** Whether arrow keys wrap past the ends. @default true, or `false` inside a toolbar */
    loop?: boolean;
    form?: string;

    label?: string;
    help?: string;
    /** Shown under the toggles, and marks the group invalid. */
    error?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    /** A toggle must be on before the form is done. Announced, not enforced; `keep-one` enforces it. */
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
  { modelValue: undefined, defaultValue: undefined, orientation: 'horizontal', loop: undefined }
);

const emit = defineEmits<{
  'update:modelValue': [value: ToggleGroupValue | TOption | TOption[] | undefined];
}>();

type Item = TOption & { value: ToggleValue; label: string };

defineSlots<{
  /** `Toggle`s with `class="form-toggle"`, in place of `options`. */
  default?(): unknown;
  /** Each option's content: its fields, typed as given, and the option itself. */
  option?(props: Item & { option: Item }): unknown;
  /** Inside the group's box, before the toggles: an icon, a caption. Not a toggle itself. */
  start?(): unknown;
  /** Inside the group's box, after the toggles. */
  end?(): unknown;
  label?(): unknown;
  'label-start'?(): unknown;
  'label-end'?(): unknown;
  help?(): unknown;
  error?(props: { message: string | undefined }): unknown;
}>();

const object = useObjectModel({
  enabled: () => Boolean(props.modelModifiers?.object),
  valueKey: () => props.valueKey,
  labelKey: () => props.labelKey,
  options: () => props.options ?? [],
  model: () => props.modelValue
});

// Each option as `{ value, label }`, read through `value-key` and `label-key`; its other fields stay for the slot.
const items = computed<Item[]>(() =>
  (props.options ?? []).map((option) => {
    const item = (
      typeof option === 'object'
        ? {
            ...option,
            value: (props.modelModifiers?.object
              ? object.keyOf(option)
              : option[props.valueKey ?? 'value']) as ToggleValue,
            label: String(option[props.labelKey ?? 'label'] ?? option[props.valueKey ?? 'value'])
          }
        : { value: option, label: String(option) }
    ) as Item;
    return props.modelModifiers?.lowercase && !props.modelModifiers.object && typeof item.value === 'string'
      ? { ...item, value: item.value.toLowerCase() }
      : item;
  })
);
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

    <ToggleGroup
      class="form-toggle-group"
      :class="controlClass"
      :data-orientation="orientation"
      v-bind="modelBound ? { modelValue: object.toKeys(modelValue) as ToggleGroupValue } : {}"
      :model-modifiers="modelModifiers"
      :default-value="object.toKeys(defaultValue) as ToggleGroupValue"
      :multiple="multiple"
      :required="keepOne"
      :orientation="orientation"
      :loop="loop"
      :form="form"
      @update:model-value="emit('update:modelValue', object.fromKeys($event) as ToggleGroupValue | TOption | TOption[])"
    >
      <Addon v-if="$slots.start" side="start" class="form-addon form-toggle-group-addon">
        <slot name="start" />
      </Addon>

      <slot>
        <Toggle
          v-for="option in items"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
          class="form-toggle"
        >
          <slot name="option" v-bind="option" :option="option">{{ option.label }}</slot>
        </Toggle>
      </slot>

      <Addon v-if="$slots.end" side="end" class="form-addon form-toggle-group-addon">
        <slot name="end" />
      </Addon>
    </ToggleGroup>
  </FormField>
</template>

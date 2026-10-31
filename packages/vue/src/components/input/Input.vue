<script setup lang="ts">
import { applyModelModifiers, type InputModelModifiers } from '../../shared/model-modifiers';
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useInput, provideInputContext, type FieldFilter } from '../../shared/use-input';

defineOptions({ name: 'Input', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The value, bound with `v-model`. Always emitted as a string. */
    modelValue?: string | number | null;
    /** `v-model.optional` writes `undefined` once emptied; `.trim` and `.number` work as on an `<input>`. */
    modelModifiers?: InputModelModifiers;
    /** The value at first, when no `v-model` owns it. */
    defaultValue?: string | number;
    /** Ignores interaction. Inside a `FieldRoot`, follows the field. */
    disabled?: boolean;
    /** Can be read and selected but not edited. Inside a `FieldRoot`, follows the field. */
    readOnly?: boolean;
    /** Needs a value. Announced and styled, not enforced. Inside a `FieldRoot`, follows the field. */
    required?: boolean;
    /** Sets `aria-invalid` and `data-invalid`, as a number outside `min`, `max` or `step` does. Inside a `FieldRoot`, follows the field. */
    invalid?: boolean;
    /** The input's id. Inside a `FieldRoot`, the field's control id. */
    id?: string;
    /** The form field name. Inside a `FieldRoot`, the field's name. */
    name?: string;
    /** The native `type`. `number` renders a text input that only lets numeric text be typed. */
    type?: string;
    /** The native `minlength`. */
    minLength?: number;
    /** The native `maxlength`, also enforced while typing and pasting. */
    maxLength?: number;
    /** The lowest valid number; below it the input is invalid. At zero or more, a minus can't be typed at all. */
    min?: number | string;
    /** The highest valid number. */
    max?: number | string;
    /** The increment a valid number keeps to. */
    step?: number | string;
    /** The native `pattern`, checked on the finished value when the form submits. */
    pattern?: string;
    /** What may be typed at all, checked on every keystroke and paste: a regex source, a RegExp or a function. */
    filter?: FieldFilter;
    /** Rewrites the typed text once it's committed: on blur, or Enter in an input. Not applied to `v-model`'s own writes. */
    transform?: (value: string) => string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, defaultValue: undefined, as: 'input' }
);

const emit = defineEmits<{
  /** The new value, for `v-model`. */
  'update:modelValue': [value: string | undefined];
}>();

const api = useInput({
  value: toRef(() => props.modelValue),
  defaultValue: toRef(() => props.defaultValue),
  disabled: toRef(() => props.disabled ?? false),
  readOnly: toRef(() => props.readOnly ?? false),
  required: toRef(() => props.required ?? false),
  invalid: toRef(() => props.invalid ?? false),
  id: toRef(() => props.id),
  name: toRef(() => props.name),
  type: toRef(() => props.type),
  minLength: toRef(() => props.minLength),
  maxLength: toRef(() => props.maxLength),
  min: toRef(() => props.min),
  max: toRef(() => props.max),
  step: toRef(() => props.step),
  pattern: toRef(() => props.pattern),
  filter: toRef(() => props.filter),
  transform: toRef(() => props.transform),
  onChange: (value) => emit('update:modelValue', applyModelModifiers(value, props.modelModifiers))
});

provideInputContext(api);
defineExpose(api);

const merged = usePartProps(() => ({ ...api.controlProps.value, 'data-part': 'input' }));

</script>

<template>
  <Part :as="props.as" v-bind="merged" />
</template>

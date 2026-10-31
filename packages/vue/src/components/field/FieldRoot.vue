<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useField, provideFieldContext, type FieldState, type UseFieldReturn } from '../../shared/use-field';

defineOptions({ name: 'FieldRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Disables the control inside, and every part follows. */
    disabled?: boolean;
    /** Makes the control inside read-only. */
    readOnly?: boolean;
    /** Marks the control inside required. */
    required?: boolean;
    /** Marks the field invalid, which shows `FieldError` and sets `aria-invalid` on the control. */
    invalid?: boolean;
    /** Overrides whether the control has been focused and left. Tracked for you otherwise. */
    touched?: boolean;
    /** Overrides whether the value has changed. Tracked for you otherwise. */
    dirty?: boolean;
    /** The control's id, which the label points at. Generated when not given. */
    id?: string;
    /** Names the control inside for its form, and picks this field's message from `useValidate()` errors. */
    name?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  {
    touched: undefined,
    dirty: undefined,
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    as: 'div'
  }
);

defineSlots<{
  default(props: FieldState): unknown;
  /**
   * Renders no element of its own: lay the field out yourself and bind its API,
   * for a control the library doesn't wire.
   * @internal
   */
  custom(props: UseFieldReturn): unknown;
}>();

const api = useField({
  disabled: toRef(() => props.disabled),
  readOnly: toRef(() => props.readOnly),
  required: toRef(() => props.required),
  invalid: toRef(() => props.invalid),
  touched: toRef(() => props.touched),
  dirty: toRef(() => props.dirty),
  id: toRef(() => props.id),
  name: toRef(() => props.name)
});

provideFieldContext(api);
defineExpose(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps(api.rootProps.value, attrs));
</script>

<template>
  <slot v-if="$slots.custom" name="custom" v-bind="api" />

  <Part :as="props.as" v-else v-bind="rootProps">
    <slot v-bind="api.state.value" />
  </Part>
</template>

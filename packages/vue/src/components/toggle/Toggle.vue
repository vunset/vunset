<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, toRef, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';
import { useToggle, type ToggleValue } from './use-toggle';

defineOptions({ name: 'Toggle', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Whether it is on, bound with `v-model`. Inside a `ToggleGroup`, the group owns this. */
    modelValue?: boolean;
    /** Starts on, when no `v-model` owns it. */
    defaultPressed?: boolean;
    /** Can't be pressed. Inside a `ToggleGroup`, follows the group too. */
    disabled?: boolean;
    /** Names it inside a `ToggleGroup`, whose value lists the pressed ones. Required there. */
    value?: ToggleValue;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { modelValue: undefined, defaultPressed: false, disabled: false, as: 'button' }
);

const emit = defineEmits<{
  /** The new state, for `v-model`. */
  'update:modelValue': [pressed: boolean];
  /** Every press, with the new state and the event behind it. */
  change: [pressed: boolean, event?: Event];
}>();

const api = useToggle({
  pressed: toRef(() => props.modelValue),
  defaultPressed: toRef(() => props.defaultPressed),
  disabled: toRef(() => props.disabled),
  value: toRef(() => props.value),
  onChange: (pressed, event) => {
    emit('update:modelValue', pressed);
    emit('change', pressed, event);
  }
});

defineExpose(api);

const attrs = useAttrs();
const rootProps = computed(() => mergeProps(api.rootProps.value, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot v-bind="api.state.value" />
  </Part>
</template>

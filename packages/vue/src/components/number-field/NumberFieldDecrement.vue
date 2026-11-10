<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useNumberFieldContext, type NumberFieldState } from './NumberFieldRoot.vue';

defineOptions({ name: 'NumberFieldDecrement', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  default?(props: NumberFieldState): unknown;
}>();

const { state, decrementProps } = useNumberFieldContext();
const merged = usePartProps(decrementProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

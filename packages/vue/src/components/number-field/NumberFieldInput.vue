<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useNumberFieldContext } from './NumberFieldRoot.vue';

defineOptions({ name: 'NumberFieldInput', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'input' }
);

const { inputProps } = useNumberFieldContext();
const merged = usePartProps(inputProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged" />
</template>

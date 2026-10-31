<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useRangeContext, type RangeState } from './use-range';

defineOptions({ name: 'RangeValue', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'output' }
);

defineSlots<{
  default(
    props: RangeState & {
      /**
       * Each value written with the root's `format`.
       * @attribute none
       */
      formattedValues: string[];
    }
  ): unknown;
}>();

const { valueProps, state, formattedValues } = useRangeContext();
const merged = usePartProps(valueProps);

const text = computed(() => formattedValues.value.join(' – '));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot :formatted-values v-bind="state">{{ text }}</slot>
  </Part>
</template>

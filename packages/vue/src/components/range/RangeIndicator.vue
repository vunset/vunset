<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useRangeContext } from './use-range';

defineOptions({ name: 'RangeIndicator', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { indicatorProps, state } = useRangeContext();
const merged = usePartProps(indicatorProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

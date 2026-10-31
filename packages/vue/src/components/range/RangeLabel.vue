<script setup lang="ts">
import { Part } from '../../shared/part';
import { onBeforeUnmount } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useRangeContext } from './use-range';

defineOptions({ name: 'RangeLabel', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

const { labelProps, state, registerLabel } = useRangeContext();

onBeforeUnmount(registerLabel());

const merged = usePartProps(labelProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed, useAttrs } from 'vue';
import { mergeProps } from '../../shared/merge-props';

defineOptions({ name: 'Badge', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

const attrs = useAttrs();

const rootProps = computed(() => mergeProps({ 'data-part': 'badge' }, attrs));
</script>

<template>
  <Part :as="props.as" v-bind="rootProps">
    <slot />
  </Part>
</template>

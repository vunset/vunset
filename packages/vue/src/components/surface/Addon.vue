<script setup lang="ts">
import { Part } from '../../shared/part';
defineOptions({ name: 'Addon', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which end of the control it sits at, as `data-side`. */
    side?: 'start' | 'end';
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);
</script>

<template>
  <Part :as="props.as" data-part="addon" :data-side="props.side" v-bind="$attrs">
    <slot />
  </Part>
</template>

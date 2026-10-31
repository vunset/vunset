<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext } from '../../shared/use-listbox';

defineOptions({ name: 'SelectTrigger', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { triggerProps, state } = useListboxContext();
const merged = usePartProps(triggerProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

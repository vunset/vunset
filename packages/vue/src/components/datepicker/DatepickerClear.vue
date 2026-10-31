<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useDatepickerContext } from './DatepickerRoot.vue';

defineOptions({ name: 'DatepickerClear', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

const { clearProps, state } = useDatepickerContext();
const merged = usePartProps(clearProps);
// Only while there is something to clear, and it may be cleared.
const shown = computed(() => !state.value.empty && !state.value.disabled && !state.value.readOnly);
</script>

<template>
  <Part v-if="shown" :as="props.as" v-bind="merged">
    <slot v-bind="state">×</slot>
  </Part>
</template>

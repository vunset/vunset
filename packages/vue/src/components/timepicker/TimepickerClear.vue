<script setup lang="ts">
import { computed } from 'vue';
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useTimepickerContext } from './use-timepicker';

defineOptions({ name: 'TimepickerClear', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

const { clearProps, state } = useTimepickerContext();
const merged = usePartProps(clearProps);
// Only while there is something to clear, and it may be cleared.
const shown = computed(() => !state.value.empty && !state.value.disabled && !state.value.readOnly);
</script>

<template>
  <Part v-if="shown" :as="props.as" v-bind="merged">
    <slot v-bind="state">×</slot>
  </Part>
</template>

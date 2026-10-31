<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useSwitchContext } from './SwitchRoot.vue';

defineOptions({ name: 'SwitchThumb', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

const { state, hooks } = useSwitchContext();

const merged = usePartProps(computed(() => ({ 'data-part': 'thumb', ...hooks.value })));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

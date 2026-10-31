<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useTabsIndicator } from './use-tabs';

defineOptions({ name: 'TabsIndicator', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

const api = useTabsIndicator();
const merged = usePartProps(api.indicatorProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="api.state.value" />
  </Part>
</template>

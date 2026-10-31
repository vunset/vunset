<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useTabsContext } from './use-tabs';

defineOptions({ name: 'TabsList', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const tabs = useTabsContext();
const merged = usePartProps(tabs.listProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="tabs.state.value" />
  </Part>
</template>

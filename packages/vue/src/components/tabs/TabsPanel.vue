<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useTabPanel, type TabValue } from './use-tabs';

defineOptions({ name: 'TabsPanel', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which tab shows it: the `TabsTab` with the same `value`. */
    value: TabValue;
    /** Stays in the DOM, `hidden`, while another tab is selected. */
    keepMounted?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { keepMounted: false, as: 'div' }
);

const api = useTabPanel({
  value: toRef(() => props.value),
  keepMounted: toRef(() => props.keepMounted)
});

const merged = usePartProps(api.panelProps);
</script>

<template>
  <Part :as="props.as" v-if="api.present.value || props.keepMounted" v-bind="merged">
    <slot v-bind="api.state.value" />
  </Part>
</template>

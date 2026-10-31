<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useTab, type TabValue } from './use-tabs';

defineOptions({ name: 'TabsTab', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which panel it selects: the `TabsPanel` with the same `value`. */
    value: TabValue;
    /** Can't be selected or focused; arrow keys skip it. */
    disabled?: boolean;
    /** The tab's id, which its panel is labeled by. Generated when not given. */
    id?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

const api = useTab({
  value: toRef(() => props.value),
  disabled: toRef(() => props.disabled),
  id: toRef(() => props.id)
});

const merged = usePartProps(api.tabProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="api.state.value" />
  </Part>
</template>

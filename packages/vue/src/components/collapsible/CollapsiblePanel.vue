<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useCollapsibleContext } from '../../shared/use-collapsible';

defineOptions({ name: 'CollapsiblePanel', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Stays in the DOM, `hidden`, while closed: for find-in-page, or content that must keep its state. */
    keepMounted?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { keepMounted: false, as: 'div' }
);

const { panelProps, present, state } = useCollapsibleContext();
const merged = usePartProps(panelProps);
</script>

<template>
  <Part :as="props.as" v-if="present || props.keepMounted" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useMenuContext } from '../../shared/use-menu';

defineOptions({ name: 'MenuTrigger', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

const { triggerProps, state } = useMenuContext();
const merged = usePartProps(triggerProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

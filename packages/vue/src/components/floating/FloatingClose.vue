<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useFloatingContext, type FloatingState } from './FloatingRoot.vue';

defineOptions({ name: 'FloatingClose', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  /**
   * The panel's state.
   * @slotOnly
   */
  default(props: FloatingState): unknown;
}>();

const { closeProps, state } = useFloatingContext();
const merged = usePartProps(closeProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

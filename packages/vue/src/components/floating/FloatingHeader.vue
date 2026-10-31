<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useFloatingContext, type FloatingState } from './FloatingRoot.vue';

defineOptions({ name: 'FloatingHeader', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The panel's state.
   * @slotOnly The element carries only the drag handlers: drag it to move the panel, double-click it to put the panel back.
   */
  default(props: FloatingState): unknown;
}>();

const { headerProps, state } = useFloatingContext();
const merged = usePartProps(headerProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

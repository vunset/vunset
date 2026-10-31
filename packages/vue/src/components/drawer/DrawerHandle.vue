<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useDrawerContext, type DrawerState } from './use-drawer';

defineOptions({ name: 'DrawerHandle', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The drawer's state.
   * @slotOnly The element carries only `data-part="handle"`, and the drag handlers with `touch-action: none`.
   */
  default(props: DrawerState): unknown;
}>();

const { handleProps, state } = useDrawerContext();
const merged = usePartProps(handleProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

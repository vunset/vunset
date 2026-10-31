<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useMenuContext, type MenuState } from '../../shared/use-menu';

defineOptions({ name: 'MenuArrow', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The menu's state.
   * @slotOnly The element carries only `data-part="arrow"` and `data-side`.
   */
  default(props: MenuState): unknown;
}>();

const { arrowProps, state } = useMenuContext();
const merged = usePartProps(arrowProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

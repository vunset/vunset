<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { usePopoverContext, type PopoverState } from './use-popover';

defineOptions({ name: 'PopoverArrow', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The popover's state.
   * @slotOnly The element carries only `data-part="arrow"` and `data-side`.
   */
  default(props: PopoverState): unknown;
}>();

const { arrowProps, state } = usePopoverContext();
const merged = usePartProps(arrowProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { usePopoverContext, type PopoverState } from './use-popover';

defineOptions({ name: 'PopoverClose', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  /**
   * The popover's state.
   * @slotOnly
   */
  default(props: PopoverState): unknown;
}>();

const { closeProps, state } = usePopoverContext();
const merged = usePartProps(closeProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useTooltipContext, type TooltipState } from './use-tooltip';

defineOptions({ name: 'TooltipArrow', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The tooltip's state.
   * @slotOnly The element carries only `data-part="arrow"` and `data-side`.
   */
  default(props: TooltipState): unknown;
}>();

const { arrowProps, state } = useTooltipContext();
const merged = usePartProps(arrowProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useGaugeContext, type GaugeState } from '../../shared/use-gauge';

defineOptions({ name: 'ProgressValue', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

defineSlots<{
  /**
   * Shows the formatted value when left empty.
   * @slotOnly The element carries no state, and is hidden from assistive technology: the root reads the value out.
   */
  default(props: GaugeState): unknown;
}>();

const { valueProps, state } = useGaugeContext();
const merged = usePartProps(valueProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state">{{ state.formattedValue }}</slot>
  </Part>
</template>

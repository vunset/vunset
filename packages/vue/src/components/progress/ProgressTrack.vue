<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useGaugeContext, type GaugeState } from '../../shared/use-gauge';

defineOptions({ name: 'ProgressTrack', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * @slotOnly The element carries only `data-status`.
   */
  default(props: GaugeState): unknown;
}>();

const { trackProps, state } = useGaugeContext();
const merged = usePartProps(trackProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state"></slot>
  </Part>
</template>

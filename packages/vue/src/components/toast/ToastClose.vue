<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useToastRootContext, type ToastSlotProps } from '../../composables/use-toast';

defineOptions({ name: 'ToastClose', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  /** @slotOnly The element carries only `data-part="close"`. */
  default(props: ToastSlotProps): unknown;
}>();

const { closeProps, state, toast, close } = useToastRootContext();
const merged = usePartProps(closeProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" :toast="toast" :close="close" />
  </Part>
</template>

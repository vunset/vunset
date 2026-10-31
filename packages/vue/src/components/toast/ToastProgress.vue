<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useToastRootContext, type ToastSlotProps } from '../../composables/use-toast';

defineOptions({ name: 'ToastProgress', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  default(
    props: ToastSlotProps & {
      /**
       * The timeout's full length, in milliseconds.
       * @attribute `--toast-duration` in `ms`
       */
      duration: number;
      /**
       * Whether the timeout is held, while the stack is expanded or the toast leaves.
       * @attribute `data-paused`
       */
      paused: boolean;
    }
  ): unknown;
}>();

const { progressProps, state, toast, close, timer } = useToastRootContext();
const merged = usePartProps(progressProps);
</script>

<template>
  <Part v-if="timer" :key="timer.cycle" :as="props.as" v-bind="merged">
    <slot v-bind="state" :toast="toast" :close="close" :duration="timer.duration" :paused="timer.paused" />
  </Part>
</template>

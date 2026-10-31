<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import {
  useToastRoot,
  provideToastRootContext,
  type ToastSlotProps,
  type ToastSwipeDirection
} from '../../composables/use-toast';

defineOptions({ name: 'ToastRoot', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The ways a swipe dismisses it; `[]` turns swiping off. @default ['down', 'right'] */
    swipeDirection?: ToastSwipeDirection | ToastSwipeDirection[];
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  default(props: ToastSlotProps): unknown;
}>();

const api = useToastRoot({ swipeDirection: () => props.swipeDirection });
provideToastRootContext(api);
defineExpose(api);

const merged = usePartProps(api.rootProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="api.state.value" :toast="api.toast.value" :close="api.close" />
  </Part>
</template>

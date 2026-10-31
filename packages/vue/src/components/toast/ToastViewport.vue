<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import { provideToastItemContext, type Toast } from '../../composables/use-toast';

/**
 * One entry in the stack. Private to the viewport.
 *
 * It exists only to hold a `provide`, which Vue can do just once per component
 * setup — the viewport cannot provide a different toast on each pass of its own
 * loop. That is what lets the template be registered once and still have every
 * part inside it know which toast it is rendering, instead of the template
 * having to thread a `toast` prop through by hand.
 *
 * A render function rather than a template, because a toast may carry a
 * renderer of its own and `<component :is>` would mistake that function for a
 * functional component and call it with a props object instead of the toast.
 *
 * Declared in a plain `<script>` block so it is created once for the module
 * rather than once per viewport instance.
 */
const ToastItem = defineComponent({
  name: 'ToastItem',
  inheritAttrs: false,
  props: {
    toast: { type: Object as PropType<Toast<any>>, required: true }
  },
  setup(props, { slots }) {
    provideToastItemContext(computed(() => props.toast));

    return () => (props.toast.slot ? props.toast.slot(props.toast) : slots.default?.({ toast: props.toast }));
  }
});
</script>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import {
  useToastViewport,
  provideToastViewportContext,
  type ToastPosition,
  type ToastStore
} from '../../composables/use-toast';

defineOptions({ name: 'ToastViewport', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which corner or edge of the viewport the stack sits in. @default 'bottom-end' */
    position?: ToastPosition;
    /** How many toasts stay in the stack; the rest wait their turn. @default 3 */
    limit?: number;
    /** Milliseconds before a toast that names no `timeout` dismisses itself. @default 5000 */
    timeout?: number;
    /** Names the region for assistive technology. @default 'Notifications' */
    label?: string;
    /** A store other than the shared one, for a second app or a server render. */
    store?: ToastStore;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The template every toast is rendered with: a `ToastRoot` and whatever goes in it.
   * @template
   */
  default(props: {
    /** The toast being rendered. */
    toast: Toast<any>;
  }): unknown;
}>();

const api = useToastViewport({
  store: props.store,
  position: toRef(() => props.position),
  limit: toRef(() => props.limit),
  timeout: toRef(() => props.timeout),
  label: toRef(() => props.label)
});

provideToastViewportContext({ store: api.store });
defineExpose(api);

const merged = usePartProps(api.viewportProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <ToastItem v-for="toast in api.toasts.value" :key="toast.id" :toast="toast">
      <template #default="{ toast: current }">
        <slot :toast="current" />
      </template>
    </ToastItem>
  </Part>
</template>

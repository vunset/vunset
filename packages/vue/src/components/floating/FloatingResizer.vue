<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useFloatingContext, type FloatingState, type FloatingHandle } from './FloatingRoot.vue';

defineOptions({ name: 'FloatingResizer', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The edge or corner it pulls, from `handles` in the root's slot. */
    value: FloatingHandle;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  /**
   * The panel's state.
   * @slotOnly The element carries its own edge or corner as `data-handle="…"`.
   */
  default(props: FloatingState): unknown;
}>();

const floating = useFloatingContext();
const merged = usePartProps(() => floating.getResizerProps(props.value));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="floating.state.value" />
  </Part>
</template>

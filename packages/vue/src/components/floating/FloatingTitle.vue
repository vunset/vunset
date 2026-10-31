<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useRegisteredId } from '../../shared/labeling';
import { useFloatingContext, type FloatingState } from './FloatingRoot.vue';

defineOptions({ name: 'FloatingTitle', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'h2' }
);

defineSlots<{
  /**
   * The panel's state.
   * @slotOnly The element carries only the id the panel is labeled by.
   */
  default(props: FloatingState): unknown;
}>();

const { titleProps, state, registerTitle } = useFloatingContext();

const id = useRegisteredId(registerTitle);

const merged = usePartProps(() => ({ ...titleProps.value, id: id.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

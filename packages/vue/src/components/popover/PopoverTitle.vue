<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useRegisteredId } from '../../shared/labeling';
import { usePopoverContext, type PopoverState } from './use-popover';

defineOptions({ name: 'PopoverTitle', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'h2' }
);

defineSlots<{
  /**
   * The popover's state.
   * @slotOnly The element carries only `data-part="title"` and the id the popup is labeled by.
   */
  default(props: PopoverState): unknown;
}>();

const { state, registerTitle } = usePopoverContext();

const id = useRegisteredId(registerTitle);

const merged = usePartProps(() => ({ 'data-part': 'title', id: id.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useDragContext, useDragItemContext, type DragItemState } from './DragRoot.vue';

defineOptions({ name: 'DragHandle', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

defineSlots<{
  default(props: DragItemState): unknown;
}>();

const drag = useDragContext();
const item = useDragItemContext();

const merged = usePartProps(() => drag.getHandleProps(item.value(), item.disabled()));
const state = computed(() => drag.getItemState(item.value(), item.disabled()));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

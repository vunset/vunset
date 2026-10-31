<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { provideDragItemContext, useDragContext, type DragItemState } from './DragRoot.vue';

defineOptions({ name: 'DragItem', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The entry of the root's list this item stands for. */
    value: unknown;
    /** Whether it can't be picked up. The others can still move past it. */
    disabled?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

defineSlots<{
  default(props: DragItemState): unknown;
}>();

const drag = useDragContext();
provideDragItemContext({ value: () => props.value, disabled: () => props.disabled });

const merged = usePartProps(() => drag.getItemProps(props.value, props.disabled));
const state = computed(() => drag.getItemState(props.value, props.disabled));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

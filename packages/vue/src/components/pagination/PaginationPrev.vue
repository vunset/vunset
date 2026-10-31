<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { usePaginationContext, type PaginationState } from './PaginationRoot.vue';

defineOptions({ name: 'PaginationPrev', inheritAttrs: false });

const props = defineProps<{
  /** Element or component to render. A `button`, or a link when the root has `to`. */
  as?: string | object;
}>();

defineSlots<{
  /**
   * The pagination's state.
   * @slotOnly The element carries `data-disabled` while there is no page that way.
   */
  default(props: PaginationState): unknown;
}>();

const pagination = usePaginationContext();
const merged = usePartProps(pagination.prevProps);
</script>

<template>
  <Part :as="props.as ?? pagination.prevTag.value" v-bind="merged">
    <slot v-bind="pagination.state.value" />
  </Part>
</template>

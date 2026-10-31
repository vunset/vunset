<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { usePaginationContext, type PaginationState } from './PaginationRoot.vue';

defineOptions({ name: 'PaginationEllipsis', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

defineSlots<{
  /**
   * The pagination's state. Its default content is `…`.
   * @slotOnly
   */
  default(props: PaginationState): unknown;
}>();

const pagination = usePaginationContext();
const merged = usePartProps(pagination.ellipsisProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="pagination.state.value">…</slot>
  </Part>
</template>

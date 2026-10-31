<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { usePaginationContext } from './PaginationRoot.vue';

defineOptions({ name: 'PaginationItem', inheritAttrs: false });

const props = defineProps<{
  /** The page it goes to, from `items` in the root's slot. */
  value: number;
  /** Element or component to render. A `button`, or a link when the root has `to`. */
  as?: string | object;
}>();

defineSlots<{
  default(props: {
    /**
     * The current page.
     * @attribute none
     */
    page: number;
    /**
     * How many pages there are.
     * @attribute none
     */
    totalPages: number;
    /** Whether it ignores interaction. */
    disabled: boolean;
    /**
     * Whether the current page is the first.
     * @attribute none
     */
    first: boolean;
    /**
     * Whether the current page is the last.
     * @attribute none
     */
    last: boolean;
    /**
     * The page it goes to.
     * @attribute `data-page="…"`
     */
    value: number;
    /** Whether it is the current page. */
    selected: boolean;
  }): unknown;
}>();

const pagination = usePaginationContext();
const merged = usePartProps(() => pagination.getItemProps(props.value));

const state = computed(() => ({
  ...pagination.state.value,
  value: props.value,
  selected: props.value === pagination.state.value.page
}));
</script>

<template>
  <Part :as="props.as ?? pagination.itemTag.value" v-bind="merged">
    <slot v-bind="state">{{ props.value }}</slot>
  </Part>
</template>

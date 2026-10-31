<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { dataAttrs } from '../../shared/data-attrs';
import { useMenuItemIndicatorContext } from '../../shared/use-menu';

defineOptions({ name: 'MenuItemIndicator', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Stay in the DOM while unchecked, e.g. to keep item labels aligned. */
    keepMounted?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'span' }
);

defineSlots<{
  default(props: {
    /**
     * Whether it is its item's checked.
     * @attribute `data-checked` while its item's checked, `data-unchecked` otherwise
     */
    checked: boolean;
    /** Whether it ignores interaction. */
    disabled: boolean;
  }): unknown;
}>();


const item = useMenuItemIndicatorContext();

const state = computed(() => ({ checked: item.checked(), disabled: item.disabled() }));

const indicatorProps = computed(() => ({
  ...dataAttrs(state.value, { checked: (on) => (on ? { 'data-checked': '' } : { 'data-unchecked': '' }) }),
  'data-part': 'item-indicator',
  'aria-hidden': 'true'
}));

const merged = usePartProps(indicatorProps);
</script>

<template>
  <Part :as="props.as" v-if="state.checked || props.keepMounted" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

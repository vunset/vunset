<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext, type ListboxScrollDirection } from '../../shared/use-listbox';

defineOptions({ name: 'ListboxScrollIndicator', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which end of the list it scrolls towards. Shown only while the list can scroll that way. */
    direction: ListboxScrollDirection;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { getScrollProps, canScroll, state } = useListboxContext();
const merged = usePartProps(() => getScrollProps(props.direction));
</script>

<template>
  <Part :as="props.as" v-if="canScroll(props.direction)" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

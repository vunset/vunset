<script setup lang="ts">
import { Part } from '../../shared/part';
import { toRef } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { provideCollapsibleContext } from '../../shared/use-collapsible';
import { useAccordionItem, type AccordionValue } from './use-accordion';

defineOptions({ name: 'AccordionItem', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Names the item in the root's value. Generated when not given. */
    value?: AccordionValue;
    /** Keeps this item's trigger from opening or closing it; arrow keys skip it. */
    disabled?: boolean;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const api = useAccordionItem({ value: toRef(() => props.value), disabled: toRef(() => props.disabled) });

provideCollapsibleContext(api);

const merged = usePartProps(api.rootProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="api.state.value" />
  </Part>
</template>

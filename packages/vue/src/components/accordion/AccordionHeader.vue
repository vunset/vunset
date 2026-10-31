<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useCollapsibleContext } from '../../shared/use-collapsible';

defineOptions({ name: 'AccordionHeader', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render: a heading at the page's level, `h3` by default. */
    as?: string | object;
  }>(),
  { as: 'h3' }
);

const { rootProps, state } = useCollapsibleContext();
const merged = usePartProps(() => ({ ...rootProps.value, 'data-part': 'accordion-header' }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

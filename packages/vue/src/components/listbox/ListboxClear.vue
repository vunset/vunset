<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext } from '../../shared/use-listbox';

defineOptions({ name: 'ListboxClear', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'button' }
);

const { clearProps, showClear, state } = useListboxContext();
const merged = usePartProps(clearProps);
</script>

<template>
  <!-- Absent rather than disabled when there is nothing to clear: a control
       that cannot do anything is better not offered to the keyboard at all. -->
  <Part :as="props.as" v-if="showClear" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

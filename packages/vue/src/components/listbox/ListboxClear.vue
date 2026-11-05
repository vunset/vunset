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
  <!-- Absent, not disabled, so the keyboard isn't offered a dead control. -->
  <Part :as="props.as" v-if="showClear" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

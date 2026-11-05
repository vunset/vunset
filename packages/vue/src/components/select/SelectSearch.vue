<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext } from '../../shared/use-listbox';

defineOptions({ name: 'SelectSearch', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'input' }
);

const { searchProps } = useListboxContext();
const merged = usePartProps(searchProps);
</script>

<template>
  <!-- Keeps focus while open; the highlight moves by `aria-activedescendant`. -->
  <Part :as="props.as" v-bind="merged" />
</template>

<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useListboxContext } from '../../shared/use-listbox';

defineOptions({ name: 'ListboxEmpty', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { emptyProps, state } = useListboxContext();
const merged = usePartProps(emptyProps);
</script>

<template>
  <!-- A sibling of the list, not a child: a `role="listbox"` owns options and
       groups, and a message among them is neither. -->
  <Part :as="props.as" v-if="state.empty" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

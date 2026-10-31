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
  <!--
    Keeps DOM focus for as long as the popup is open — typing has to keep
    working — so the highlight travels by `aria-activedescendant` rather than by
    moving focus onto the options.

    Set `searchable` on the root as well: it is what sends focus here on
    opening.
  -->
  <Part :as="props.as" v-bind="merged" />
</template>

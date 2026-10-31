<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { useOptionalGroupContext, perpendicular } from '../group/Group.vue';

defineOptions({ name: 'Separator', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Which way the line runs. Inside a `Group`, across the group's own direction. */
    orientation?: 'horizontal' | 'vertical';
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const group = useOptionalGroupContext();

const orientation = computed(
  () => props.orientation ?? (group ? perpendicular(group.state.value.orientation) : 'horizontal')
);
</script>

<template>
  <Part
    :as="props.as"
    data-part="separator"
    role="separator"
    :aria-orientation="orientation"
    :data-orientation="orientation"
    v-bind="$attrs"
  />
</template>

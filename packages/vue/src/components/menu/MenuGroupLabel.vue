<script setup lang="ts">
import { Part } from '../../shared/part';
import { onBeforeUnmount } from 'vue';
import { useMenuGroupContext } from '../../shared/use-menu';

defineOptions({ name: 'MenuGroupLabel', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { labelId, registerLabel } = useMenuGroupContext();

onBeforeUnmount(registerLabel());
</script>

<template>
  <Part :as="props.as" data-part="group-label" :id="labelId" role="presentation" v-bind="$attrs">
    <slot />
  </Part>
</template>

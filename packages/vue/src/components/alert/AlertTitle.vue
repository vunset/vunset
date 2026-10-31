<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useRegisteredId } from '../../shared/labeling';
import { useAlertContext } from './AlertRoot.vue';

defineOptions({ name: 'AlertTitle', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { registerTitle } = useAlertContext();

const id = useRegisteredId(registerTitle);
const merged = usePartProps(() => ({ 'data-part': 'title', id: id.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot />
  </Part>
</template>

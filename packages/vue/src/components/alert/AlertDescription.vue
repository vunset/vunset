<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useRegisteredId } from '../../shared/labeling';
import { useAlertContext } from './AlertRoot.vue';

defineOptions({ name: 'AlertDescription', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { registerDescription } = useAlertContext();

const id = useRegisteredId(registerDescription);
const merged = usePartProps(() => ({ 'data-part': 'description', id: id.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot />
  </Part>
</template>

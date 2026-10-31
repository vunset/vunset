<script setup lang="ts">
import { Part } from '../../shared/part';
import { usePartProps } from '../../shared/use-part-props';
import { useSurface } from '../../shared/surface';

defineOptions({ name: 'Popup', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const { popupProps, state } = useSurface();
// A surface that names its popup otherwise (a listbox) wins.
const merged = usePartProps(() => ({ 'data-part': 'popup', ...popupProps.value }));
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="state" />
  </Part>
</template>

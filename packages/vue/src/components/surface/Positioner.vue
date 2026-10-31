<script setup lang="ts">
import { Part } from '../../shared/part';
import { computed } from 'vue';
import { usePartProps } from '../../shared/use-part-props';
import { useSurface } from '../../shared/surface';

defineOptions({ name: 'Positioner', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { as: 'div' }
);

const surface = useSurface();

const positionerProps = computed(() => {
  if (!surface.positionerProps) {
    throw new Error(
      '<Positioner> is inside a surface that is not anchored to anything. Render the <Popup> directly instead.'
    );
  }
  return surface.positionerProps.value;
});

const merged = usePartProps(positionerProps);
</script>

<template>
  <Part :as="props.as" v-bind="merged">
    <slot v-bind="surface.state.value" />
  </Part>
</template>

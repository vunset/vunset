<script setup lang="ts">
import { Group, type GroupVariant } from '@vunset/vue';

defineOptions({ name: 'AppGroup' });

withDefaults(
  defineProps<{
    /** `group` gives `role="group"`; `toolbar` gives `role="toolbar"`, one tab stop with arrow keys between its controls. */
    variant?: GroupVariant;
    /** Which way the controls run. */
    orientation?: 'horizontal' | 'vertical';
    /** Names the group for assistive technology, as `aria-label`. */
    label?: string;
    /** Element or component to render. */
    as?: string | object;
  }>(),
  { variant: 'group', orientation: 'horizontal', as: 'div' }
);

defineSlots<{
  /** The controls: buttons, inputs, selects, any `App*` or `Form*` with a box. */
  default?(): unknown;
}>();
</script>

<template>
  <Group :variant="variant" :orientation="orientation" :label="label" :as="as" class="app-group">
    <slot />
  </Group>
</template>

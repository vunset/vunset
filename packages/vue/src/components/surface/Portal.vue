<script setup lang="ts">
import { useSurface } from '../../shared/surface';

defineOptions({ name: 'Portal' });

const props = withDefaults(
  defineProps<{
    /** Where to teleport to. `#teleports` when the page has one, otherwise `body`. */
    to?: string | HTMLElement;
    /** Render in place instead, leaving the content where it is written. */
    disabled?: boolean;
  }>(),
  { to: undefined, disabled: false }
);

const TELEPORTS = '#teleports';

// SSR (Nuxt included) renders teleports into `#teleports`.
function target() {
  if (props.to !== undefined) return props.to;
  return typeof document === 'undefined' || document.querySelector(TELEPORTS) ? TELEPORTS : 'body';
}

const { present } = useSurface();
</script>

<template>
  <Teleport v-if="present" :to="target()" :disabled="props.disabled">
    <slot />
  </Teleport>
</template>

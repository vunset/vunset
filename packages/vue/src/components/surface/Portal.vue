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

// A server can't look, so it always names `#teleports`: that is where an SSR
// page (Nuxt's included) puts `teleports['#teleports']`.
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

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useOptionalSurface } from '../../shared/surface';

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

const surface = useOptionalSurface();

const mounted = ref(false);
onMounted(() => (mounted.value = true));

const present = computed(() => surface?.present.value ?? true);
const disabled = computed(() => props.disabled || (!surface && !mounted.value));
</script>

<template>
  <Teleport v-if="present" :to="target()" :disabled="disabled">
    <slot />
  </Teleport>
</template>

<script setup lang="ts">
import AppIcon from './AppIcon.vue';

defineOptions({ name: 'AppSpinner' });

defineProps<{
  /** Names it for assistive technology. Without it, it is decoration beside text that says what is loading. */
  label?: string;
}>();
</script>

<template>
  <AppIcon name="spinner" class="app-spinner" :aria-label="label" />
</template>

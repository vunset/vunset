<script setup lang="ts">
import { AppButton } from '@vunset/ui';
</script>

<template>
  <div class="flex items-center gap-2">
    <AppButton variant="solid" size="xs" tone="accent">Extra small</AppButton>
    <AppButton variant="solid" size="sm" tone="accent">Small</AppButton>
    <AppButton variant="solid" tone="accent">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3v10M3 8h10" /></svg>
      Medium
    </AppButton>
    <AppButton variant="solid" size="lg" tone="accent">
      Large
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4" /></svg>
    </AppButton>
  </div>
</template>

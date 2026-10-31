<script setup lang="ts">
import { AppButton } from '@vunset/ui';
</script>

<template>
  <div class="flex gap-2">
    <AppButton square variant="outline" aria-label="Add">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3v10M3 8h10" /></svg>
    </AppButton>
    <AppButton square variant="ghost" tone="danger" aria-label="Delete">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5" />
      </svg>
    </AppButton>
  </div>
</template>

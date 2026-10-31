<script setup lang="ts">
import { AppBadge } from '@vunset/ui';
</script>

<template>
  <div class="flex items-center gap-1.5">
    <AppBadge size="sm" tone="accent">Small</AppBadge>
    <AppBadge tone="accent">Medium</AppBadge>
    <AppBadge size="lg" tone="accent">Large</AppBadge>
  </div>
</template>

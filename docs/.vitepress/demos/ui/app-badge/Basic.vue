<script setup lang="ts">
import { AppBadge } from '@vunset/ui';
</script>

<template>
  <div class="flex gap-1.5">
    <AppBadge tone="success">Active</AppBadge>
    <AppBadge>Draft</AppBadge>
    <AppBadge variant="solid" tone="accent">New</AppBadge>
  </div>
</template>

<script setup lang="ts">
import { AppBadge } from '@vunset/ui';

const TONES = ['neutral', 'accent', 'success', 'warning', 'danger'] as const;
const VARIANTS = ['solid', 'soft', 'outline'] as const;
</script>

<template>
  <div class="grid gap-2">
    <div v-for="variant in VARIANTS" :key="variant" class="flex flex-wrap gap-1.5">
      <AppBadge v-for="tone in TONES" :key="tone" :variant="variant" :tone="tone">{{ tone }}</AppBadge>
    </div>
  </div>
</template>

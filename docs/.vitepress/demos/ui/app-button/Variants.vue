<script setup lang="ts">
import { AppButton } from '@vunset/ui';

const TONES = ['neutral', 'accent', 'success', 'warning', 'danger'] as const;
const VARIANTS = ['solid', 'soft', 'outline', 'ghost'] as const;
</script>

<template>
  <div class="grid gap-2">
    <div v-for="variant in VARIANTS" :key="variant" class="flex flex-wrap gap-2">
      <AppButton v-for="tone in TONES" :key="tone" :variant="variant" :tone="tone">{{ tone }}</AppButton>
    </div>
  </div>
</template>

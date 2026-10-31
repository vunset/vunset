<script setup lang="ts">
import { AppDotMatrix, APP_DOT_MATRIX_VARIANTS } from '@vunset/ui';
</script>

<template>
  <div class="grid grid-cols-5 gap-6">
    <figure v-for="variant in APP_DOT_MATRIX_VARIANTS" :key="variant" class="m-0 grid justify-items-center gap-2">
      <AppDotMatrix :variant="variant" class="size-8" />
      <figcaption class="text-xs opacity-60">{{ variant }}</figcaption>
    </figure>
  </div>
</template>

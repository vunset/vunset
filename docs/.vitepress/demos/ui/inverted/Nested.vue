<script setup lang="ts">
import { AppButton } from '@vunset/ui';
</script>

<template>
  <div class="inverted grid w-full max-w-md gap-3 rounded-xl p-4">
    <p class="m-0 text-sm">Inverted: the other scheme from the page’s.</p>
    <div class="inverted flex items-center justify-between gap-3 rounded-lg p-3">
      <span class="text-sm">Inverted again: the page’s own.</span>
      <AppButton variant="solid" tone="accent">Upgrade</AppButton>
    </div>
  </div>
</template>

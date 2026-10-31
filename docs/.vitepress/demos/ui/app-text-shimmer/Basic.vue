<script setup lang="ts">
import { AppDotMatrix } from '@vunset/ui';
</script>

<template>
  <div class="grid gap-4 text-sm">
    <p class="app-text-shimmer m-0">Thinking…</p>
    <p class="app-text-shimmer m-0 flex items-center gap-2">
      <AppDotMatrix variant="orbit" class="size-4" /> Searching 1,240 documents
    </p>
    <h3 class="app-text-shimmer m-0 text-xl font-semibold text-(--ui-accent)">Generating your report</h3>
  </div>
</template>

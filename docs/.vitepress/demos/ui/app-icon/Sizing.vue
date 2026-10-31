<script setup lang="ts">
import { AppIcon } from '@vunset/ui';
</script>

<template>
  <div class="grid gap-2">
    <p class="m-0 flex items-center gap-1.5 text-xs"><AppIcon name="alert-success" /> Saved, in a small line</p>
    <p class="m-0 flex items-center gap-1.5 text-sm"><AppIcon name="alert-success" /> Saved, in the body text</p>
    <p class="m-0 flex items-center gap-2 text-2xl font-semibold"><AppIcon name="alert-success" /> Saved, in a heading</p>
  </div>
</template>

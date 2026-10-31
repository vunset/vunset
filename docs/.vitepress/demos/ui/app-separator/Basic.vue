<script setup lang="ts">
import { Separator } from '@vunset/vue';
</script>

<template>
  <div class="grid w-80 gap-3 text-sm">
    <div>
      <p class="m-0 font-semibold">vunset</p>
      <p class="m-0 opacity-70">Headless parts and ready-made components.</p>
    </div>

    <Separator class="app-separator" />

    <nav class="flex h-5 items-center gap-3">
      <a href="#">Docs</a>
      <Separator orientation="vertical" class="app-separator" />
      <a href="#">Components</a>
      <Separator orientation="vertical" class="app-separator" />
      <a href="#">Source</a>
    </nav>
  </div>
</template>

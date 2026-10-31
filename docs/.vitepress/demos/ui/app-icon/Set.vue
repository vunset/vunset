<script setup lang="ts">
import { AppIcon, UI_ICONS } from '@vunset/ui';

const names = Object.keys(UI_ICONS);
</script>

<template>
  <div class="grid w-full grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2 text-sm">
    <div v-for="name in names" :key="name" class="flex items-center gap-2 rounded-md px-2 py-1.5 opacity-90">
      <AppIcon :name="name" />
      <code class="text-xs">{{ name }}</code>
    </div>
  </div>
</template>

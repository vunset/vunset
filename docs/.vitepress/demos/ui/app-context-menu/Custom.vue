<script setup lang="ts">
import { ref } from 'vue';
import { MenuItem, MenuGroup, MenuGroupLabel, Separator } from '@vunset/vue';
import { AppContextMenu } from '@vunset/ui';

const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];
const color = ref(colors[3]!);
</script>

<template>
  <AppContextMenu
    class="grid h-32 w-full max-w-sm place-items-center rounded-lg text-sm text-white"
    :style="{ background: color }"
  >
    <template #trigger>Right-click to recolor</template>

    <!-- Menu parts of your own, with AppMenu's classes for the look. -->
    <MenuGroup class="app-menu-group">
      <MenuGroupLabel class="app-menu-group-label">Color</MenuGroupLabel>
      <div class="flex gap-1 px-2 pb-1">
        <MenuItem
          v-for="swatch in colors"
          :key="swatch"
          class="size-7 cursor-pointer rounded-full outline-offset-2 focus:outline-2 focus:outline-current"
          :style="{ background: swatch }"
          :aria-label="swatch"
          @select="color = swatch"
        />
      </div>
    </MenuGroup>
    <Separator class="app-menu-separator" />
    <MenuItem class="app-menu-item" @select="color = colors[3]!">
      <span class="app-menu-text">Reset</span>
    </MenuItem>
  </AppContextMenu>
</template>

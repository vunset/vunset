<script setup lang="ts">
import { AppDrawer, AppButton } from '@vunset/ui';
</script>

<template>
  <div class="flex gap-2">
    <AppDrawer title="By the handle" trigger="handle" handle :as="AppButton" variant="outline" size="sm">
      <p class="m-0">Swipe the handle down to close.</p>
    </AppDrawer>

    <AppDrawer title="From anywhere" trigger="swipeable" swipeable :as="AppButton" variant="outline" size="sm">
      <p class="m-0">Swipe anywhere on the panel down to close.</p>
    </AppDrawer>

    <AppDrawer side="right" title="Both" trigger="both" swipeable handle :as="AppButton" variant="outline" size="sm">
      <p class="m-0">A handle to show it can go, and a swipe from anywhere.</p>
    </AppDrawer>
  </div>
</template>

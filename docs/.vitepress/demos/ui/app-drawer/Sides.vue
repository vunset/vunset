<script setup lang="ts">
import { AppDrawer, AppButton } from '@vunset/ui';
</script>

<template>
  <div class="flex gap-2">
    <AppDrawer
      v-for="side in ['bottom', 'right', 'left', 'top'] as const"
      :key="side"
      :side="side"
      title="Settings"
      :trigger="side"
      :as="AppButton"
      variant="outline"
      size="sm"
    >
      <p class="m-0">Enters from the {{ side }}.</p>
    </AppDrawer>
  </div>
</template>

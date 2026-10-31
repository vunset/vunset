<script setup lang="ts">
import { AppButton, AppSpinner } from '@vunset/ui';
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <span class="flex items-center gap-2"><AppSpinner /> Loading orders…</span>
    <AppSpinner label="Loading" class="size-8 text-(--ui-accent)" />
    <AppButton variant="solid" loading>
      <AppSpinner />
      Saving
    </AppButton>
  </div>
</template>

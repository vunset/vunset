<script setup lang="ts">
import { AppAlert, AppButton } from '@vunset/ui';
</script>

<template>
  <AppAlert tone="accent" title="Update ready" description="Restart to finish installing." class="w-96">
    <template #actions>
      <AppButton variant="solid" size="sm" tone="accent">Restart</AppButton>
      <AppButton size="sm" variant="ghost">Later</AppButton>
    </template>
  </AppAlert>
</template>

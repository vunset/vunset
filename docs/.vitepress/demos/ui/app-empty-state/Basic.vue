<script setup lang="ts">
import { AppButton, AppEmptyState } from '@vunset/ui';
</script>

<template>
  <AppEmptyState
    icon="alert-info"
    title="No projects yet"
    description="Projects you create or are invited to show up here."
    class="w-full max-w-md rounded-lg border border-dotted border-current/20"
  >
    <template #actions>
      <AppButton variant="solid" tone="accent">New project</AppButton>
      <AppButton variant="outline">Import</AppButton>
    </template>
  </AppEmptyState>
</template>

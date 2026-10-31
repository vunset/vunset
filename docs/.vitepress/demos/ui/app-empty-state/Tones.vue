<script setup lang="ts">
import { AppDotMatrix, AppEmptyState } from '@vunset/ui';
</script>

<template>
  <div class="grid w-full gap-4 sm:grid-cols-3">
    <AppEmptyState tone="success" icon="alert-success" title="All caught up" description="No new notifications." />
    <AppEmptyState tone="danger" icon="alert-warning" title="Couldn't load" description="Check your connection." />
    <AppEmptyState tone="accent" title="Indexing" description="This takes a minute.">
      <template #icon><AppDotMatrix variant="waves" /></template>
    </AppEmptyState>
  </div>
</template>

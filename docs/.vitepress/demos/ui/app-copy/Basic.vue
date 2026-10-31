<script setup lang="ts">
import { AppCopy } from '@vunset/ui';

const command = 'npm install @vunset/ui';
</script>

<template>
  <div class="grid w-full max-w-md gap-3">
    <div class="flex items-center justify-between gap-2 rounded-lg border border-current/15 py-1 ps-3 pe-1 text-sm">
      <code>{{ command }}</code>
      <AppCopy :value="command" />
    </div>

    <AppCopy value="https://vunset.dev/ui/app-copy" label="Copy link" class="justify-self-start" />
  </div>
</template>

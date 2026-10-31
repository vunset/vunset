<script setup lang="ts">
import { AppMeter } from '@vunset/ui';

// The tone is the app's call: here, how close to full.
const tone = (used: number) => (used > 90 ? 'danger' : used > 70 ? 'warning' : 'success');
</script>

<template>
  <div class="grid w-full max-w-sm gap-4">
    <AppMeter
      v-for="disk in [
        { label: 'System', used: 41 },
        { label: 'Photos', used: 78 },
        { label: 'Backups', used: 95 }
      ]"
      :key="disk.label"
      :value="disk.used"
      :label="disk.label"
      :format="{ style: 'unit', unit: 'percent' }"
      :tone="tone(disk.used)"
    />
  </div>
</template>

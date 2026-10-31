<script setup lang="ts">
import { FormTimepicker } from '@vunset/ui';
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <FormTimepicker default-value="12:00" label="Disabled" disabled class="w-44" />
    <FormTimepicker default-value="12:00" label="Read-only" read-only class="w-44" />
    <FormTimepicker label="Required" required error="Enter a time." class="w-44" />
  </div>
</template>

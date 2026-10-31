<script setup lang="ts">
import { AppTooltip } from '@vunset/ui';
</script>

<template>
  <p class="m-0 max-w-sm">
    Every plan includes our
    <AppTooltip
      trigger="SLA"
      trigger-class="underline cursor-help"
      content="Service level agreement: 99.9% uptime, or credit back."
    />
    from the first day.
  </p>
</template>

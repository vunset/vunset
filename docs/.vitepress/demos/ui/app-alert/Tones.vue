<script setup lang="ts">
import { AppAlert } from '@vunset/ui';
</script>

<template>
  <div class="grid w-96 gap-2">
    <AppAlert title="Heads up" description="Maintenance on Sunday, 2–4am." />
    <AppAlert tone="success" title="Saved" />
    <AppAlert tone="warning" description="Your trial ends in 3 days." />
    <AppAlert tone="danger" title="Payment failed" description="Your card was declined." />
  </div>
</template>

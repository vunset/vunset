<script setup lang="ts">
import { AppCollapsible } from '@vunset/ui';
</script>

<template>
  <AppCollapsible title="Order details" class="w-full max-w-sm">
    <template #icon="{ open }">
      <span class="text-(--ui-muted) text-sm font-normal">{{ open ? 'Hide' : 'Show' }}</span>
    </template>

    <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
      <dt>Order</dt>
      <dd class="m-0">#1042</dd>
      <dt>Placed</dt>
      <dd class="m-0">Oct 3, 2026</dd>
    </dl>
  </AppCollapsible>
</template>

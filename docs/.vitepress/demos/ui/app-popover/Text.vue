<script setup lang="ts">
import { AppPopover } from '@vunset/ui';
</script>

<template>
  <p class="m-0 max-w-sm">
    Shipping is free over $50, and
    <AppPopover trigger="returns are easy" title="Returns" arrow>
      Send it back within 30 days, unworn, for a full refund. We pay the postage.
    </AppPopover>
    too.
  </p>
</template>

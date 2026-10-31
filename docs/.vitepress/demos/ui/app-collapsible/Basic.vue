<script setup lang="ts">
import { ref } from 'vue';
import { AppCollapsible } from '@vunset/ui';

const open = ref(false);
</script>

<template>
  <AppCollapsible v-model:open="open" title="Order details" class="w-full max-w-sm">
    <dl class="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
      <dt>Order</dt>
      <dd class="m-0">#1042</dd>
      <dt>Placed</dt>
      <dd class="m-0">Oct 3, 2026</dd>
      <dt>Ships to</dt>
      <dd class="m-0">Lisbon, Portugal</dd>
    </dl>
  </AppCollapsible>

  <DemoOutput>open: {{ open }}</DemoOutput>
</template>

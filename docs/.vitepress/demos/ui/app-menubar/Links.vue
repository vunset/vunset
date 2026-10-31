<script setup lang="ts">
import { AppMenubar, type AppMenubarEntry } from '@vunset/ui';

// In an app with a router: `:link="NuxtLink"` (or `RouterLink`), and each `to` a route.
const items: AppMenubarEntry[] = [
  {
    label: 'Reports',
    items: [
      { label: 'Revenue', to: '#revenue' },
      { label: 'Traffic', to: '#traffic' }
    ]
  },
  { label: 'Logger', to: '#logger' },
  { label: 'Billing', to: '#billing', disabled: true }
];
</script>

<template>
  <AppMenubar :items="items" />
</template>

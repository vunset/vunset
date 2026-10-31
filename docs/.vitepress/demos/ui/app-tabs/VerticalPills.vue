<script setup lang="ts">
import { AppTabs } from '@vunset/ui';
</script>

<template>
  <AppTabs variant="pills" orientation="vertical" :tabs="['Day', 'Week', 'Month']" class="w-72">
    <template #panel="{ tab }">
      <p class="m-0">By {{ String(tab.value).toLowerCase() }}</p>
    </template>
  </AppTabs>
</template>

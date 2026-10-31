<script setup lang="ts">
import { AppTabs, AppBadge } from '@vunset/ui';

const unread: Record<string | number, number> = { Inbox: 3, Sent: 0, Spam: 12 };
</script>

<template>
  <AppTabs
    variant="pills"
    :tabs="['Inbox', 'Sent', 'Spam']"
    class="w-full max-w-sm"
    tabs-class="w-full"
    tab-class="flex-1"
  >
    <template #tab="{ tab, selected }">
      {{ tab.label }}
      <AppBadge v-if="unread[tab.value]" size="sm" :tone="selected ? 'accent' : 'neutral'">
        {{ unread[tab.value] }}
      </AppBadge>
    </template>

    <template #panel="{ tab }">
      <p class="m-0">{{ unread[tab.value] || 'No' }} unread in {{ tab.value }}.</p>
    </template>
  </AppTabs>
</template>

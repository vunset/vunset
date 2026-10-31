<script setup lang="ts">
import { AppBadge, AppButton, AppCard, AppMenu } from '@vunset/ui';
</script>

<template>
  <AppCard title="Pro plan" description="Billed monthly, renews on 1 November." class="w-full max-w-sm">
    <template #actions>
      <AppMenu
        :as="AppButton"
        variant="ghost"
        square
        trigger="…"
        aria-label="Plan options"
        :items="[{ label: 'Change plan' }, { label: 'Cancel', tone: 'danger' }]"
      />
    </template>

    <div class="flex items-baseline gap-2">
      <span class="text-2xl font-semibold">$24</span>
      <span class="opacity-60">/ month</span>
      <AppBadge tone="success" variant="soft" class="ms-auto">Active</AppBadge>
    </div>

    <template #footer>
      <AppButton variant="outline">Invoices</AppButton>
      <AppButton variant="solid" tone="accent">Upgrade</AppButton>
    </template>
  </AppCard>
</template>

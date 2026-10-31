<script setup lang="ts">
import { AppBadge, AppButton, AppCard, FormInput } from '@vunset/ui';
</script>

<template>
  <div class="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
    <AppCard v-for="inverted in [false, true]" :key="String(inverted)" :class="{ inverted }" title="Invite a teammate" :description="inverted ? 'Inverted' : 'The page’s scheme'">
      <template #actions>
        <AppBadge tone="accent" variant="soft">Pro</AppBadge>
      </template>
      <FormInput placeholder="name@company.com" class="w-full" />
      <template #footer>
        <AppButton variant="outline">Cancel</AppButton>
        <AppButton variant="solid" tone="accent">Send</AppButton>
      </template>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { AppPopover, AppButton, FormInput } from '@vunset/ui';
</script>

<template>
  <AppPopover
    title="Share"
    description="Anyone with the link can view."
    arrow
    trigger="Share"
    :as="AppButton"
    variant="outline"
  >
    <FormInput label="Link" read-only default-value="https://vunset.dev/x7" />
  </AppPopover>
</template>

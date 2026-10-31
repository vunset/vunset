<script setup lang="ts">
import { AppDrawer, AppButton, FormInput, FormSwitch } from '@vunset/ui';
</script>

<template>
  <AppDrawer title="Filters" description="Narrow the list down." trigger="Filters" :as="AppButton" variant="outline">

    <div class="grid gap-3">
      <FormInput label="Search" />
      <FormSwitch label="Only mine" />
    </div>

    <template #footer="{ close }">
      <AppButton variant="solid" tone="accent" @click="close">Apply</AppButton>
    </template>
  </AppDrawer>
</template>

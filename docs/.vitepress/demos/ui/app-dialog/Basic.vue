<script setup lang="ts">
import { AppDialog, AppButton, FormInput } from '@vunset/ui';
</script>

<template>
  <AppDialog
    title="Delete project?"
    description="This removes the project and its files. It can’t be undone."
    trigger="Delete project"
    :as="AppButton"
    tone="danger"
    variant="soft"
  >
    <FormInput label="Type the project name" placeholder="vunset" />

    <template #footer="{ close }">
      <AppButton variant="outline" @click="close">Cancel</AppButton>
      <AppButton variant="solid" tone="danger" @click="close">Delete</AppButton>
    </template>
  </AppDialog>
</template>

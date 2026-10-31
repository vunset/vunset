<script setup lang="ts">
import { ref } from 'vue';
import { AppDialog, AppButton } from '@vunset/ui';

const open = ref(false);
</script>

<template>
  <AppButton variant="outline" @click="open = true">Sign out</AppButton>

  <AppDialog v-model:open="open" role="alertdialog" size="sm" title="Sign out?" :closable="false">
    <template #footer="{ close }">
      <AppButton variant="outline" @click="close">Stay</AppButton>
      <AppButton variant="solid" tone="accent" @click="close">Sign out</AppButton>
    </template>
  </AppDialog>

  <DemoOutput>open: {{ open }}</DemoOutput>
</template>

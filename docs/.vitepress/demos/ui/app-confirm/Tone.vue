<script setup lang="ts">
import { AppConfirm, AppButton } from '@vunset/ui';
</script>

<template>
  <AppConfirm title="Restore endpoint #42?" confirm-text="Restore" tone="accent" side="bottom">
    <AppButton variant="outline">Restore</AppButton>
  </AppConfirm>
</template>

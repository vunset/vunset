<script setup lang="ts">
import { ref } from 'vue';
import { AppConfirm, AppButton } from '@vunset/ui';

const last = ref('nothing yet');
</script>

<template>
  <AppConfirm
    title="Delete #42?"
    message="This action cannot be undone."
    confirm-text="Delete"
    @confirm="last = 'confirmed'"
    @cancel="last = 'canceled'"
  >
    <AppButton variant="soft" tone="danger">Delete</AppButton>
  </AppConfirm>

  <DemoOutput>last: {{ last }}</DemoOutput>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AppButton } from '@vunset/ui';

const clicks = ref(0);
</script>

<template>
  <div class="flex gap-2">
    <AppButton variant="solid" disabled @click="clicks++">Disabled</AppButton>
    <AppButton variant="solid" disabled focusable-when-disabled @click="clicks++">Still focusable</AppButton>
  </div>

  <DemoOutput>clicks: {{ clicks }}</DemoOutput>
</template>

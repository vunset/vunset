<script setup lang="ts">
import { ref } from 'vue';
import { AppFloating, AppButton, FormInput, FormSwitch, FormRange } from '@vunset/ui';

const open = ref(false);
const at = ref('—');
</script>

<template>
  <AppButton variant="outline" @click="open = !open">{{ open ? 'Close' : 'Open' }} inspector</AppButton>

  <AppFloating
    v-model:open="open"
    title="Inspector"
    :left="40"
    :top="120"
    :min-width="260"
    :min-height="180"
    @drag="(left, top) => (at = `${Math.round(left)}, ${Math.round(top)}`)"
  >
    <div class="grid gap-3">
      <FormInput label="Name" default-value="Header block" />
      <FormRange label="Opacity" :default-value="80" />
      <FormSwitch label="Visible" default-checked />
    </div>

    <template #footer="{ close }">
      <AppButton variant="outline" size="sm" @click="close">Done</AppButton>
    </template>
  </AppFloating>

  <DemoOutput>open: {{ open }} · dragged to: {{ at }}</DemoOutput>
</template>

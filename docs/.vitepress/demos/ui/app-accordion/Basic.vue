<script setup lang="ts">
import { ref } from 'vue';
import { AppAccordion, type AppAccordionSection } from '@vunset/ui';

const sections: AppAccordionSection[] = [
  { value: 'shipping', title: 'How long does shipping take?' },
  { value: 'returns', title: 'Can I return an order?' },
  { value: 'gift', title: 'Do you gift wrap?', disabled: true }
];
const open = ref(['shipping']);
</script>

<template>
  <AppAccordion v-model="open" :sections="sections" class="w-full max-w-md">
    <template #shipping>Two to four working days within the EU, a week elsewhere.</template>
    <template #returns>Within 30 days, in the original packaging. The label is on us.</template>
    <template #gift>Not yet.</template>
  </AppAccordion>

  <DemoOutput>v-model: {{ open }}</DemoOutput>
</template>

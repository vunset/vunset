<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const COUNTRIES = [
  {
    label: 'Europe',
    options: [
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
      { value: 'is', label: 'Iceland', disabled: true }
    ]
  },
  {
    label: 'Americas',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'br', label: 'Brazil' }
    ]
  },
  { value: 'other', label: 'Somewhere else' }
];

const country = ref<string | null>('de');
</script>

<template>
  <FormSelect v-model="country" label="Country" :options="COUNTRIES" class="w-72" />

  <DemoOutput>v-model: {{ country }}</DemoOutput>
</template>

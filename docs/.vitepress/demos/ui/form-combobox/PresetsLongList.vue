<script setup lang="ts">
import { ref } from 'vue';
import { FormCombobox } from '@vunset/ui';

// Long enough to scroll, so the up arrow shows under the presets.
const COMPANIES = Array.from({ length: 40 }, (_, index) => ({ value: `c${index}`, label: `Company ${index + 1}` }));

const PRESETS = [
  { label: 'Top five', values: ['c0', 'c1', 'c2', 'c3', 'c4'] },
  { label: 'Last five', values: ['c35', 'c36', 'c37', 'c38', 'c39'] },
  {
    label: 'Regions',
    collapsed: true,
    presets: [
      { label: 'EU', values: ['c5', 'c6', 'c7'] },
      { label: 'US', values: ['c8', 'c9'] }
    ]
  }
];

const companies = ref<string[]>([]);
</script>

<template>
  <FormCombobox
    v-model="companies"
    label="Companies"
    multiple
    placeholder="Add a company"
    :flatten="4"
    :options="COMPANIES"
    :presets="PRESETS"
    presets-label="Presets"
    :preset-columns="2"
    max-height="14rem"
    class="w-72"
  />

  <DemoOutput>v-model: {{ companies }}</DemoOutput>
</template>

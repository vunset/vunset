<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckboxGroup } from '@vunset/ui';

const TOPICS = [
  { value: 'vue', label: 'Vue' },
  { value: 'css', label: 'CSS' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'rust', label: 'Rust', disabled: true }
];

const topics = ref(['css']);
</script>

<template>
  <FormCheckboxGroup v-model="topics" label="Topics" select-all="All topics" :options="TOPICS" />

  <DemoOutput>v-model: {{ topics }}</DemoOutput>
</template>

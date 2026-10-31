<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckboxGroup } from '@vunset/ui';

const TOPICS = [
  { value: 'vue', label: 'Vue' },
  { value: 'css', label: 'CSS', help: 'Cascading, still' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'rust', label: 'Rust', disabled: true }
];

const topics = ref(['vue']);
</script>

<template>
  <FormCheckboxGroup v-model="topics" label="Topics" help="Pick any." :options="TOPICS" name="topics" />

  <DemoOutput>v-model: {{ topics }}</DemoOutput>
</template>

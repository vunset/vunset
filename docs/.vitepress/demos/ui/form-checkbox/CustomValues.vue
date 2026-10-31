<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckbox } from '@vunset/ui';

const newsletter = ref<'weekly' | 'never'>('never');
</script>

<template>
  <FormCheckbox
    v-model="newsletter"
    label="Send me the newsletter"
    true-value="weekly"
    false-value="never"
    help="One email a week, no more."
  />

  <DemoOutput>v-model: {{ newsletter }}</DemoOutput>
</template>

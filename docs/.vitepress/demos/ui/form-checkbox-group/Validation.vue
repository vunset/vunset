<script setup lang="ts">
import { ref } from 'vue';
import { FormCheckboxGroup } from '@vunset/ui';

const days = ref<string[]>([]);
</script>

<template>
  <FormCheckboxGroup
    v-model="days"
    label="Delivery days"
    required
    :options="['Mon', 'Wed', 'Fri']"
    :error="days.length ? undefined : 'Pick at least one day'"
  />

  <DemoOutput>v-model: {{ days }}</DemoOutput>
</template>

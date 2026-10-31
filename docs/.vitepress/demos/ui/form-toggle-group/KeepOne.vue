<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup } from '@vunset/ui';
import type { ToggleGroupValue } from '@vunset/vue';

const period = ref<ToggleGroupValue>('week');
</script>

<template>
  <FormToggleGroup
    v-model="period"
    label="Period"
    keep-one
    :options="[
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' }
    ]"
  />

  <DemoOutput>v-model: {{ period }}</DemoOutput>
</template>

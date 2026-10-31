<script setup lang="ts">
import { ref } from 'vue';
import { FormDatepicker } from '@vunset/ui';

const period = ref<string[]>([]);
</script>

<template>
  <FormDatepicker
    v-model.iso="period"
    label="Period"
    mode="range"
    preset="last-30"
    with-year
    with-quarters
    max-today
    class="w-72"
  />

  <DemoOutput>v-model: {{ JSON.stringify(period) }}</DemoOutput>
</template>

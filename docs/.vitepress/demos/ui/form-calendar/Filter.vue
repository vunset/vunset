<script setup lang="ts">
import { ref } from 'vue';
import { FormCalendar } from '@vunset/ui';

const period = ref<string[]>([]);
</script>

<template>
  <FormCalendar v-model.iso="period" label="Period" mode="range" preset="last-30" max-today />

  <DemoOutput>v-model: {{ JSON.stringify(period) }}</DemoOutput>
</template>

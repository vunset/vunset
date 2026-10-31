<script setup lang="ts">
import { ref } from 'vue';
import { FormDatepicker } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const range = ref<CalendarValue>([]);
</script>

<template>
  <FormDatepicker v-model="range" label="Dates" mode="range" placeholder="Pick dates" :presets="false" class="w-72" />

  <DemoOutput>v-model: {{ Array.isArray(range) ? range.map((day) => day.toDateString()).join(' → ') : '' }}</DemoOutput>
</template>

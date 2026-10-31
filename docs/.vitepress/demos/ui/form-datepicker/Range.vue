<script setup lang="ts">
import { ref } from 'vue';
import { FormDatepicker } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const trip = ref<CalendarValue>([]);
</script>

<template>
  <FormDatepicker
    v-model="trip"
    label="Trip"
    mode="range"
    placeholder="Pick dates"
    :presets="['last-7', 'last-30', 'this-month', 'last-month']"
    class="w-72"
  />

  <DemoOutput>v-model: {{ Array.isArray(trip) ? trip.map((day) => day.toDateString()).join(' → ') : '' }}</DemoOutput>
</template>

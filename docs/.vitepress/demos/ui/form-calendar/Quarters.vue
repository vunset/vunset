<script setup lang="ts">
import { ref } from 'vue';
import { FormCalendar } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const period = ref<CalendarValue>([]);
</script>

<template>
  <FormCalendar v-model="period" label="Period" mode="range" with-year with-quarters />

  <DemoOutput>v-model: {{ Array.isArray(period) ? period.map((day) => day.toDateString()).join(' → ') : '' }}</DemoOutput>
</template>

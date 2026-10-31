<script setup lang="ts">
import { ref } from 'vue';
import { FormCalendar } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const stay = ref<CalendarValue>([]);
</script>

<template>
  <FormCalendar v-model="stay" label="Stay" mode="range" :presets="['today', 'last-7', 'this-month', 'last-month']" />

  <DemoOutput>v-model: {{ Array.isArray(stay) ? stay.map((day) => day.toDateString()).join(' → ') : '' }}</DemoOutput>
</template>

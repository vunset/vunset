<script setup lang="ts">
import { ref } from 'vue';
import { FormCalendar } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const due = ref<CalendarValue>(null);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
</script>

<template>
  <FormCalendar
    v-model="due"
    label="Due"
    :min="new Date()"
    :is-date-disabled="isWeekend"
    :error="due ? undefined : 'Pick a weekday'"
  />
</template>

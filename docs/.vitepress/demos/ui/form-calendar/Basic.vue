<script setup lang="ts">
import { ref } from 'vue';
import { FormCalendar } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const arrival = ref<CalendarValue>(null);
</script>

<template>
  <FormCalendar v-model="arrival" label="Arrival" help="Check-in from 3pm." name="arrival" />

  <DemoOutput>v-model: {{ arrival instanceof Date ? arrival.toDateString() : 'null' }}</DemoOutput>
</template>

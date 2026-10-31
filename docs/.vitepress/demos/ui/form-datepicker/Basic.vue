<script setup lang="ts">
import { ref } from 'vue';
import { FormDatepicker } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const arrival = ref<CalendarValue>(null);
</script>

<template>
  <FormDatepicker v-model="arrival" label="Arrival" help="Check-in from 3pm." placeholder="Pick a date" class="w-72" />

  <DemoOutput>v-model: {{ arrival instanceof Date ? arrival.toDateString() : 'null' }}</DemoOutput>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FormDatepicker } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const days = ref<CalendarValue>([]);
</script>

<template>
  <FormDatepicker v-model="days" label="Days off" mode="multiple" placeholder="Pick days" class="w-72" />

  <DemoOutput>v-model: {{ Array.isArray(days) ? days.length : 0 }} days</DemoOutput>
</template>

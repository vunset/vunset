<script setup lang="ts">
import { ref } from 'vue';
import { FormDatepicker } from '@vunset/ui';
import type { CalendarValue } from '@vunset/vue';

const start = ref<CalendarValue>(null);
</script>

<template>
  <FormDatepicker
    v-model="start"
    label="Start date"
    required
    placeholder="Pick a date"
    :error="start ? undefined : 'A start date is required'"
    class="w-72"
  />
</template>

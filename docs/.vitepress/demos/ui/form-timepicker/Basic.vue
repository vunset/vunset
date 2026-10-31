<script setup lang="ts">
import { ref } from 'vue';
import { FormTimepicker } from '@vunset/ui';

const time = ref<string | null>('09:30');
</script>

<template>
  <FormTimepicker v-model="time" label="Meeting" help="Your local time." clearable class="w-56" />

  <DemoOutput>v-model: {{ time ?? 'null' }}</DemoOutput>
</template>

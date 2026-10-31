<script setup lang="ts">
import { ref } from 'vue';
import { FormTimepicker } from '@vunset/ui';

const alarm = ref<string | null>('07:15');
</script>

<template>
  <FormTimepicker v-model="alarm" label="Alarm" :hour-cycle="12" class="w-56" />

  <DemoOutput>v-model: {{ alarm ?? 'null' }}</DemoOutput>
</template>

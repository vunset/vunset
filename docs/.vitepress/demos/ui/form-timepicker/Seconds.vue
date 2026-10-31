<script setup lang="ts">
import { ref } from 'vue';
import { FormTimepicker } from '@vunset/ui';

const lap = ref<string | null>(null);
</script>

<template>
  <FormTimepicker v-model="lap" label="Lap time" seconds class="w-56" />

  <DemoOutput>v-model: {{ lap ?? 'null' }}</DemoOutput>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup, AppIcon } from '@vunset/ui';
import type { ToggleGroupValue } from '@vunset/vue';

const period = ref<ToggleGroupValue>('week');
</script>

<template>
  <FormToggleGroup v-model.lowercase="period" label="Period" keep-one :options="['Day', 'Week', 'Month']">
    <template #start><AppIcon name="calendar" /></template>
    <template #end>UTC</template>
  </FormToggleGroup>

  <DemoOutput>v-model: {{ period }}</DemoOutput>
</template>

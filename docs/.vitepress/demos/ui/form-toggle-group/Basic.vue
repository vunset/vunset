<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup } from '@vunset/ui';
import type { ToggleGroupValue } from '@vunset/vue';

const VIEWS = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'board', label: 'Board', disabled: true }
];

const view = ref<ToggleGroupValue>('grid');
</script>

<template>
  <FormToggleGroup v-model="view" label="View" help="How to show the items." :options="VIEWS" name="view" />

  <DemoOutput>v-model: {{ view }}</DemoOutput>
</template>

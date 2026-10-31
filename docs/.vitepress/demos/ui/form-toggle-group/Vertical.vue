<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup } from '@vunset/ui';
import type { ToggleGroupValue } from '@vunset/vue';

const align = ref<ToggleGroupValue>('left');
</script>

<template>
  <FormToggleGroup
    v-model="align"
    label="Align"
    orientation="vertical"
    :options="[
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' }
    ]"
  />

  <DemoOutput>v-model: {{ align }}</DemoOutput>
</template>

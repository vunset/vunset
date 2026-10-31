<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup } from '@vunset/ui';
import type { ToggleGroupValue } from '@vunset/vue';

const style = ref<ToggleGroupValue>(['bold']);
</script>

<template>
  <FormToggleGroup
    v-model="style"
    label="Style"
    multiple
    :options="[
      { value: 'bold', label: 'Bold' },
      { value: 'italic', label: 'Italic' },
      { value: 'underline', label: 'Underline' }
    ]"
  />

  <DemoOutput>v-model: {{ style }}</DemoOutput>
</template>

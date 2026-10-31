<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup } from '@vunset/ui';
import type { ToggleGroupValue } from '@vunset/vue';

const size = ref<ToggleGroupValue>(null);
</script>

<template>
  <FormToggleGroup
    v-model="size"
    label="Size"
    required
    :options="['S', 'M', 'L', 'XL']"
    :error="size ? undefined : 'Pick a size'"
  />

  <DemoOutput>v-model: {{ size }}</DemoOutput>
</template>

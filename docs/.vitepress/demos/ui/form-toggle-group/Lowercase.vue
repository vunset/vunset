<script setup lang="ts">
import { ref } from 'vue';
import { FormToggleGroup } from '@vunset/ui';
import type { ToggleGroupValue } from '@vunset/vue';

const size = ref<ToggleGroupValue>('m');
</script>

<template>
  <FormToggleGroup v-model.lowercase="size" label="Size" :options="['S', 'M', 'L', 'XL']" name="size" />

  <DemoOutput>v-model: {{ size }}</DemoOutput>
</template>

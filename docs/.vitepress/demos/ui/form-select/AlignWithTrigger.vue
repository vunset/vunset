<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const size = ref<string | null>('M');
</script>

<template>
  <FormSelect
    v-model="size"
    label="Size"
    align-with-trigger
    :clearable="false"
    :options="['XS', 'S', 'M', 'L', 'XL']"
    class="w-40"
  />

  <DemoOutput>v-model: {{ size }}</DemoOutput>
</template>

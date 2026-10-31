<script setup lang="ts">
import { ref } from 'vue';
import { FormSelect } from '@vunset/ui';

const CITIES = Array.from({ length: 10_000 }, (_, i) => ({
  value: i,
  label: `City ${String(i + 1).padStart(5, '0')}`
}));

const city = ref<number | null>(4999);
</script>

<template>
  <FormSelect v-model="city" label="City" searchable virtual :max-height="240" :options="CITIES" class="w-72" />

  <DemoOutput>v-model: {{ city }}</DemoOutput>
</template>

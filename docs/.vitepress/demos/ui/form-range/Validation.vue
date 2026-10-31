<script setup lang="ts">
import { ref } from 'vue';
import { FormRange } from '@vunset/ui';

const budget = ref(60);
</script>

<template>
  <FormRange v-model="budget" label="Budget" :error="budget > 50 ? 'Over the monthly limit' : undefined" class="w-72" />

  <DemoOutput>v-model: {{ budget }}</DemoOutput>
</template>

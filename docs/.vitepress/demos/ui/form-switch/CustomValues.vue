<script setup lang="ts">
import { ref } from 'vue';
import { FormSwitch } from '@vunset/ui';

const plan = ref<'monthly' | 'yearly'>('monthly');
</script>

<template>
  <FormSwitch v-model="plan" label="Bill yearly" true-value="yearly" false-value="monthly" />

  <DemoOutput>v-model: {{ plan }}</DemoOutput>
</template>

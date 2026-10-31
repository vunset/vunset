<script setup lang="ts">
import { ref } from 'vue';
import { FormRadioGroup } from '@vunset/ui';

const PLANS = [
  { value: 'free', label: 'Free', price: '$0' },
  { value: 'pro', label: 'Pro', price: '$12' },
  { value: 'team', label: 'Team', price: '$40' }
];

const plan = ref('pro');
</script>

<template>
  <FormRadioGroup v-model="plan" label="Plan" :options="PLANS" class="w-56">
    <template #option="{ label, option }">
      <span class="flex w-full justify-between gap-3">
        <span>{{ label }}</span>
        <span class="opacity-60">{{ option.price }}</span>
      </span>
    </template>
  </FormRadioGroup>

  <DemoOutput>v-model: {{ plan }}</DemoOutput>
</template>
